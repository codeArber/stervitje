// FILE: src/ui/plan/edit/SessionEditor.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanSession, PlanExercise, AddPlanSessionExercisePayload } from '@/types/plan';
import type { Exercise } from '@/types/exercise';


// --- CHILD COMPONENT & DIALOG ---
import { ExerciseGroupEditor } from './ExerciseGroupEditor';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAddPlanSessionExerciseMutation } from '@/api/plan'; // Import the mutation hook
import { ExerciseSelectorDialog } from '../plan-editor/ExerciseSelectorDialog';


interface SessionEditorProps {
  // We only need the indexes to locate the session within the Zustand store
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  canEdit: boolean;
}

export const SessionEditor: React.FC<SessionEditorProps> = ({
  weekIndex,
  dayIndex,
  sessionIndex,
  canEdit,
}) => {
  // --- STATE MANAGEMENT ---
  const { plan, addExercise: addExerciseToStore } = usePlanEditor();
  const { mutate: addExerciseMutation, isPending: isAddingExercise } = useAddPlanSessionExerciseMutation();
  
  const session = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex];
  const exercises = session?.exercises ?? [];

  const exerciseGroups = React.useMemo(() => {
    const groups = exercises.reduce((acc, exercise) => {
      const groupKey = exercise.execution_group;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(exercise);
      return acc;
    }, {} as Record<number, PlanExercise[]>);
    return Object.values(groups).slice().sort((a, b) => a[0].order_within_session - b[0].order_within_session);
  }, [exercises]);

  if (!session) {
    return null;
  }

  // --- HANDLER WITH REAL MUTATION ---
  const handleAddExercise = (exerciseId: string, exerciseDetails: Exercise) => {
    const nextOrder = exercises.length > 0 ? Math.max(...exercises.map(e => e.order_within_session)) + 1 : 1;

    const payload: AddPlanSessionExercisePayload = {
      p_plan_session_id: session.id,
      p_exercise_id: exerciseId,
      p_order_within_session: nextOrder,
      // You can add default values for other fields if your RPC requires them
      p_execution_group: nextOrder, // Default to its own group
    };
    
    const toastId = toast.loading(`Adding "${exerciseDetails.name}"...`);
    addExerciseMutation(payload, {
        onSuccess: (newExerciseData) => {
            // Instead of refetching the whole plan, we can just add the new exercise to the store.
            // This provides a faster, more optimistic UI update.
            // The `newExerciseData` is the response from your `add_plan_session_exercise` RPC.
            addExerciseToStore(weekIndex, dayIndex, sessionIndex, newExerciseData);
            toast.success(`"${exerciseDetails.name}" added successfully!`, { id: toastId });
        },
        onError: (err) => {
            toast.error(`Failed to add exercise: ${err.message}`, { id: toastId });
        },
    });
  };

  return (
    <Card className="border-l-4 border-primary/50 bg-background/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{session.title || 'Workout Session'}</CardTitle>
            <CardDescription className="mt-2">
              {session.notes || "No notes for this session."}
            </CardDescription>
          </div>
          
          {/* Use the ExerciseSelectorDialog component */}
          <ExerciseSelectorDialog onSelectExercise={handleAddExercise}>
            <Button size="sm" className="shrink-0" disabled={!canEdit || isAddingExercise}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isAddingExercise ? 'Adding...' : 'Add Exercise'}
            </Button>
          </ExerciseSelectorDialog>

        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {exerciseGroups.length > 0 ? (
          exerciseGroups.map((groupExercises, index) => {
             const firstExerciseInGroup = groupExercises[0];
             const originalExerciseIndex = exercises.findIndex(ex => ex.id === firstExerciseInGroup.id);

            return (
              <ExerciseGroupEditor
                key={index}
                exercises={groupExercises}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                sessionIndex={sessionIndex}
                exerciseStartIndex={originalExerciseIndex}
                canEdit={canEdit}
              />
            )
          })
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">
            No exercises yet. Click "Add Exercise" to build this session.
          </p>
        )}
      </CardContent>
    </Card>
  );
};