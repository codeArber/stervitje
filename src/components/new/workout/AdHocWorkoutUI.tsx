// FILE: src/components/workout/AdHocWorkoutUI.tsx

import type { LoggedExercise } from '@/types/plan'; // We'll need to define these
import type { Exercise } from '@/types/exercise';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getNextTempId } from '@/utils/tempId';
import { ExerciseSelectorDialog } from '../plan/plan-edit/ExerciseSelectorDialog';
import { useWorkoutStore } from '@/stores/workout-store';

// --- Child Components ---
// We'll import these as we create them
// import { LoggedExerciseCard } from './LoggedExerciseCard';


// --- Main Ad-Hoc Workout Component ---
export const AdHocWorkoutUI: React.FC = () => {
  const { finishWorkout, loggedExercises, addLoggedExercise } = useWorkoutStore();

  // --- LOCAL UI STATE (for dialog open/close etc) ---
  // We keep no local copy of logged exercises; they are persisted in the workout store.

  const handleSelectExercise = (exerciseId: string, exerciseDetails: Exercise) => {
    // Create a new exercise object to log and persist it via the workout store
    const newLoggedExercise: LoggedExercise = {
      _tempId: getNextTempId('logged-ex'),
      plan_session_exercise_id: null, // ad-hoc exercises have no plan mapping
      exercise_id: exerciseId,
      exercise_details: exerciseDetails,
      sets: [
        {
          _tempId: getNextTempId('logged-set'),
          set_number: 1,
          reps_performed: null,
          weight_used: null,
          weight_unit: null,
        }
      ]
    };

    addLoggedExercise(newLoggedExercise);
    toast.success(`Added "${exerciseDetails.name}" to your workout.`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Your Workout</CardTitle>
          <CardDescription>
            Add the exercises you perform below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {loggedExercises && loggedExercises.length > 0 ? (
              loggedExercises.map((ex: LoggedExercise) => (
                <div key={ex._tempId} className="p-4 border rounded-md">
                    <p className="font-bold">{ex.exercise_details?.name}</p>
                    <p className="text-sm text-muted-foreground">Set logging UI will go here.</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your logged exercises will appear here.</p>
              </div>
            )}
          </div>
          
          <ExerciseSelectorDialog onSelectExercise={handleSelectExercise}>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </ExerciseSelectorDialog>

        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={finishWorkout}>
        Finish Workout
      </Button>
    </div>
  );
};