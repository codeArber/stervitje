// FILE: src/components/plan-display/ExerciseGroupDisplay.tsx

import React from 'react';
import type { PlanExercise } from '@/types/plan';

// --- Child Component ---
import { ExerciseDisplayCard } from './ExerciseDisplayCard';

// --- UI Components & Icons ---
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseGroupDisplayProps {
  exercises: PlanExercise[];
  // This prop is derived in the parent component, making this one simpler.
  isSuperset: boolean; 
  postGroupRest: number | null | undefined;
}

export const ExerciseGroupDisplay: React.FC<ExerciseGroupDisplayProps> = ({
  exercises,
  isSuperset,
  postGroupRest,
}) => {
  // The content is the list of exercise cards
  const groupContent = (
    <div className={cn("space-x-3 flex flex-row", isSuperset && 'basis-full')}>
      {exercises
        .sort((a, b) => a.order_within_session - b.order_within_session) // Ensure order
        .map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <ExerciseDisplayCard exercise={exercise} />
            
            {/* Intra-Superset Rest Timer (only shown between exercises in a superset) */}
            {isSuperset && index < exercises.length - 1 && exercise.post_exercise_rest_seconds > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-dashed border-primary/30 rounded-md py-1.5 mx-4">
                <Clock className="h-3 w-3" />
                <span>Rest {exercise.post_exercise_rest_seconds} seconds</span>
              </div>
            )}
          </React.Fragment>
        ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Conditionally wrap content in a "Superset" container */}
      {isSuperset ? (
        <div className="relative p-4 pt-5 border-2 border-primary/20 bg-primary/5 rounded-lg w-full">
          <Badge className="absolute -top-2.5 left-4 flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Superset
          </Badge>
          {groupContent}
        </div>
      ) : (
        groupContent
      )}

      {/* Post-Group Rest Timer (shown after the entire group) */}
      {postGroupRest != null && postGroupRest > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground border border-dashed rounded-md py-2">
          <Clock className="h-4 w-4" />
          <span>Rest {postGroupRest} seconds before next group</span>
        </div>
      )}
    </div>
  );
};