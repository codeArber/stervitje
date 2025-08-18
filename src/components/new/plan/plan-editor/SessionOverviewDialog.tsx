// FILE: src/components/plan-editor/SessionOverviewDialog.tsx

import React from 'react';
import { usePlanDetailsQuery } from '@/api/plan'; // Assuming you might fetch fresh session data
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

// Types
import type { PlanSession, PlanExercise, PlanSet } from '@/types/plan';

// Icons
import { PlayCircle, Info, Clock, Dumbbell, Repeat, Route, Trophy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

interface SessionOverviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: PlanSession; // We'll pass the session data as a prop
  planId: string;
}

export const SessionOverviewDialog: React.FC<SessionOverviewDialogProps> = ({
  isOpen,
  onOpenChange,
  session,
  planId,
}) => {
  // FUTURE: You could use a query here to fetch the most up-to-date session data
  // const { data: sessionData, isLoading } = useSessionDetailsQuery(session.id);
  const isLoading = false; // For now, we use the passed-in data

  // Group exercises by their `execution_group` to render supersets correctly
  const exerciseGroups = React.useMemo(() => {
    if (!session?.exercises) return {};
    return session.exercises.reduce((acc, exercise) => {
      const group = exercise.execution_group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(exercise);
      return acc;
    }, {} as Record<number, PlanExercise[]>);
  }, [session]);

  const renderContent = () => {
    if (isLoading || !session) {
      return <SessionModalSkeleton />;
    }

    return (
      <>
        <DialogHeader className="p-4 pb-3 border-b">
          <h2 className="text-xl font-bold">{session.title || 'Workout Session'}</h2>
          <p className="text-sm text-muted-foreground">{session.notes || 'Review the exercises for this session.'}</p>
          <Button size="lg" className="w-full mt-2">
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
          {Object.entries(exerciseGroups).map(([groupKey, groupExercises]) => (
            <ExerciseGroupDisplay key={groupKey} exercises={groupExercises} planId={planId} />
          ))}

          <div className="flex items-center justify-center gap-2 p-2 mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-semibold">Workout Complete</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 gap-0">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

// --- Sub-components for the Dialog ---

const ExerciseGroupDisplay = ({ exercises, planId }: { exercises: PlanExercise[], planId: string }) => {
  const isSuperset = exercises.length > 1;

  const groupContent = (
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <React.Fragment key={exercise.id}>
          <ExerciseCardDisplay exercise={exercise} planId={planId} />
          {/* Intra-superset rest */}
          {isSuperset && exercise.post_exercise_rest_seconds > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-dashed border-primary/30 rounded-md py-1 mx-2">
              <Clock className="h-3 w-3" />
              Rest {exercise.post_exercise_rest_seconds} seconds
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      {isSuperset ? (
        <div className="relative p-3 border-2 border-primary/20 bg-primary/5 rounded-lg">
          <Badge className="absolute -top-2 left-3 text-xs">Superset</Badge>
          {groupContent}
        </div>
      ) : (
        groupContent
      )}
      {/* Post-group rest */}
      {exercises[0].post_group_rest_seconds > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground border border-dashed rounded-md py-2">
          <Clock className="h-4 w-4" />
          Rest {exercises[0].post_group_rest_seconds} seconds before next group
        </div>
      )}
    </div>
  );
};

const ExerciseCardDisplay = ({ exercise, planId }: { exercise: PlanExercise, planId: string }) => (
  <Card className="hover:border-primary/50 transition-colors shadow-sm">
    <div className="p-3">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold">{exercise.exercise_details.name}</p>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }}>
            <Info className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="space-y-1.5">
        {exercise.sets.map(set => <SetItemDisplay key={set.id} set={set} />)}
      </div>
    </div>
  </Card>
);

const SetItemDisplay = ({ set }: { set: PlanSet }) => (
  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
    <Badge variant="outline" className="font-mono w-16 justify-center">Set {set.set_number}</Badge>
    <div className="flex items-center gap-1 text-foreground">
      {set.target_reps && <><Repeat className="h-3 w-3 text-muted-foreground" /> <span>{set.target_reps} reps</span></>}
      {set.target_weight && <span>x {set.target_weight}kg</span>}
      {set.target_duration_seconds && <><Clock className="h-3 w-3 text-muted-foreground" /> <span>{set.target_duration_seconds}s</span></>}
      {set.target_distance_meters && <><Route className="h-3 w-3 text-muted-foreground" /> <span>{set.target_distance_meters}m</span></>}
    </div>
    {set.set_type !== 'normal' && <Badge variant="destructive" className="text-xs uppercase ml-auto">{set.set_type}</Badge>}
  </div>
);

const SessionModalSkeleton = () => (
  <div className="p-4 space-y-4 animate-pulse">
    <Skeleton className="h-7 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-12 w-full" />
    <Separator />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-52 w-full" />
  </div>
);