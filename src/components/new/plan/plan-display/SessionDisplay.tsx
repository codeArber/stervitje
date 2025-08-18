// FILE: src/components/plan-display/SessionDisplay.tsx

import React from 'react';
import type { PlanSession, PlanExercise } from '@/types/plan';

// --- Child Component ---
import { ExerciseGroupDisplay } from './ExerciseGroupDisplay';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface SessionDisplayProps {
  session: PlanSession;
  isPlanStarted: boolean; // Prop to determine if the "Start" button should be shown
}

export const SessionDisplay: React.FC<SessionDisplayProps> = ({ session, isPlanStarted }) => {
  // This useMemo hook is the "brain" of the component.
  // It takes the flat list of exercises and groups them by `execution_group`.
  const exerciseGroups = React.useMemo(() => {
    if (!session?.exercises) return [];

    const groups = session.exercises.reduce((acc, exercise) => {
      const groupKey = exercise.execution_group;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(exercise);
      return acc;
    }, {} as Record<number, PlanExercise[]>);

    // Convert the object of groups into a sorted array of groups
    return Object.values(groups).sort((a, b) => {
      // Sort groups by the lowest `order_within_session` of their first exercise
      return a[0].order_within_session - b[0].order_within_session;
    });
  }, [session]);

  return (
    <Card className="border-l-4 border-primary/50 bg-background/50">
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
            <Button size="sm" className="shrink-0">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Session
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-row flex-wrap gap-4">
        {exerciseGroups.length > 0 ? (
          exerciseGroups.map((groupExercises, index) => {
            // Determine if the group is a superset
            const isSuperset = groupExercises.length > 1;
            
            // Find the post-group rest time from the last exercise in the group
            const postGroupRest = groupExercises[groupExercises.length - 1]?.post_group_rest_seconds;

            return (
              <ExerciseGroupDisplay
                key={index} // Using index is safe here as the order is stable
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