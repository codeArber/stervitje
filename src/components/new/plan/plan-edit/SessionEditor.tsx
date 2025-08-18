// FILE: src/ui/plan/edit/SessionEditor.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanSession, PlanExercise, PlanSet } from '@/types/plan';
import type { Exercise } from '@/types/exercise';

// --- CHILD COMPONENT & DIALOG ---
import { ExerciseGroupEditor } from './ExerciseGroupEditor';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getNextTempId } from '@/utils/tempId';
import { ExerciseSelectorDialog } from '../plan-editor/ExerciseSelectorDialog';

// --- UTILITY ---

interface SessionEditorProps {
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
  // --- STATE MANAGEMENT (Corrected) ---
  const { plan, addExercise } = usePlanEditor(); // Get the addExercise action from the store
  
  const session = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex];
  const exercises = session?.exercises ?? [];

  const exerciseGroups = React.useMemo(() => {
    if (!exercises) return [];
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

  // --- HANDLER (Corrected - No Mutation) ---
  const handleAddExercise = (exerciseId: string, exerciseDetails: Exercise) => {
    const nextOrder = exercises.length > 0 ? Math.max(...exercises.map(e => e.order_within_session)) + 1 : 1;

    // Create a new exercise object that matches the PlanExercise type for our store
    const newExercise: PlanExercise = {
      id: getNextTempId('exercise'), // Use our stable temporary ID generator
      plan_session_id: session.id, // This can be a temporary session ID, which is fine
      exercise_id: exerciseId,
      order_within_session: nextOrder,
      execution_group: nextOrder, // Default to its own group
      notes: null,
      post_exercise_rest_seconds: 60, // Sensible default
      post_group_rest_seconds: 0,
      exercise_details: exerciseDetails, // The details we got from the selector
      sets: [], // Start with an empty array of sets
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Call the Zustand store action to optimistically add the exercise
    addExercise(weekIndex, dayIndex, sessionIndex, newExercise);
    toast.success(`"${exerciseDetails.name}" added to the session.`);
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
          
          <ExerciseSelectorDialog onSelectExercise={handleAddExercise}>
            <Button size="sm" className="shrink-0" disabled={!canEdit}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise
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
                key={firstExerciseInGroup.id} // Use a stable ID for the key
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