// Fixed ExerciseEditorCard.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanExercise, PlanSet } from '@/types/plan';

// --- Child Component ---
import { SetEditorRow } from './SetEditorRow';

// --- UI Components & Icons ---
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react';
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
    const { plan, addSet, deleteExercise } = usePlanEditor();

    // --- SAFE DATA EXTRACTION ---
    const exercise = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex];

    // Create a safe copy of sets array to avoid frozen array issues
    const sets = React.useMemo(() => {
        const originalSets = exercise?.sets ?? [];
        return [...originalSets]; // Create a shallow copy
    }, [exercise?.sets]);

    // Render nothing if the exercise doesn't exist
    if (!exercise) {
        return null;
    }

    // --- HANDLERS ---
    const handleAddSet = () => {
        // Use the copied sets array for calculations
        let nextSetNumber = 1;

        if (sets.length > 0) {
            // Safely extract set numbers and find the max
            const setNumbers = sets
                .map(s => s.set_number)
                .filter(num => typeof num === 'number' && !isNaN(num));

            if (setNumbers.length > 0) {
                nextSetNumber = Math.max(...setNumbers) + 1;
            }
        }

        const newSet: PlanSet = {
            id: getNextTempId('set'),
            plan_session_exercise_id: exercise.id,
            set_number: nextSetNumber,
            set_type: 'normal',
            target_reps: null,
            target_weight: null,
            target_duration_seconds: null,
            target_distance_meters: null,
            target_rest_seconds: 60,
            notes: null,
            metadata: null,
            intent: null,
            target_weight_unit: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        addSet(weekIndex, dayIndex, sessionIndex, exerciseIndex, newSet);
        toast.info(`Optimistically added Set ${nextSetNumber}.`);
    };

    const handleDeleteExercise = () => {
        if (confirm(`Are you sure you want to delete "${exercise.exercise_details.name}" and all its sets?`)) {
            deleteExercise(weekIndex, dayIndex, sessionIndex, exerciseIndex);
            toast.info(`Optimistically deleted ${exercise.exercise_details.name}.`);
        }
    };

    return (
        <Card className="bg-background overflow-hidden shadow-sm">
            {/* Exercise Header */}
            <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <p className="font-semibold">{exercise.exercise_details.name}</p>
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
                    [...sets] // Create another copy for extra safety if sorting is needed
                        .slice()
                        .sort((a, b) => a.set_number - b.set_number) // Optional: sort by set number
                        .map((set, setIndex) => (
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