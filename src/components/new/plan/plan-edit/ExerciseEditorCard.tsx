// FILE: src/ui/plan/edit/ExerciseEditorCard.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanExercise, PlanSet } from '@/types/plan';

// --- Child Component ---
import { SetEditorRow } from './SetEditorRow';

// --- UI Components & Icons ---
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // <-- Import Input
import { Label } from '@/components/ui/label'; // <-- Import Label
import { GripVertical, PlusCircle, Trash2, Zap } from 'lucide-react'; // <-- Import Zap
import { toast } from 'sonner';
import { getNextTempId } from '@/utils/tempId';

interface ExerciseEditorCardProps {
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  exerciseIndex: number;
  canEdit: boolean;
}

export const ExerciseEditorCard: React.FC<ExerciseEditorCardProps> = ({
  weekIndex,
  dayIndex,
  sessionIndex,
  exerciseIndex,
  canEdit,
}) => {
  // --- STATE MANAGEMENT ---
  const { plan, addSet, deleteExercise, updateExercise } = usePlanEditor(); // <-- Add updateExercise
  const exercise = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex];
  const sets = exercise?.sets ?? [];

  if (!exercise) {
    return null;
  }

  // --- HANDLERS ---
  const handleUpdate = (field: keyof PlanExercise, value: any) => {
    const finalValue = field === 'execution_group' ? (value === '' ? null : Number(value)) : value;
    updateExercise(weekIndex, dayIndex, sessionIndex, exerciseIndex, { [field]: finalValue });
  };

  const handleAddSet = () => {
    const nextSetNumber = sets.length > 0 ? Math.max(...sets.map(s => s.set_number)) + 1 : 1;
    const newSet: PlanSet = {
        id: getNextTempId(),
        plan_session_exercise_id: exercise.id,
        set_number: nextSetNumber,
        set_type: 'normal',
        target_weight_unit: 'kg',
        target_reps: null, target_weight: null, target_duration_seconds: null, target_distance_meters: null,
        target_rest_seconds: 60, notes: null, metadata: null, intent: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    addSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, newSet);
    toast.info(`Optimistically added Set ${nextSetNumber}.`);
  };

  const handleDeleteExercise = () => {
    if (confirm(`Delete "${exercise.exercise_details.name}"?`)) {
      deleteExercise(weekIndex, dayIndex, sessionIndex, exerciseIndex);
      toast.info(`Optimistically deleted ${exercise.exercise_details.name}.`);
    }
  };

  return (
    <Card className="bg-background overflow-hidden shadow-sm">
      {/* Exercise Header */}
      <div className="p-3 border-b flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-grow">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <p className="font-semibold">{exercise.exercise_details.name}</p>
        </div>
        
        {/* --- NEW Group Editor Input --- */}
        <div className="flex items-center gap-2">
            <Label htmlFor={`group-${exercise.id}`} className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4" /> Group
            </Label>
            <Input
                id={`group-${exercise.id}`}
                type="number"
                className="h-8 w-16"
                value={exercise.execution_group}
                onChange={(e) => handleUpdate('execution_group', e.target.value)}
                disabled={!canEdit}
            />
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={handleAddSet} disabled={!canEdit}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Set
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDeleteExercise} disabled={!canEdit}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sets List Container */}
      <div className="p-2 space-y-1">
        {sets.length > 0 ? (
          sets.slice().sort((a, b) => a.set_number - b.set_number).map((set, setIndex) => (
            <SetEditorRow
              key={set.id}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              sessionIndex={sessionIndex}
              exerciseIndex={exerciseIndex}
              setIndex={setIndex}
              canEdit={canEdit}
            />
          ))
        ) : (
          <p className="text-xs text-center text-muted-foreground py-4">
            No sets defined. Click "Add Set" to begin.
          </p>
        )}
      </div>
    </Card>
  );
};