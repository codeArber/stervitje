// FILE: src/components/plan-display/SessionDisplay.tsx

import React, { useState } from 'react';
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

import { usePendingBaselinesQuery, useStartWorkoutMutation } from '@/api/plan';
import { toast } from 'sonner';
import { SetBaselinesDialog } from '../SetBaselinesDialog';
import { WorkoutFlowDiagram } from '../../workout/WorkoutFlowDiagram';


interface SessionDisplayProps {
  session: PlanSession;
  isPlanStarted: boolean;
  planId: string; // Ensure planId is passed if needed by WorkoutFlowDiagram or sub-components
}

export const SessionDisplay: React.FC<SessionDisplayProps> = ({ session, isPlanStarted, planId }) => {
  const navigate = useNavigate();
  const startWorkoutInStore = useWorkoutStore((state) => state.startWorkout);
  const { mutate: startWorkoutMutation, isPending } = useStartWorkoutMutation();

  const [isBaselineDialogOpen, setIsBaselineDialogOpen] = useState(false);

  const { data: pendingBaselines, refetch } = usePendingBaselinesQuery(planId, { enabled: false });
  // console.log("Pending Baselines for SessionDisplay:", pendingBaselines); // Debugging

  const proceedToWorkout = (newSessionLog: any) => {
    startWorkoutInStore(newSessionLog, session);
    navigate({ to: '/workout' });
  };

  const handleStartWorkout = async () => {
    const { data: baselines } = await refetch();

    if (baselines && baselines.length > 0) {
      setIsBaselineDialogOpen(true);
    } else {
      const toastId = toast.loading("Starting your session...");
      startWorkoutMutation(session.id, {
        onSuccess: (newSessionLog) => {
          toast.success("Workout started!", { id: toastId });
          proceedToWorkout(newSessionLog);
        },
        onError: (err) => toast.error(`Failed to start: ${err.message}`, { id: toastId }),
      });
    }
  };

  const onBaselinesSet = () => {
    setIsBaselineDialogOpen(false);
    const toastId = toast.loading("Starting your session...");
    startWorkoutMutation(session.id, {
      onSuccess: (newSessionLog) => {
        toast.success("Workout started!", { id: toastId });
        proceedToWorkout(newSessionLog);
      },
      onError: (err) => toast.error(`Failed to start: ${err.message}`, { id: toastId }),
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
    // Sort groups by the order_within_session of their first exercise
    return Object.values(groups).sort((a, b) => a[0].order_within_session - b[0].order_within_session);
  }, [session]);

  return (
    <div className='w-full'>
      {pendingBaselines && (
        <SetBaselinesDialog
          isOpen={isBaselineDialogOpen}
          onClose={() => setIsBaselineDialogOpen(false)}
          onBaselinesSet={onBaselinesSet}
          goals={pendingBaselines}
        />
      )}
      {/* {exerciseGroups.length > 0 ? (
            // Render individual ExerciseGroupDisplay components
            exerciseGroups.map((groupExercises, index) => {
              const isSuperset = groupExercises.length > 1;
              const postGroupRest = groupExercises[groupExercises.length - 1]?.post_group_rest_seconds;

              return (
                <ExerciseGroupDisplay
                  key={index} // Use index or a unique ID for the key
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
          )} */}
    <div className="relative w-full ">
        {isPlanStarted  && (
        <Button size="sm" className="shrink-0 absolute right-2 top-2" onClick={handleStartWorkout} disabled={isPending}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {isPending ? 'Starting...' : 'Start'}
        </Button>
      )}
    </div>
      {/* NEW: Render WorkoutFlowDiagram ONCE after all groups */}
      {exerciseGroups.length > 0 && (
        <div className="mt-2 w-full">
          <WorkoutFlowDiagram
            exerciseGroups={exerciseGroups} // Pass all groups to the diagram
            containerWidth={800} // You can make this responsive if needed
          />
        </div>
      )}

    </div>
  );
};