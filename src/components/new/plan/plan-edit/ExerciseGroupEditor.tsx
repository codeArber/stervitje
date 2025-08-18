// FILE: src/ui/plan/edit/ExerciseGroupEditor.tsx

import React from 'react';
import type { PlanExercise } from '@/types/plan';
import { ExerciseEditorCard } from './ExerciseEditorCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Zap } from 'lucide-react';

interface ExerciseGroupEditorProps {
  exercises: PlanExercise[];
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  exerciseStartIndex: number; // <-- NEW PROP
  canEdit: boolean;
}

export const ExerciseGroupEditor: React.FC<ExerciseGroupEditorProps> = ({
  exercises,
  weekIndex,
  dayIndex,
  sessionIndex,
  exerciseStartIndex, // <-- NEW PROP
  canEdit,
}) => {
  const isSuperset = exercises.length > 1;

  return (
    <div className={`p-3 rounded-lg ${isSuperset ? 'border-2 border-primary/20 bg-primary/5' : 'border bg-background'}`}>
      {isSuperset && (
        <div className="flex items-center mb-2">
          <Badge className="flex items-center gap-1.5"><Zap className="h-3 w-3" />Superset</Badge>
        </div>
      )}
      <div className="space-y-3">
        {exercises
          .slice()
          .sort((a, b) => a.order_within_session - b.order_within_session)
          .map((exercise, indexInGroup) => (
            <ExerciseEditorCard
              key={exercise.id}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              sessionIndex={sessionIndex}
              // --- FIX: Calculate the absolute index ---
              exerciseIndex={exerciseStartIndex + indexInGroup}
              canEdit={canEdit}
            />
          ))}
      </div>
    </div>
  );
};