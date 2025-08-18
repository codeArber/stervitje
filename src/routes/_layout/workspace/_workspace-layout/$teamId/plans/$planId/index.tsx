// FILE: src/routes/_layout/workspace/$teamId/plans/$planId/index.tsx

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { usePlanDetailsQuery, useStartWorkoutMutation, useStartPlanForUserMutation } from '@/api/plan';
import { toast } from 'sonner';
import dayjs from 'dayjs';

// Types
import type { FullPlan, PlanDay, PlanExercise, PlanSession, PlanSet, PlanWeek, UserPlanStatus } from '@/types/plan';
import type { Tag } from '@/types/exercise';
import type { Tables } from '@/types/database.types';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  Dumbbell, PlayCircle, Star, Trophy, Calendar, Info, ShieldCheck, Zap, PlusCircle,
  Edit, Lock, Unlock, FileText
} from 'lucide-react';
import { useWorkoutStore } from '@/stores/workout-store';
import { getExerciseImageUrl } from '@/types/storage';
import { PlanDisplay } from '@/components/new/plan/plan-display/PlanDisplay';

export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/plans/$planId/')({
  component: WorkspacePlanDetailsPage,
});

function WorkspacePlanDetailsPage() {
  const { teamId, planId } = Route.useParams();
  const navigate = useNavigate();
  const { data: planDetails, isLoading, isError, error } = usePlanDetailsQuery(planId);

  const { mutate: startPlanMutation, isPending: isStartingPlan } = useStartPlanForUserMutation();

  if (isLoading) return <PlanDetailsPageSkeleton />;
  if (isError || !planDetails || !planDetails.plan) return (
    <div className="container mx-auto py-8 text-destructive text-center">
      Error loading plan: {error?.message || "Plan not found."}
    </div>
  );

  const { plan, creator, goals, required_equipment, hierarchy, user_plan_status, can_edit } = planDetails;

  // Determine if the plan has been started by the current user
  const isPlanStarted = !!user_plan_status;

  const handleStartPlan = () => {
    const toastId = toast.loading('Starting your plan...');
    startPlanMutation(plan.id, {
      onSuccess: () => {
        toast.success('Plan started successfully!', { id: toastId });
      },
      onError: (err) => {
        toast.error(`Error starting plan: ${err.message}`, { id: toastId });
      }
    });
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      {/* Plan Header */}
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">{plan.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6"><AvatarImage src={creator.profile_image_url || undefined} /><AvatarFallback>{(creator.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <span>Created by {creator.full_name || creator.username}</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /><span>Level {plan.difficulty_level}/5</span></div>
              <span>|</span>
              <div className="flex items-center gap-1">{plan.private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}<span>{plan.private ? 'Private' : 'Public'}</span></div>
            </div>
          </div>
          {/* Action Buttons: Start Plan / Edit Plan */}
          <div className="flex flex-col sm:flex-row gap-2">
            {!isPlanStarted && (
              <Button size="lg" onClick={handleStartPlan} disabled={isStartingPlan}>
                <PlusCircle className="mr-2 h-5 w-5" /> Start This Plan
              </Button>
            )}
            {can_edit && (
              <Button asChild variant="outline" size="lg">
                <Link to="/workspace/$teamId/plans/$planId/edit" params={{ teamId: teamId, planId: plan.id }}>
                  <Edit className="mr-2 h-5 w-5" /> Edit Plan
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{plan.description}</p>
      </header>

      <Separator />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanGoalsCard goals={goals} />
        <RequiredEquipmentCard equipment={required_equipment} />
      </div>

      <Separator />

      {/* Plan Hierarchy */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Workout Schedule</h2>
        <div className="space-y-4">
          {/* --- FIX: Safely access hierarchy.weeks --- */}

          <PlanDisplay planDetails={planDetails} />
        </div>
      </section>
    </div>
  );
}


// --- Sub-components for the Page (Display Only) ---

function PlanGoalsCard({ goals }: { goals: FullPlan['goals'] }) {
  if (!goals || goals.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-green-500" /><span>Plan Goals</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 mt-1 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold">{goal.title}</p>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RequiredEquipmentCard({ equipment }: { equipment: Tag[] | null }) {
  if (!equipment || equipment.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-blue-500" /><span>Required Equipment</span></CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {equipment.map(item => <Badge key={item.id} variant="secondary">{item.name}</Badge>)}
      </CardContent>
    </Card>
  );
}

// Display component for a Week - now expanded by default
function WeekDisplayComponent({ week, isPlanStarted }: { week: PlanWeek & { days: PlanDay[] }; isPlanStarted: boolean }) {
  const allDayIds = (week.days || []).map(day => `day-${day.id}`); // Collect all day IDs for Accordion value
  return (
    <Card>
      <CardHeader>
        <CardTitle>Week {week.week_number}</CardTitle>
        {week.description && <CardDescription>{week.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* Changed type to "multiple" and value to allDayIds for full expansion */}
        {(week.days || []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No days defined for this week.</p>
        ) : (
          <Accordion type="multiple" value={allDayIds} className="w-full">
            {(week.days || []).map(day => <DayDisplayComponent key={day.id} day={day} isPlanStarted={isPlanStarted} />)}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

// Display component for a Day - now expanded by default
function DayDisplayComponent({ day, isPlanStarted }: { day: PlanDay & { sessions: PlanSession[] }; isPlanStarted: boolean }) {
  const allSessionIds = (day.sessions || []).map(session => session.id); // Collect all session IDs
  return (
    <AccordionItem value={`day-${day.id}`}> {/* Using day ID as value */}
      <AccordionTrigger className="font-semibold">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4" />
          <span>Day {day.day_number}: {day.title || 'Workout'} {day.is_rest_day && '(Rest Day)'}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6 space-y-4">
        {day.is_rest_day ? (
          <p className="text-muted-foreground">This is a scheduled rest day.</p>
        ) : (
          (day.sessions || []).length === 0 ? (
            <p className="text-muted-foreground text-sm">No sessions defined for this day.</p>
          ) : (
            // Changed type to "multiple" and value to allSessionIds for full expansion
            <Accordion type="multiple" value={allSessionIds} className="w-full">
              {(day.sessions || []).map(session => <SessionDisplayComponent key={session.id} session={session} isPlanStarted={isPlanStarted} />)}
            </Accordion>
          )
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// Display component for a Session - now expanded by default
function SessionDisplayComponent({ session, isPlanStarted }: { session: PlanSession & { exercises: PlanExercise[] }; isPlanStarted: boolean }) {
  const initializeWorkout = useWorkoutStore((state) => state.startWorkout);
  const { mutate: startWorkout, isPending } = useStartWorkoutMutation();
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    const toastId = toast.loading('Preparing your session...');

    startWorkout(session.id, {
      onSuccess: (newSessionLog) => {
        initializeWorkout(newSessionLog, session);
        toast.success('Session started! Let\'s go!', { id: toastId });
        navigate({
          to: '/workout/$sessionId',
          params: { sessionId: newSessionLog.id },
        });
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`, { id: toastId });
      }
    });
  };

  const allExerciseIds = (session.exercises || []).map(exercise => exercise.id); // Collect all exercise IDs
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-lg">{session.title || 'Workout Session'}</h4>
          {session.notes && <p className="text-sm text-muted-foreground">{session.notes}</p>}
        </div>
        {isPlanStarted && (
          <Button size="sm" onClick={handleStartWorkout} disabled={isPending}>
            <PlayCircle className="mr-2 h-4 w-4" /> Start
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {(session.exercises || []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No exercises defined for this session.</p>
        ) : (
          // Changed type to "multiple" and value to allExerciseIds for full expansion
          <Accordion type="multiple" value={allExerciseIds} className="w-full">
            {(session.exercises || []).map(exercise => <ExerciseDisplayComponent key={exercise.id} exercise={exercise} />)}
          </Accordion>
        )}
      </div>
    </div>
  );
}

// Display component for an Exercise
function ExerciseDisplayComponent({ exercise }: { exercise: PlanExercise & { sets: PlanSet[] } }) {
  const allSetIds = (exercise.sets || []).map(set => set.id); // Collect all set IDs
  const imageUrl = getExerciseImageUrl(exercise.exercise_details.image_url);

  return (
    <AccordionItem value={exercise.id}> {/* Use exercise ID as value */}
      <AccordionTrigger className="font-semibold text-base hover:no-underline">
        <div className="flex items-center gap-2">
          <img src={imageUrl || 'https://placehold.co/20x20?text=E'} alt={exercise.exercise_details.name} className="h-12 w-12 rounded-sm object-cover" />
          <p className="font-semibold">{exercise.exercise_details.name}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6 space-y-4">
        <div className="flex justify-end">
          <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }} className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
            <Info className="h-3 w-3" /> View Exercise Details
          </Link>
        </div>
        {exercise.notes && <p className="text-xs italic text-muted-foreground mt-1 pl-2 border-l-2">{exercise.notes}</p>}
        {exercise.execution_group > 1 && (
          <Badge variant="secondary" className="mt-1">Group {exercise.execution_group}</Badge>
        )}
        {exercise.post_exercise_rest_seconds > 0 && (
          <Badge variant="outline" className="mt-1 ml-1">Rest: {exercise.post_exercise_rest_seconds}s</Badge>
        )}
        {exercise.post_group_rest_seconds > 0 && (
          <Badge variant="outline" className="mt-1 ml-1">Group Rest: {exercise.post_group_rest_seconds}s</Badge>
        )}

        {/* Sets Display */}
        {(exercise.sets || []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No sets defined for this exercise.</p>
        ) : (
          // Changed type to "multiple" and value to allSetIds for full expansion
          <Accordion type="multiple" value={allSetIds} className="w-full">
            {(exercise.sets || []).map(set => (
              <div key={set.id} className="p-3 bg-muted rounded-md border-l-4 border-secondary/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Set {set.set_number}: </span>
                  {set.set_type !== 'normal' && <span className="font-medium capitalize mr-1">{set.set_type}: </span>}
                  {set.target_reps && <span>{set.target_reps} reps</span>}
                  {set.target_weight && <span> @ {set.target_weight} kg</span>}
                  {set.target_duration_seconds && <span> {set.target_duration_seconds}s</span>}
                  {set.target_distance_meters && <span> {set.target_distance_meters}m</span>}
                  {set.notes && <span className="italic ml-1">({set.notes})</span>}
                </div>
              </div>
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}


// --- Skeleton Component for Plan Details Page ---
function PlanDetailsPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <header className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-3 mt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-32" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </header>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
      </div>

      <Separator />

      <section>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </section>
    </div>
  );
}