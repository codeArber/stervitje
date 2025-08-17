// FILE: /src/routes/_layout/plans/$planId/index.tsx

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { usePlanDetailsQuery, useStartPlanForUserMutation, useStartWorkoutMutation } from '@/api/plan';
import { useWorkoutStore } from '@/stores/workout-store';
import { toast } from 'sonner';

// Types
import type { FullPlan, PlanDay, PlanExercise, PlanSession, PlanWeek } from '@/types/plan';
import type { Tag } from '@/types/exercise';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Icons
import { Dumbbell, PlayCircle, Star, Trophy, Calendar, Info, ShieldCheck, Zap, PlusCircle, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/_layout/plans/$planId/')({
  component: PlanDetailsPage,
});

function PlanDetailsPage() {
  const { planId } = Route.useParams();
  const { data: planDetails, isLoading, isError, error } = usePlanDetailsQuery(planId);
  const { mutate: startPlan, isPending: isStartingPlan } = useStartPlanForUserMutation();

  if (isLoading) return <PlanDetailsSkeleton />;
  if (isError || !planDetails) return <ErrorScreen message={error?.message || "The requested plan could not be loaded."} />;

  const { plan, creator, goals, required_equipment, hierarchy, user_plan_status } = planDetails;
  const isPlanStarted = !!user_plan_status;

  const handleStartPlan = () => {
    const toastId = toast.loading('Starting plan...');
    startPlan(plan.id, {
      onSuccess: () => toast.success('Plan started! You can now begin your workouts.', { id: toastId }),
      onError: (err) => toast.error(`Error: ${err.message}`, { id: toastId }),
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">{plan.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6"><AvatarImage src={creator.profile_image_url || undefined} /><AvatarFallback>{(creator.full_name || 'U').charAt(0)}</AvatarFallback></Avatar>
              <span>By {creator.full_name || creator.username}</span> | <Star className="h-4 w-4 text-yellow-500" /><span>Level {plan.difficulty_level}/5</span>
            </div>
          </div>
          {!isPlanStarted && (
            <Button size="lg" onClick={handleStartPlan} disabled={isStartingPlan}>
              <PlusCircle className="mr-2 h-5 w-5" /> Start This Plan
            </Button>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{plan.description}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanGoalsCard goals={goals} />
        <RequiredEquipmentCard equipment={required_equipment} />
      </div>
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Workout Schedule</h2>
        <div className="space-y-4">
          {hierarchy.weeks.map(week => <WeekComponent key={week.id} week={week} isPlanStarted={isPlanStarted} />)}
        </div>
      </section>
    </div>
  );
}


// --- Sub-components for the Page ---

function PlanGoalsCard({ goals }: { goals: FullPlan['goals'] }) {
  if (!goals || goals.length === 0) return null;
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-green-500" /><span>Plan Goals</span></CardTitle></CardHeader>
      <CardContent className="space-y-3">{goals.map(goal => (<div key={goal.id} className="flex items-start gap-3"><ShieldCheck className="h-4 w-4 mt-1 text-green-500 shrink-0" /><div><p className="font-semibold">{goal.title}</p><p className="text-sm text-muted-foreground">{goal.description}</p></div></div>))}</CardContent>
    </Card>
  );
}

function RequiredEquipmentCard({ equipment }: { equipment: Tag[] | null }) {
    if (!equipment || equipment.length === 0) return null;
    return (
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-blue-500" /><span>Required Equipment</span></CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">{equipment.map(item => <Badge key={item.id} variant="secondary">{item.name}</Badge>)}</CardContent>
      </Card>
    );
}

// THE isPlanStarted PROP IS NOW CORRECTLY PASSED DOWN THE CHAIN
function WeekComponent({ week, isPlanStarted }: { week: PlanWeek, isPlanStarted: boolean }) {
  return (
    <Card><CardHeader><CardTitle>Week {week.week_number}</CardTitle>{week.description && <CardDescription>{week.description}</CardDescription>}</CardHeader>
      <CardContent><Accordion type="single" collapsible className="w-full">{week.days.map(day => <DayComponent key={day.id} day={day} isPlanStarted={isPlanStarted} />)}</Accordion></CardContent>
    </Card>
  );
}

function DayComponent({ day, isPlanStarted }: { day: PlanDay, isPlanStarted: boolean }) {
  return (
    <AccordionItem value={`day-${day.id}`}>
      <AccordionTrigger className="font-semibold"><div className="flex items-center gap-3"><Calendar className="h-4 w-4" /><span>Day {day.day_number}: {day.title || 'Workout'}</span></div></AccordionTrigger>
      <AccordionContent className="pl-6 space-y-4">{day.is_rest_day ? <p className="text-muted-foreground">This is a scheduled rest day.</p> : day.sessions.map(session => <SessionComponent key={session.id} session={session} isPlanStarted={isPlanStarted} />)}</AccordionContent>
    </AccordionItem>
  );
}

function SessionComponent({ session, isPlanStarted }: { session: PlanSession, isPlanStarted: boolean }) {
  const exerciseGroups = session.exercises.reduce((acc, exercise) => {
    const group = exercise.execution_group;
    if (!acc[group]) acc[group] = [];
    acc[group].push(exercise);
    return acc;
  }, {} as Record<number, PlanExercise[]>);

  // THE DEFINITIVE FIX FOR THE INFINITE LOOP:
  // Select each piece of state individually.
  const globalActiveSession = useWorkoutStore((state) => state.globalActiveSession);
  const checkGlobalActiveSession = useWorkoutStore((state) => state.checkGlobalActiveSession);
  const initializePlayer = useWorkoutStore((state) => state.initializePlayer);

  const { mutate: startWorkout, isPending } = useStartWorkoutMutation();
  const navigate = useNavigate();
  const { planId } = Route.useParams();

  const handleStartWorkout = () => {
    const toastId = toast.loading('Preparing your session...');
    startWorkout(session.id, {
      onSuccess: (newSessionLog) => {
        initializePlayer(newSessionLog, session);
        checkGlobalActiveSession();
        toast.success('Session started!', { id: toastId });
        navigate({ to: '/plans/$planId/workout/$sessionId', params: { planId, sessionId: newSessionLog.id } });
      },
      onError: (error) => toast.error(`Error: ${error.message}`, { id: toastId }),
    });
  };

  const renderButton = () => {
    // THE isPlanStarted PROP IS NOW CORRECTLY USED
    if (!isPlanStarted) return null;

    if (globalActiveSession && globalActiveSession.plan_session_id === session.id) {
      return (
        <Button size="sm" asChild>
          <Link to="/plans/$planId/workout/$sessionId" params={{ planId, sessionId: globalActiveSession.id }}>
            <PlayCircle className="mr-2 h-4 w-4" /> Continue
          </Link>
        </Button>
      );
    }
    if (globalActiveSession && globalActiveSession.plan_session_id !== session.id) {
      return (
        <Button size="sm" disabled variant="outline">
          Workout in Progress
        </Button>
      );
    }
    return (
      <Button size="sm" onClick={handleStartWorkout} disabled={isPending}>
        <PlayCircle className="mr-2 h-4 w-4" /> Start
      </Button>
    );
  };

  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-lg">{session.title || 'Workout Session'}</h4>
          {session.notes && <p className="text-sm text-muted-foreground">{session.notes}</p>}
        </div>
        {renderButton()}
      </div>
      <div className="space-y-4">{Object.values(exerciseGroups).map((group, index) => <ExerciseGroupComponent key={index} group={group} />)}</div>
    </div>
  );
}

function ExerciseGroupComponent({ group }: { group: PlanExercise[] }) {
    const isSuperset = group.length > 1;
    return (
      <div className={`p-3 rounded-lg ${isSuperset ? 'border-2 border-primary/20 bg-primary/5' : 'border'}`}>
        {isSuperset && (<div className="flex items-center gap-2 mb-3 px-1"><Zap className="h-4 w-4 text-primary" /><h5 className="font-semibold text-primary">Superset</h5></div>)}
        <div className="space-y-3">
          {group.map((exercise) => (
            <div key={exercise.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{exercise.exercise_details.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.sets.length} sets x {exercise.sets[0]?.target_reps || 'N/A'} reps</p>
                </div>
                <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }}><Info className="h-4 w-4 text-muted-foreground hover:text-primary" /></Link>
              </div>
              {exercise.notes && <p className="text-xs italic text-muted-foreground mt-1 pl-2 border-l-2">{exercise.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    );
}

const ErrorScreen = ({ message }: { message: string }) => (
    <div className="container py-8 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold mt-4 mb-2">Something Went Wrong</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-6"><Link to="/dashboard">Go to Dashboard</Link></Button>
    </div>
);

const PlanDetailsSkeleton = () => (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <header className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-3 mt-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-5 w-48" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
      </div>
      <section>
        <Skeleton className="h-8 w-1/3 mb-4" /><div className="space-y-4"><Skeleton className="h-48 w-full" /></div>
      </section>
    </div>
);