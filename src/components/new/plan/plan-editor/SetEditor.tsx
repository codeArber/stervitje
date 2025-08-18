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
  // --- STATE MANAGEMENT ---
  const { plan, updateSet, deleteSet } = usePlanEditor();
  const set = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex]?.sets[setIndex];

  if (!set) {
    return null;
  }

  // --- HANDLERS ---
  const handleUpdate = (field: keyof PlanSet, value: any) => {
    const numericFields: (keyof PlanSet)[] = ['target_reps', 'target_weight', 'target_duration_seconds', 'target_distance_meters', 'target_rest_seconds'];
    let finalValue = numericFields.includes(field) ? (value === '' ? null : Number(value)) : value;

    // When changing set type, nullify the other irrelevant fields for data cleanliness
    const updatesToApply: Partial<PlanSet> = { [field]: finalValue };
    if (field === 'set_type') {
        updatesToApply.target_reps = null;
        updatesToApply.target_weight = null;
        updatesToApply.target_duration_seconds = null;
        updatesToApply.target_distance_meters = null;
    }
    
    // We pass the whole update object
    updateSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex, updatesToApply);
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete Set ${set.set_number}?`)) {
      deleteSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex);
    }
  };

  // --- DYNAMIC INPUT LOGIC ---
  const setType = set.set_type as Tables<'plan_session_exercise_sets'>['set_type'];
  
  // Define which set types show which inputs
  const showRepsWeight = ['normal', 'warmup', 'dropset', 'amrap', 'pyramid', 'failure', 'rest_pause'].includes(setType);
  const showDuration = ['emom', 'for_time', 'tabata', 'isometrics'].includes(setType);
  const showDistance = ['for_time'].includes(setType); // Example: For a timed run

  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 text-sm p-1 rounded-md hover:bg-muted/50">
      <span className="font-mono text-muted-foreground text-xs pr-2">Set {set.set_number}</span>
      
      {/* --- Set Type Dropdown --- */}
      <Select value={set.set_type} onValueChange={(value) => handleUpdate('set_type', value)} disabled={!canEdit}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">Reps & Weight</SelectItem>
          <SelectItem value="warmup">Warmup</SelectItem>
          <SelectItem value="dropset">Dropset</SelectItem>
          <SelectItem value="amrap">AMRAP</SelectItem>
          <SelectItem value="for_time">For Time</SelectItem>
          <SelectItem value="isometrics">Timed Hold</SelectItem>
          {/* Add all other set types from your DB enum here */}
        </SelectContent>
      </Select>
      
      {/* --- Conditionally Rendered Inputs --- */}
      
      {/* Reps Input */}
      <Input type="number" placeholder="Reps" value={set.target_reps ?? ''} onChange={e => handleUpdate('target_reps', e.target.value)} className={`h-8 ${!showRepsWeight && 'invisible'}`} disabled={!canEdit || !showRepsWeight} />
      
      {/* Weight Input */}
      <Input type="number" placeholder="kg" value={set.target_weight ?? ''} onChange={e => handleUpdate('target_weight', e.target.value)} className={`h-8 ${!showRepsWeight && 'invisible'}`} disabled={!canEdit || !showRepsWeight} />

      {/* Duration & Distance Inputs (they can share a grid column) */}
      <div className={`grid ${showDuration && showDistance ? 'grid-cols-2 gap-1' : 'grid-cols-1'} `}>
        <Input type="number" placeholder="Seconds" value={set.target_duration_seconds ?? ''} onChange={e => handleUpdate('target_duration_seconds', e.target.value)} className={`h-8 ${!showDuration && 'hidden'}`} disabled={!canEdit || !showDuration} />
        <Input type="number" placeholder="Meters" value={set.target_distance_meters ?? ''} onChange={e => handleUpdate('target_distance_meters', e.target.value)} className={`h-8 ${!showDistance && 'hidden'}`} disabled={!canEdit || !showDistance} />
      </div>
      
      {/* Rest Input */}
      <Input type="number" placeholder="Rest (s)" value={set.target_rest_seconds ?? ''} onChange={e => handleUpdate('target_rest_seconds', e.target.value)} className="h-8" disabled={!canEdit} />
      
      {/* Delete Button */}
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={!canEdit}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};