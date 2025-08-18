// FILE: src/routes/_layout/plans/$planId/$sessionId.tsx

import React, { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

// --- Placeholder Data & Types ---
// In the final version, you'll replace this with a real API call.
// For now, it helps us build the UI with the correct data shape.
import type { PlanSession, PlanExercise, PlanSet } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AlertTriangle, ArrowLeft, Dumbbell, Edit, Info, Trash2, Zap } from 'lucide-react';
import { getExerciseImageUrl } from '@/types/storage';

// --- TanStack Route Definition ---
export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/plans/$planId/$sessionId/')({
  component: SessionDisplayPage,
});

// FILE: src/routes/_layout/plans/$planId/$sessionId.tsx
// ... (keep all your imports and other code the same) ...

// --- Mock Data (CORRECTED VERSION) ---
const mockSession: PlanSession = {
  id: 'session-123',
  plan_day_id: 'day-abc',
  order_index: 1,
  title: 'Upper Body Power',
  notes: 'Focus on explosive movements for the first superset. Maintain strict form on the isolation exercises.',
  is_completed_by_user: false,
  // FIX: Added created_at and updated_at to the session object
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  exercises: [
    {
      id: 'pse-1', plan_session_id: 'session-123', exercise_id: 'ex-bench', order_within_session: 1, execution_group: 1,
      notes: 'Pause for 1 second at the chest.', post_exercise_rest_seconds: 0, post_group_rest_seconds: 120,
      // FIX: Added created_at and updated_at to the exercise object
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercise_details: { id: 'ex-bench', name: 'Barbell Bench Press', image_url: 'bench-press.jpg' } as any,
      sets: [
        // FIX: Added all required fields to each set object
        { id: 'set-1a', plan_session_exercise_id: 'pse-1', set_number: 1, target_reps: 5, target_weight: 80, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
        { id: 'set-1b', plan_session_exercise_id: 'pse-1', set_number: 2, target_reps: 5, target_weight: 80, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
        { id: 'set-1c', plan_session_exercise_id: 'pse-1', set_number: 3, target_reps: 5, target_weight: 80, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
      ],
    },
    {
      id: 'pse-2', plan_session_id: 'session-123', exercise_id: 'ex-pullup', order_within_session: 2, execution_group: 2,
      notes: 'Aim for a full range of motion.', post_exercise_rest_seconds: 15, post_group_rest_seconds: 90,
      // FIX: Added created_at and updated_at to the exercise object
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercise_details: { id: 'ex-pullup', name: 'Weighted Pull-Ups', image_url: 'pull-up.jpg' } as any,
      sets: [
        // FIX: Added all required fields to each set object
        { id: 'set-2a', plan_session_exercise_id: 'pse-2', set_number: 1, target_reps: 8, target_weight: 10, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
        { id: 'set-2b', plan_session_exercise_id: 'pse-2', set_number: 2, target_reps: 8, target_weight: 10, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
      ],
    },
    {
      id: 'pse-3', plan_session_id: 'session-123', exercise_id: 'ex-dips', order_within_session: 3, execution_group: 2,
      notes: null, post_exercise_rest_seconds: 0, post_group_rest_seconds: 90,
      // FIX: Added created_at and updated_at to the exercise object
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercise_details: { id: 'ex-dips', name: 'Dips', image_url: 'dips.jpg' } as any,
      sets: [
        // FIX: Added all required fields to each set object
        { id: 'set-3a', plan_session_exercise_id: 'pse-3', set_number: 1, target_reps: 12, target_weight: null, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
        { id: 'set-3b', plan_session_exercise_id: 'pse-3', set_number: 2, target_reps: 12, target_weight: null, set_type: 'normal', notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
      ],
    },
    {
      id: 'pse-4', plan_session_id: 'session-123', exercise_id: 'ex-plank', order_within_session: 4, execution_group: 3,
      notes: 'Keep core tight.', post_exercise_rest_seconds: 0, post_group_rest_seconds: 0,
      // FIX: Added created_at and updated_at to the exercise object
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercise_details: { id: 'ex-plank', name: 'Plank', image_url: 'plank.jpg' } as any,
      sets: [
        // FIX: Added all required fields to the set object
        { id: 'set-4a', plan_session_exercise_id: 'pse-4', set_number: 1, target_duration_seconds: 60, set_type: 'for_time', target_reps: null, target_weight: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as PlanSet,
      ],
    },
  ],
};

// ... (The rest of your component file remains the same) ...
// --- Main Page Component ---
function SessionDisplayPage() {
  const { planId, sessionId } = Route.useParams();

  // --- State Simulation for Structure ---
  // In the real implementation, this will be replaced by your TanStack Query hook.
  const [session, setSession] = useState<PlanSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate a network request to fetch session data
    const timer = setTimeout(() => {
      // To test the error state, uncomment the line below:
      // setError(new Error("This session could not be found in the plan."));
      setSession(mockSession);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);
  // --- End of State Simulation ---

  // Group exercises by their `execution_group` to render supersets correctly
  const exerciseGroups = React.useMemo(() => {
    if (!session?.exercises) return {};
    return session.exercises.reduce((acc, exercise) => {
      const group = exercise.execution_group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(exercise);
      return acc;
    }, {} as Record<number, PlanExercise[]>);
  }, [session]);

  // --- Render Logic ---
  if (isLoading) {
    return <SessionDisplaySkeleton />;
  }

  if (error || !session) {
    return <ErrorScreen message={error?.message || "The requested session could not be found."} planId={planId} />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Header with Breadcrumbs and Actions */}
      <header className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/plans/$planId" params={{ planId }}>Plan Details</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{session.title || 'Session'}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">{session.title || 'Workout Session'}</h1>
          <div className="flex gap-2">
            {/* FUTURE: These buttons will trigger editing modals or pages */}
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Session</Button>
            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Session</Button>
          </div>
        </div>

        {session.notes && (
          <p className="text-lg text-muted-foreground p-4 bg-muted rounded-md border">{session.notes}</p>
        )}
      </header>

      <Separator />

      {/* Main Content: Exercise List */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Exercises</h2>
        <div className="space-y-4">
          {Object.entries(exerciseGroups).map(([groupKey, groupExercises]) => (
            <ExerciseInSessionCard key={groupKey} groupNumber={parseInt(groupKey)} exercises={groupExercises} />
          ))}
        </div>
      </section>
    </div>
  );
}

// --- Reusable Sub-components for this page ---

function ExerciseInSessionCard({ groupNumber, exercises }: { groupNumber: number, exercises: PlanExercise[] }) {
  const isSuperset = exercises.length > 1;

  return (
    <Card className={isSuperset ? 'border-2 border-primary/20 bg-primary/5' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isSuperset && <Zap className="h-5 w-5 text-primary" />}
            {isSuperset ? `Superset ${groupNumber}` : exercises[0].exercise_details.name}
          </span>
          {/* Placeholder for adding a new exercise to this session/group */}
          <Button variant="ghost" size="sm" disabled>Add Exercise</Button>
        </CardTitle>
        {!isSuperset && (
          <CardDescription>{exercises[0].notes}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            {isSuperset && (
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{exercise.exercise_details.name}</h4>
                <p className="text-sm text-muted-foreground">{exercise.notes}</p>
              </div>
            )}

            {/* Sets Table/List */}
            <div className="space-y-2">
              {exercise.sets.map(set => (
                <div key={set.id} className="p-3 bg-background rounded-md border flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="w-16 justify-center">Set {set.set_number}</Badge>
                    <p className="font-mono">
                      {set.target_reps && <strong>{set.target_reps} reps</strong>}
                      {set.target_weight && ` x ${set.target_weight}kg`}
                      {set.target_duration_seconds && <strong>{set.target_duration_seconds} seconds</strong>}
                      {set.target_distance_meters && <strong>{set.target_distance_meters} meters</strong>}
                    </p>
                    {set.notes && <p className="italic text-muted-foreground">({set.notes})</p>}
                  </div>
                  {/* Placeholder for editing a specific set */}
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled><Edit className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Rest Timer Information */}
            {exercise.post_exercise_rest_seconds > 0 && (
              <p className="text-xs text-center text-muted-foreground">Rest {exercise.post_exercise_rest_seconds} seconds before next exercise</p>
            )}

            {/* Separator for supersets */}
            {isSuperset && index < exercises.length - 1 && <Separator />}
          </React.Fragment>
        ))}
        {exercises[0].post_group_rest_seconds > 0 && (
          <p className="text-sm text-center font-semibold text-primary pt-2">Rest {exercises[0].post_group_rest_seconds} seconds after completing the group</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Skeleton and Error Components ---

function SessionDisplaySkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8 animate-pulse">
      <header className="space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-16 w-full" />
      </header>
      <Separator />
      <section className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    </div>
  );
}

function ErrorScreen({ message, planId }: { message: string, planId: string }) {
  return (
    <div className="container py-16 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold mt-4 mb-2">Could Not Load Session</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link to="/plans/$planId" params={{ planId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plan
        </Link>
      </Button>
    </div>
  );
}