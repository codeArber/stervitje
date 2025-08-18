// FILE: src/components/plan-display/ExerciseDisplayCard.tsx

import React from 'react';
import type { PlanExercise } from '@/types/plan';

// --- Child Component ---
import { SetDisplayRow } from './SetDisplayRow';

// --- UI Components & Icons ---
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Info } from 'lucide-react';
import { getExerciseImageUrl } from '@/types/storage';

interface ExerciseDisplayCardProps {
  exercise: PlanExercise;
}

export const ExerciseDisplayCard: React.FC<ExerciseDisplayCardProps> = ({ exercise }) => {
  const imageUrl = getExerciseImageUrl(exercise.exercise_details.image_url);

  return (
    <Card className="bg-background shadow-sm overflow-hidden">
      <div className="p-3">
        {/* --- Card Header --- */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={imageUrl}
            alt={exercise.exercise_details.name}
            className="h-14 w-14 rounded-md object-cover border"
          />
          <div className="flex-grow">
            <h4 className="font-semibold text-base leading-tight">
              {exercise.exercise_details.name}
            </h4>
            {exercise.notes && (
              <p className="text-xs italic text-muted-foreground mt-1">
                {exercise.notes}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
            <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }}>
              <Info className="h-4 w-4" />
              <span className="sr-only">View Exercise Details</span>
            </Link>
          </Button>
        </div>

        {/* --- Sets List --- */}
        <div className="space-y-1.5">
          {/* --- FIX --- Check if exercise.sets is truthy before accessing .length */}
          {exercise.sets && exercise.sets.length > 0 ? (
            exercise.sets
              .sort((a, b) => a.set_number - b.set_number) // Ensure sets are always in order
              .map(set => <SetDisplayRow key={set.id} set={set} />)
          ) : (
            <p className="text-xs text-center text-muted-foreground py-2">
              No sets have been defined for this exercise.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};