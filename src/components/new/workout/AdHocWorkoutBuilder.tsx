// FILE: src/components/new/workout/AdHocWorkoutBuilder.tsx

import React, {useState} from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, Plus, Trash2, Flame, Wind } from 'lucide-react';

// --- UI Components ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// --- TYPE DEFINITIONS (for local state management) ---
interface AdHocSet {
  _id: string;
  reps: string;
  weight: string;
  restSeconds: string;
}

interface AdHocExercise {
  _id: string;
  name: string;
  sets: AdHocSet[];
}

interface AdHocGroup {
  _id: string;
  exercises: AdHocExercise[];
  postGroupRestSeconds: string;
}


// --- DUMMY DATA ---
const INITIAL_DUMMY_STATE: AdHocGroup[] = [
  {
    _id: 'group_1',
    exercises: [
      {
        _id: 'ex_1', name: 'Barbell Squats', sets: [
          { _id: 'set_1', reps: '5', weight: '80', restSeconds: '90' },
          { _id: 'set_2', reps: '5', weight: '80', restSeconds: '90' },
        ]
      }
    ],
    postGroupRestSeconds: '120',
  },
  {
    _id: 'group_2',
    exercises: [
      {
        _id: 'ex_2', name: 'Dumbbell Bench Press', sets: [
          { _id: 'set_3', reps: '10', weight: '20', restSeconds: '0' },
        ]
      },
      {
        _id: 'ex_3', name: 'Bent Over Rows', sets: [
          { _id: 'set_4', reps: '12', weight: '15', restSeconds: '0' },
        ]
      }
    ],
    postGroupRestSeconds: '90',
  }
];


// --- SUB-COMPONENTS ---

// Renders a single set with inputs
const SetRow: React.FC<{ set: AdHocSet; onUpdate: (update: Partial<AdHocSet>) => void; onDelete: () => void; setNumber: number }> = ({ set, onUpdate, onDelete, setNumber }) => (
  <div className="flex items-center gap-2 p-2 bg-background rounded-md">
    <span className="font-bold text-sm w-8">{setNumber}</span>
    <Input placeholder="Reps" value={set.reps} onChange={e => onUpdate({ reps: e.target.value })} className="h-8" />
    <Input placeholder="Weight" value={set.weight} onChange={e => onUpdate({ weight: e.target.value })} className="h-8" />
    <Input placeholder="Rest (s)" value={set.restSeconds} onChange={e => onUpdate({ restSeconds: e.target.value })} className="h-8" />
    <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 flex-shrink-0">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

// Renders an exercise and its sets
const ExerciseEditor: React.FC<{ exercise: AdHocExercise; onUpdate: (update: Partial<AdHocExercise>) => void; onAddSet: () => void }> = ({ exercise, onUpdate, onAddSet }) => (
  <div className="p-3 bg-muted/50 rounded-lg">
    <Input 
      placeholder="Exercise Name (e.g., Bench Press)" 
      value={exercise.name} 
      onChange={e => onUpdate({ name: e.target.value })}
      className="text-md font-semibold mb-2"
    />
    <div className="space-y-2">
      {exercise.sets.map((set, index) => (
        <SetRow
          key={set._id}
          set={set}
          setNumber={index + 1}
          onDelete={() => onUpdate({ sets: exercise.sets.filter(s => s._id !== set._id) })}
          onUpdate={(update) => onUpdate({ sets: exercise.sets.map(s => s._id === set._id ? { ...s, ...update } : s) })}
        />
      ))}
    </div>
    <Button variant="outline" size="sm" onClick={onAddSet} className="mt-2 w-full">
      <Plus className="h-4 w-4 mr-2" /> Add Set
    </Button>
  </div>
);

// Renders a group (which can be a superset)
const ExecutionGroupCard: React.FC<{ group: AdHocGroup; onUpdateGroup: (update: Partial<AdHocGroup>) => void }> = ({ group, onUpdateGroup }) => {
  const isSuperset = group.exercises.length > 1;

  const handleAddExercise = () => {
    const newExercise: AdHocExercise = { _id: `ex_${Date.now()}`, name: '', sets: [{ _id: `set_${Date.now()}`, reps: '', weight: '', restSeconds: '60' }] };
    onUpdateGroup({ exercises: [...group.exercises, newExercise] });
  };

  const handleAddSet = (exerciseId: string) => {
    onUpdateGroup({
      exercises: group.exercises.map(ex => {
        if (ex._id === exerciseId) {
          const newSet: AdHocSet = { _id: `set_${Date.now()}`, reps: '', weight: '', restSeconds: '60' };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    });
  };

  const handleUpdateExercise = (exerciseId: string, update: Partial<AdHocExercise>) => {
    onUpdateGroup({
      exercises: group.exercises.map(ex => ex._id === exerciseId ? { ...ex, ...update } : ex)
    });
  };

  return (
    <Card className={cn(isSuperset && "border-amber-500 border-2")}>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {isSuperset && <Flame className="h-5 w-5 text-amber-500" />}
            {isSuperset ? 'Superset' : 'Single Exercise'}
          </CardTitle>
        </div>
        <GripVertical className="cursor-grab text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {group.exercises.map((ex, index) => (
          <React.Fragment key={ex._id}>
            <ExerciseEditor 
              exercise={ex}
              onUpdate={(update) => handleUpdateExercise(ex._id, update)}
              onAddSet={() => handleAddSet(ex._id)}
            />
            {isSuperset && index < group.exercises.length - 1 && <Plus className="mx-auto h-6 w-6 text-muted-foreground" />}
          </React.Fragment>
        ))}
        {isSuperset && (
          <Button variant="ghost" className="w-full" onClick={handleAddExercise}>
            <Plus className="h-4 w-4 mr-2" /> Add Exercise to Superset
          </Button>
        )}
        <Separator />
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-500" />
          <label htmlFor={`post-group-rest-${group._id}`} className="text-sm font-medium">Post-Group Rest</label>
          <Input 
            id={`post-group-rest-${group._id}`}
            placeholder="Seconds" 
            value={group.postGroupRestSeconds}
            onChange={(e) => onUpdateGroup({ postGroupRestSeconds: e.target.value })}
            className="h-8 w-24" 
          />
        </div>
      </CardContent>
    </Card>
  );
};


// --- THE MAIN BUILDER COMPONENT ---

export function AdHocWorkoutBuilder() {
  const [groups, setGroups] = useState<AdHocGroup[]>(INITIAL_DUMMY_STATE);

  const handleAddGroup = (isSuperset: boolean) => {
    const newExercise: AdHocExercise = { _id: `ex_${Date.now()}`, name: '', sets: [{ _id: `set_${Date.now()}`, reps: '', weight: '', restSeconds: '60' }] };
    const newGroup: AdHocGroup = { _id: `group_${Date.now()}`, exercises: [newExercise], postGroupRestSeconds: '90' };
    setGroups([...groups, newGroup]);
  };

  const handleUpdateGroup = (groupId: string, update: Partial<AdHocGroup>) => {
    setGroups(groups.map(g => g._id === groupId ? { ...g, ...update } : g));
  };
  
  return (
    <div className="p-4 w-full flex flex-col">
      <div className="space-y-4 flex flex-row flex-wrap gap-4">
        {groups.map(group => (
          <ExecutionGroupCard 
            key={group._id} 
            group={group}
            onUpdateGroup={(update) => handleUpdateGroup(group._id, update)}
          />
        ))}
      </div>
      <Button size="lg" className="w-full mt-8">Finish Building & Start Workout</Button>
    </div>
  );
}