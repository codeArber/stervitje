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
    <Card className="bg-background shadow-sm rounded-md overflow-hidden p-3 flex-grow basis-1/2 min-w-80">
      {/* --- Card Header --- */}
      <div className="flex items-start gap-2 mb-2">
        <img
          src={imageUrl}
          alt={exercise.exercise_details.name}
          className="h-12 w-12 rounded-sm object-cover border flex-shrink-0 mt-0.5"
        />
        <div className="flex-grow">
          <h4 className="font-semibold text-base leading-tight">
            {exercise.exercise_details.name}
          </h4>
          {exercise.notes && (
            <p className="text-xs italic text-muted-foreground mt-0.5">
              {exercise.notes}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }}>
            <Info className="h-4 w-4" />
            <span className="sr-only">View Exercise Details</span>
          </Link>
        </Button>
      </div>

      {/* --- Sets List --- */}
      <div className="flex flex-col gap-1">
        {exercise.sets && exercise.sets.length > 0 ? (
          exercise.sets
            .sort((a, b) => a.set_number - b.set_number)
            .map(set => <SetDisplayRow key={set.id} set={set} />)
        ) : (
          <p className="text-xs text-center text-muted-foreground py-2">
            No sets defined for this exercise.
          </p>
        )}
      </div>
    </Card>
  );
};