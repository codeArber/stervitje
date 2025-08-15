// FILE: src/routes/_layout/workout/$logId.tsx

import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useWorkoutDetailsQuery, useLogSetMutation, useFinishWorkoutMutation } from '@/api/workout';
import { useWorkoutStore } from '@/stores/workout-store';
import type { ActiveExercise, NewSetLog } from '@/types/workout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Icons
import { CheckCircle, SkipForward, Flag, ArrowRight, PartyPopper } from 'lucide-react';

export const Route = createFileRoute('/_layout/workout/$logId')({
  component: ActiveWorkoutPage,
});

function ActiveWorkoutPage() {
  const { logId } = Route.useParams();
  const navigate = useNavigate();

  const {
    sessionLog,
    activeExercises,
    currentExerciseIndex,
    currentSetIndex,
    isCompleted,
    startWorkout,
    completeSet,
    reset,
  } = useWorkoutStore();

  const { data: workoutDetails, isLoading: isLoadingDetails } = useWorkoutDetailsQuery(logId);
  const { mutate: logSet } = useLogSetMutation();
  const { mutate: finishSession } = useFinishWorkoutMutation();
  console.log('Workout Details:', workoutDetails);

  useEffect(() => {
    // --- THIS IS THE CORRECTED PART ---
    // The check is now for `workoutDetails.planned.exercises`
    if (workoutDetails?.planned?.exercises && workoutDetails.performed) {
      // The map is now on the correct array: `workoutDetails.planned.exercises`
      const exercisesForStore: ActiveExercise[] = workoutDetails.planned.exercises.map(plannedEx => ({
        id: plannedEx.id,
        exercise_details: plannedEx.exercise_details,
        sets: plannedEx.sets?.map(plannedSet => ({
          id: plannedSet.id,
          set_number: plannedSet.set_number,
          target_reps: plannedSet.target_reps,
          target_weight: plannedSet.target_weight,
          performed_reps: null,
          performed_weight: null,
          is_completed: false,
        })) || [],
      }));
      startWorkout(workoutDetails.performed, exercisesForStore);
    }
    return () => {
      reset();
    };
  }, [workoutDetails, startWorkout, reset]);
  
  const handleFinishWorkout = () => {
    finishSession({ logId, updates: { duration_minutes: 30 } });
    navigate({ to: '/profile' });
  };
  
  const currentExercise = activeExercises[currentExerciseIndex];

  if (isLoadingDetails || !currentExercise) {
    return <WorkoutPageSkeleton />;
  }
  
  if (isCompleted) {
    return <WorkoutCompleteDialog onFinish={handleFinishWorkout} />;
  }

  const totalExercises = activeExercises.length;
  const progressPercentage = totalExercises > 0 ? (currentExerciseIndex / totalExercises) * 100 : 0;

  return (
    <div className="container max-w-2xl py-8 flex flex-col h-full">
        <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{workoutDetails?.planned?.session.title || 'Workout Session'}</h1>
            <div className="flex items-center gap-4 mt-2">
                <Progress value={progressPercentage} className="flex-1" />
                <span className="text-sm font-semibold text-muted-foreground">
                    Exercise {currentExerciseIndex + 1} of {totalExercises}
                </span>
            </div>
        </header>
        
        <main className="flex-1">
            <ExerciseLogger
                key={`${currentExercise.id}-${currentSetIndex}`}
                exercise={currentExercise}
                currentSetIndex={currentSetIndex}
                onSetComplete={completeSet}
                onLogSet={logSet}
            />
        </main>

        <footer className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleFinishWorkout}>
                <Flag className="mr-2 h-4 w-4" />
                Finish Early
            </Button>
            <Button onClick={() => useWorkoutStore.getState().nextExercise()}>
                Skip Exercise
                <SkipForward className="ml-2 h-4 w-4" />
            </Button>
        </footer>
    </div>
  );
}

const ExerciseLogger = ({ exercise, currentSetIndex, onSetComplete, onLogSet }: {
  exercise: ActiveExercise;
  currentSetIndex: number;
  onSetComplete: () => void;
  onLogSet: (payload: NewSetLog) => void;
}) => {
  const currentSet = exercise.sets[currentSetIndex];

  const formSchema = z.object({
    reps: z.coerce.number().min(0),
    weight: z.coerce.number().min(0),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reps: currentSet?.target_reps ?? 0,
      weight: currentSet?.target_weight ?? 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onLogSet({
      exercise_session_id: exercise.id,
      set_number: currentSet.set_number,
      reps_performed: values.reps,
      weight_used: values.weight,
    });
    onSetComplete();
  };

  if (!currentSet) {
    return (
        <Card>
            <CardHeader><CardTitle>{exercise.exercise_details?.name}</CardTitle></CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">No more sets for this exercise.</p>
                <Button onClick={() => useWorkoutStore.getState().nextExercise()} className="mt-4">
                    Next Exercise
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.exercise_details.name}</CardTitle>
        <CardDescription>Set {currentSet.set_number} of {exercise.sets.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="reps" render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-lg">Reps</FormLabel>
                  <FormControl>
                    <Input autoFocus type="number" {...field} className="text-center text-2xl h-16" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-lg">Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="text-center text-2xl h-16" />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Complete Set <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const WorkoutCompleteDialog = ({ onFinish }: { onFinish: () => void }) => (
    <Dialog open={true}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-center text-2xl">Workout Complete!</DialogTitle>
                <DialogDescription className="text-center">
                    <PartyPopper className="h-16 w-16 mx-auto my-4 text-green-500" />
                    Great work! You've finished all the exercises for this session.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onFinish} className="w-full">View Summary <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const WorkoutPageSkeleton = () => (
    <div className="container max-w-2xl py-8">
        <header className="mb-6"><Skeleton className="h-9 w-3/4" /></header>
        <Card><CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
    </div>
);