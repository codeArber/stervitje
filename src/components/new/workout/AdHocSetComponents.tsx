// FILE: src/components/new/workout/AdHocSetComponents.tsx

import React from 'react';
import type { LoggedSet } from '@/types/plan';

// --- UI Components ---
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkoutStore } from '@/stores/workout-store';

// --- TYPE DEFINITIONS ---
interface SetInputProps {
  set: LoggedSet;
  exerciseTempId: string;
}

// An array of your set types for the dropdown menu
const setTypeOptions: LoggedSet['set_type'][] = [
  'normal', 'warmup', 'dropset', 'amrap', 'emom', 'for_time', 'tabata',
  'pyramid', 'failure', 'rest_pause', 'isometrics', 'technique'
];

// --- Specific Input Components ---

const NormalSetInputs: React.FC<SetInputProps> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) {
      updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
    }
  };
  return (
    <>
      <Input type="number" placeholder="Reps" value={set.reps_performed ?? ''} onChange={e => handleUpdate('reps_performed', e.target.value)} />
      <Input type="number" placeholder="Weight" value={set.weight_used ?? ''} onChange={e => handleUpdate('weight_used', e.target.value)} />
    </>
  );
};

const AmrapSetInputs: React.FC<SetInputProps> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) {
      updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
    }
  };
  return (
    <>
      <Input type="number" placeholder="Time (s)" value={set.target_duration_seconds ?? ''} onChange={e => handleUpdate('target_duration_seconds', e.target.value)} />
      <Input type="number" placeholder="Weight" value={set.weight_used ?? ''} onChange={e => handleUpdate('weight_used', e.target.value)} />
      <Input type="number" placeholder="Reps Achieved" value={set.reps_performed ?? ''} onChange={e => handleUpdate('reps_performed', e.target.value)} />
    </>
  );
};

const ForTimeSetInputs: React.FC<SetInputProps> = ({ set, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();
  const handleUpdate = (field: keyof LoggedSet, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    if (!isNaN(numericValue as number)) {
      updateLoggedSet(exerciseTempId, set._tempId, { [field]: numericValue });
    }
  };
  return (
    <>
      <Input type="number" placeholder="Target Reps" value={set.target_reps ?? ''} onChange={e => handleUpdate('target_reps', e.target.value)} />
      <Input type="number" placeholder="Time Taken (s)" value={set.duration_seconds ?? ''} onChange={e => handleUpdate('duration_seconds', e.target.value)} />
    </>
  );
};


// --- The Master "Switch" Component ---
const SetInputSwitcher: React.FC<SetInputProps> = ({ set, exerciseTempId }) => {
  switch (set.set_type) {
    case 'amrap':
      return <AmrapSetInputs set={set} exerciseTempId={exerciseTempId} />;
    case 'for_time':
      return <ForTimeSetInputs set={set} exerciseTempId={exerciseTempId} />;
    
    // Many set types share the same input fields as 'normal'
    case 'normal':
    case 'warmup':
    case 'dropset':
    case 'pyramid':
    case 'failure':
    case 'technique':
    case 'rest_pause':
    default:
      return <NormalSetInputs set={set} exerciseTempId={exerciseTempId} />;
  }
};


// --- The Main Interactive Row Component ---
export const AdHocSetRow: React.FC<{
  set: LoggedSet;
  setNumber: number;
  exerciseTempId: string;
}> = ({ set, setNumber, exerciseTempId }) => {
  const { updateLoggedSet } = useWorkoutStore();

  return (
    <div className="p-2 bg-background rounded-md space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm w-8 text-center">{setNumber}</span>
        <Select
          value={set.set_type || 'normal'}
          onValueChange={(value: LoggedSet['set_type']) => {
            updateLoggedSet(exerciseTempId, set._tempId, { set_type: value });
          }}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Set Type" />
          </SelectTrigger>
          <SelectContent>
            {setTypeOptions.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2 pl-10">
        <SetInputSwitcher set={set} exerciseTempId={exerciseTempId} />
      </div>
    </div>
  );
};