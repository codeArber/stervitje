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

interface SessionDisplayProps {
  session: PlanSession;
  isPlanStarted: boolean;
}

export const SessionDisplay: React.FC<{ session: PlanSession, isPlanStarted: boolean, planId: string }> = ({ session, isPlanStarted, planId }) => {
  const navigate = useNavigate();
  const startWorkoutInStore = useWorkoutStore((state) => state.startWorkout);
  const { mutate: startWorkoutMutation, isPending } = useStartWorkoutMutation();
  
  // State to manage the baseline dialog
  const [isBaselineDialogOpen, setIsBaselineDialogOpen] = useState(false);
  
  // This query will only run when the user clicks the start button
  const { data: pendingBaselines, refetch } = usePendingBaselinesQuery(planId, { enabled: false });
  console.log(pendingBaselines);

  const proceedToWorkout = (newSessionLog: any) => {
      startWorkoutInStore(newSessionLog, session);
      navigate({ to: '/workout' });
  };

  const handleStartWorkout = async () => {
    // Step 1: Check for pending baselines
    const { data: baselines } = await refetch();
    
    if (baselines && baselines.length > 0) {
      // Step 2: If baselines exist, open the dialog
      setIsBaselineDialogOpen(true);
    } else {
      // Step 3: If no baselines, start the workout directly
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
      // After baselines are set, we can now start the workout session
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
    return Object.values(groups).slice().sort((a, b) => a[0].order_within_session - b[0].order_within_session);
  }, [session]);

  return (
    <>
      {/* The Dialog is here but only opens when needed */}
      {pendingBaselines && (
        <SetBaselinesDialog
            isOpen={isBaselineDialogOpen}
            onClose={() => setIsBaselineDialogOpen(false)}
            onBaselinesSet={onBaselinesSet}
            goals={pendingBaselines}
        />
      )}
      
      {/* The actual session card UI */}
      <Card className="border-l-4 border-primary/50 bg-background/50 relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div><CardTitle>{session.title || 'Workout Session'}</CardTitle></div>
            {isPlanStarted && (
              <Button size="sm" className="shrink-0" onClick={handleStartWorkout} disabled={isPending}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {isPending ? 'Starting...' : 'Start'}
              </Button>
            )}
          </div>
        </CardHeader>
        {/* ... rest of the card content ... */}
      </Card>
       {/* The actual session card UI */}
      <Card className="border-l-4 border-primary/50 bg-background/50 relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div><CardTitle>{session.title || 'Workout Session'}</CardTitle></div>
            {isPlanStarted && (
              <Button size="sm" className="shrink-0" onClick={handleStartWorkout} disabled={isPending}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {isPending ? 'Starting...' : 'Start'}
              </Button>
            )}
          </div>
        </CardHeader>
        {/* ... rest of the card content ... */}
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
    </>
  );
};