// FILE: src/components/new/workout/AdHocWorkoutUI.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import type { LoggedExercise, LoggedSet } from '@/types/plan';
import type { Exercise } from '@/types/exercise';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workout-store';
import { ExerciseSelectorDialog } from '../plan/plan-edit/ExerciseSelectorDialog';

// ==================================================================
// 1. THE NEW, DYNAMIC SUB-COMPONENTS
// ==================================================================

// An array of your set types for the dropdown menu
const setTypeOptions: LoggedSet['set_type'][] = [
  'normal', 'warmup', 'dropset', 'amrap', 'emom', 'for_time', 'tabata',
  'pyramid', 'failure', 'rest_pause', 'isometrics', 'technique'
];

// --- Specific Input Components ---
const NormalSetInputs: React.FC<{ set: LoggedSet; exerciseTempId: string }> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
  };
  return (
    <>
      <Input type="number" placeholder="Reps" value={set.reps_performed ?? ''} onChange={e => handleUpdate('reps_performed', e.target.value)} />
      <Input type="number" placeholder="Weight" value={set.weight_used ?? ''} onChange={e => handleUpdate('weight_used', e.target.value)} />
    </>
  );
};
const AmrapSetInputs: React.FC<{ set: LoggedSet; exerciseTempId: string }> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
  };
  return (
    <>
      <Input type="number" placeholder="Time (s)" value={set.duration_seconds ?? ''} onChange={e => handleUpdate('duration_seconds', e.target.value)} />
      <Input type="number" placeholder="Weight" value={set.weight_used ?? ''} onChange={e => handleUpdate('weight_used', e.target.value)} />
      <Input type="number" placeholder="Reps Achieved" value={set.reps_performed ?? ''} onChange={e => handleUpdate('reps_performed', e.target.value)} />
    </>
  );
};
const ForTimeSetInputs: React.FC<{ set: LoggedSet; exerciseTempId: string }> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
  };
  return (
    <>
      <Input type="number" placeholder="Target Reps" value={set.target_reps ?? ''} onChange={e => handleUpdate('target_reps', e.target.value)} />
      <Input type="number" placeholder="Time Taken (s)" value={set.duration_seconds ?? ''} onChange={e => handleUpdate('duration_seconds', e.target.value)} />
    </>
  );
};

// --- The Master "Switch" Component ---
const SetInputSwitcher: React.FC<{ set: LoggedSet; exerciseTempId: string }> = ({ set, exerciseTempId }) => {
  switch (set.set_type) {
    case 'amrap':
      return <AmrapSetInputs set={set} exerciseTempId={exerciseTempId} />;
    case 'for_time':
      return <ForTimeSetInputs set={set} exerciseTempId={exerciseTempId} />;
    default:
      return <NormalSetInputs set={set} exerciseTempId={exerciseTempId} />;
  }
};

// --- The Main Interactive Row Component ---
const AdHocSetRow: React.FC<{
  set: LoggedSet;
  setNumber: number;
  exerciseTempId: string;
}> = ({ set, setNumber, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();

  return (
    <div className="p-2 bg-background rounded-md space-y-2 border">
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm w-8 text-center">{setNumber}</span>
        <Select
          value={set.set_type || 'normal'}
          onValueChange={(value: LoggedSet['set_type']) => {
            if (set._tempId) updateLoggedSet(exerciseTempId, set._tempId, { set_type: value });
          }}
        >
          <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="Set Type" /></SelectTrigger>
          <SelectContent>
            {setTypeOptions.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type?.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pl-10">
        <SetInputSwitcher set={set} exerciseTempId={exerciseTempId} />
      </div>
    </div>
  );
};

const AdHocExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => {
  const { addLoggedSet, deleteLoggedExercise } = useWorkoutStore();
  const exerciseName = exercise.exercise_details?.name ?? 'Unnamed Exercise';

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between p-4">
        <CardTitle className="text-lg">{exerciseName}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => {
              if (confirm(`Remove ${exerciseName}?`)) {
                if (exercise._tempId) deleteLoggedExercise(exercise._tempId);
              }
            }}
          ><Trash2 className="h-4 w-4" /></Button>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {exercise.sets.map((set, index) => (
          set._tempId && exercise._tempId ? (
            <AdHocSetRow key={set._tempId} set={set} setNumber={index + 1} exerciseTempId={exercise._tempId} />
          ) : null
        ))}
        <Button
          variant="outline" className="w-full"
          onClick={() => { if (exercise._tempId) addLoggedSet(exercise._tempId); }}
        ><PlusCircle className="mr-2 h-4 w-4" /> Add Set</Button>
      </CardContent>
    </Card>
  );
};

// ==================================================================
// 2. THE MAIN AD-HOC WORKOUT COMPONENT (Using the new sub-components)
// ==================================================================
export const AdHocWorkoutUI: React.FC = () => {
  const { finishWorkout, loggedExercises, addLoggedExercise } = useWorkoutStore();

  const handleSelectExercise = (exerciseId: string, exerciseDetails: Exercise) => {
    const newLoggedExercise: LoggedExercise = {
      _tempId: `temp_ex_${Date.now()}`,
      exercise_id: exerciseId,
      plan_session_exercise_id: null,
      exercise_details: { ...exerciseDetails },
      sets: [
        {
          _tempId: `temp_set_${Date.now()}`,
          set_number: 1,
          set_type: 'normal', // Default to 'normal'
          reps_performed: null,
          weight_used: null,
          weight_unit: 'kg',
        }
      ]
    };
    addLoggedExercise(newLoggedExercise);
    toast.success(`Added "${exerciseDetails.name}" to your workout.`);
  };

  return (
    <div className="space-y-4 pb-24">
      {loggedExercises.length > 0 ? (
        loggedExercises.map(ex => (
          ex._tempId ? <AdHocExerciseCard key={ex._tempId} exercise={ex} /> : null
        ))
      ) : (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <p>Your workout is empty.</p>
          <p className="text-sm">Click "Add Exercise" to get started.</p>
        </div>
      )}
      <div className="space-y-4">
        <ExerciseSelectorDialog onSelectExercise={handleSelectExercise}>
          <Button variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
          </Button>
        </ExerciseSelectorDialog>
        <Button
          size="lg" className="w-full"
          onClick={() => {
            if (confirm("Are you sure you want to finish this workout?")) {
              finishWorkout();
            }
          }}
          disabled={loggedExercises.length === 0}
        > Finish Workout </Button>
      </div>
    </div>
  );
};