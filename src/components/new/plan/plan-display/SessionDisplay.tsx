// FILE: src/components/plan-display/SessionDisplay.tsx

import React from 'react';
import type { PlanSession, PlanExercise } from '@/types/plan';

// --- Child Component ---
import { ExerciseGroupDisplay } from './ExerciseGroupDisplay';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, AlertTriangle } from 'lucide-react'; // <-- Import AlertTriangle
import { shallow, useNavigate } from '@tanstack/react-router';

// --- MODIFIED: Import the zustand store ---
import { useWorkoutStore } from '@/stores/workout-store';

import { useStartWorkoutMutation } from '@/api/plan';
import { toast } from 'sonner';

interface SessionDisplayProps {
  session: PlanSession;
  isPlanStarted: boolean;
}

export const SessionDisplay: React.FC<SessionDisplayProps> = ({ session, isPlanStarted }) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { mutate: startWorkoutMutation, isPending } = useStartWorkoutMutation();

  // --- MODIFIED: Get state and actions directly from your Zustand store ---
  const activeSessionLog = useWorkoutStore((state) => state.activeSessionLog);
const isLoading = useWorkoutStore((state) => state.isLoading);
const startWorkoutInStore = useWorkoutStore((state) => state.startWorkout);

  // Determine if there is an active session and if it's different from this one
  const isAnotherSessionActive = activeSessionLog && activeSessionLog.plan_session_id !== session.id;

  const handleStartWorkout = () => {
    // SCENARIO 1: A different workout is already in progress.
    if (isAnotherSessionActive) {
      toast.warning("You have another workout in progress.", {
        description: "Please complete or discard your active session before starting a new one.",
        action: {
          label: 'Go to Active Session',
          onClick: () => navigate({ to: '/workout' }),
        },
      });
      return;
    }

    // SCENARIO 2: This exact session is already active (resuming).
    if (activeSessionLog && activeSessionLog.plan_session_id === session.id) {
      toast.info("Resuming your workout session.");
      navigate({ to: '/workout' });
      return;
    }

    // SCENARIO 3: No session is active. Proceed to create a new one.
    const toastId = toast.loading("Starting your session...");
    startWorkoutMutation(session.id, {
      onSuccess: (newSessionLog) => {
        startWorkoutInStore(newSessionLog, session);
        toast.success("Workout started!", { id: toastId });
        navigate({ to: '/workout' });
      },
      onError: (err) => {
        // This is now a true fallback, not the common case.
        toast.error(`Failed to start session: ${err.message}`, { id: toastId });
      },
    });
  };

  const exerciseGroups = React.useMemo(() => {
    if (!session?.exercises) return [];
    const groups = session.exercises.reduce((acc, exercise) => {
      const groupKey = exercise.execution_group;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(exercise);
      return acc;
    }, {} as Record<number, PlanExercise[]>);
    return Object.values(groups).slice().sort((a, b) => a[0].order_within_session - b[0].order_within_session);
  }, [session]);

  // Combined loading/pending state
  const isBusy = isPending || isLoading;

  return (
    <Card className="border-l-4 border-primary/50 bg-background/50 relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{session.title || 'Workout Session'}</CardTitle>
            {session.notes && (
              <CardDescription className="mt-2">
                {session.notes}
              </CardDescription>
            )}
          </div>
          {isPlanStarted && (
            <Button
              size="sm"
              className="shrink-0"
              onClick={handleStartWorkout}
              disabled={isBusy}
            >
              {isAnotherSessionActive ? (
                <AlertTriangle className="mr-2 h-4 w-4" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              {isBusy ? 'Checking...' : 'Start'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {exerciseGroups.length > 0 ? (
          exerciseGroups.map((groupExercises, index) => {
            const isSuperset = groupExercises.length > 1;
            const postGroupRest = groupExercises[groupExercises.length - 1]?.post_group_rest_seconds;

            return (
              <ExerciseGroupDisplay
                key={index}
                exercises={groupExercises}
                isSuperset={isSuperset}
                postGroupRest={postGroupRest}
              />
            );
          })
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">
            No exercises have been added to this session.
          </p>
        )}
      </CardContent>
    </Card>
  );
};