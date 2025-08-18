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
    <div className={cn("flex flex-row gap-2", isSuperset && 'basis-full')}>
      {exercises
        .sort((a, b) => a.order_within_session - b.order_within_session) // Ensure order
        .map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <ExerciseDisplayCard exercise={exercise} />

            {/* Intra-Superset Rest Timer (only shown between exercises in a superset) */}
            {isSuperset && index < exercises.length - 1 && exercise.post_exercise_rest_seconds > 0 && (
              <div className="flex items-center justify-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-dashed border-primary/30 rounded-sm px-2 py-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>Rest {exercise.post_exercise_rest_seconds}s</span>
              </div>
            )}
          </React.Fragment>
        ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Conditionally wrap content in a "Superset" container */}
      {isSuperset ? (
        <div className="relative p-3 pt-4 border border-primary/20 bg-primary/5 rounded-md w-full">
          <Badge className="absolute -top-2.5 left-3 flex items-center gap-1 text-xs px-2 py-0.5 h-auto">
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
        <div className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground border border-dashed border-border rounded-md px-3 py-1.5 bg-background">
          <Clock className="h-3 w-3" />
          <span>Rest {postGroupRest} seconds before next group</span>
        </div>
      )}
    </div>
  );
};