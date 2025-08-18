// FILE: src/ui/plan/edit/SetEditorRow.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanSet } from '@/types/plan';
import type { Tables } from '@/types/database.types';

// --- UI Components & Icons ---
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface SetEditorRowProps {
  // We only need the indexes to locate the set within the Zustand store
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  exerciseIndex: number;
  setIndex: number;
  canEdit: boolean;
}

export const SetEditorRow: React.FC<SetEditorRowProps> = ({
  weekIndex,
  dayIndex,
  sessionIndex,
  exerciseIndex,
  setIndex,
  canEdit,
}) => {
  // --- STATE MANAGEMENT (Corrected) ---
  // 1. Get all actions and the full state object
  const { plan, updateSet, deleteSet } = usePlanEditor();

  // 2. Safely derive the specific set for this component
  const set = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex]?.sets[setIndex];

  // If the set doesn't exist, render nothing.
  if (!set) {
    return null;
  }

  // A generic handler to update any field in the set object in our store
  const handleUpdate = (field: keyof PlanSet, value: any) => {
    // Coerce numeric fields from string input
    const numericFields: (keyof PlanSet)[] = ['target_reps', 'target_weight', 'target_duration_seconds', 'target_distance_meters', 'target_rest_seconds'];
    const finalValue = numericFields.includes(field) ? (value === '' ? null : Number(value)) : value;

    updateSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex, { [field]: finalValue });
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete Set ${set.set_number}? This action is immediate.`)) {
      deleteSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex);
    }
  };

  // Conditionally render inputs based on set type
  const setType = set.set_type as Tables<'plan_session_exercise_sets'>['set_type'];
  const showRepsWeight = ['normal', 'warmup', 'dropset', 'amrap', 'pyramid', 'failure', 'rest_pause'].includes(setType);
  const showDuration = ['emom', 'for_time', 'tabata', 'isometrics'].includes(setType);
  
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 text-sm p-1 rounded-md hover:bg-muted/50">
      <span className="font-mono text-muted-foreground text-xs pr-2">Set {set.set_number}</span>
      
      <Select
        value={set.set_type}
        onValueChange={(value) => handleUpdate('set_type', value)}
        disabled={!canEdit}
      >
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="warmup">Warmup</SelectItem>
          <SelectItem value="dropset">Dropset</SelectItem>
          <SelectItem value="amrap">AMRAP</SelectItem>
          <SelectItem value="failure">To Failure</SelectItem>
          {/* Add other set types as needed */}
        </SelectContent>
      </Select>
      
      {/* Conditionally rendered Inputs */}
      <Input type="number" placeholder="Reps" value={set.target_reps ?? ''} onChange={e => handleUpdate('target_reps', e.target.value)} className={`h-8 ${!showRepsWeight && 'invisible'}`} disabled={!canEdit} />
      <Input type="number" placeholder="kg" value={set.target_weight ?? ''} onChange={e => handleUpdate('target_weight', e.target.value)} className={`h-8 ${!showRepsWeight && 'invisible'}`} disabled={!canEdit} />
      <Input type="number" placeholder="Seconds" value={set.target_duration_seconds ?? ''} onChange={e => handleUpdate('target_duration_seconds', e.target.value)} className={`h-8 ${!showDuration && 'invisible'}`} disabled={!canEdit} />
      
      <Input type="number" placeholder="Rest (s)" value={set.target_rest_seconds ?? ''} onChange={e => handleUpdate('target_rest_seconds', e.target.value)} className="h-8" disabled={!canEdit} />
      
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={!canEdit}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};