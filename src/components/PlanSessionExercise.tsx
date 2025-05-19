// src/components/plans/PlanSessionExerciseItem.tsx (Updated)
import React, { useState } from 'react'; // Import useState
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Edit, Weight, Repeat, Clock, Route as RouteIcon, Timer, PlusCircle } from 'lucide-react';
import type { PlanExerciseSet, PlanSessionExercise } from '@/types/planTypes'; // Adjust path
// Import Dialog components
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AddEditSetForm } from './AddEditSet';
// Import the Set Form

interface PlanSessionExerciseItemProps {
    exerciseEntry: PlanSessionExercise;
    planId: string;
    // Remove onAddSet, onEditSet - handle internally now
    // onAddSet: (exerciseEntryId: string) => void;
    // onEditSet: (set: PlanExerciseSet) => void;
    onDeleteSet: (setId: string) => void; // Keep delete handler
    onEditEntry: (entry: PlanSessionExercise) => void;
    onDeleteEntry: (entryId: string) => void;
    isDeletingEntry?: boolean;
    isDeletingSetId?: string | null;
}

export function PlanSessionExerciseItem({
    exerciseEntry,
    planId,
    onDeleteSet,
    onEditEntry,
    onDeleteEntry,
    isDeletingEntry,
    isDeletingSetId,
}: PlanSessionExerciseItemProps) {
    const exercise = exerciseEntry.exercise;
    const sets = exerciseEntry.plan_session_exercise_sets || [];

    // --- State for Add/Edit Set Dialog ---
    const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
    // Store the set being edited (null if adding new)
    const [editingSet, setEditingSet] = useState<PlanExerciseSet | null>(null);
    // Calculate next set number for adding
    const nextSetNumber = sets.length + 1;

    // --- Handlers to Open Dialog ---
    const handleAddSetClick = () => {
        setEditingSet(null); // Ensure we are in "add" mode
        setIsSetDialogOpen(true);
    };

    const handleEditSetClick = (set: PlanExerciseSet) => {
        setEditingSet(set); // Set the data for editing
        setIsSetDialogOpen(true);
    };

    // --- Helper Functions (Keep from previous version) ---
    const formatSetParams = (set: PlanExerciseSet): string => {
        const reps = set.target_reps ? `Reps: ${set.target_reps}` : '';
        const weight = set.target_weight ? `Weight: ${set.target_weight}kg` : '';
        const rest = set.target_rest_seconds ? `Rest: ${set.target_rest_seconds} sec` : ''
        // Combine all non-empty parameters with a comma
        return [reps, weight, rest,].filter(Boolean).join(', ');
    };

    const formatSetRest = (seconds: number | null | undefined): string | null => {
        if (!seconds) return null;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds > 0 ? remainingSeconds + 's' : ''}`;
        } else {
            return `${seconds}s`;
        }
    };

    return (
        <Card className="overflow-hidden border border-border/80">
            {/* Header: Exercise Info + Entry Actions */}
            <CardHeader className="flex flex-row items-start gap-4 p-3 bg-muted/30">
                <div>
                    {exercise?.name}
                </div>
                <div className="flex flex-col sm:flex-row gap-1 ml-auto">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditEntry(exerciseEntry)} title="Edit Entry Notes/Rest"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteEntry(exerciseEntry.id)} disabled={isDeletingEntry} title="Delete Exercise Entry"><Trash2 className="h-4 w-4" /></Button>
                </div>
            </CardHeader>

            {/* Content: List of Sets + Add Set Button */}
            <CardContent className="p-3 space-y-2">
                {sets.length > 0 ? (
                    sets.map((set) => (
                        <div key={set.id} className="flex items-center justify-between gap-2 text-sm border-b pb-1.5 pt-1 last:border-b-0 last:pb-0">
                            <span className="font-medium w-10 shrink-0">Set {set.set_number}:</span>
                            <span className="flex-grow text-left">{formatSetParams(set)}</span>
                            {/* {set.target_rest_seconds !== null && <span className="text-xs text-muted-foreground shrink-0 ml-2">Rest: {formatSetRest(set.target_rest_seconds)}</span>} */}
                            {/* Set Actions */}
                            <div className='flex-shrink-0 ml-1'>
                                {/* Pass set data to edit handler */}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditSetClick(set)} title="Edit Set"><Edit className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDeleteSet(set.id)} disabled={isDeletingSetId === set.id} title="Delete Set"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-center text-muted-foreground py-2">No sets planned yet for this exercise.</p>
                )}
                {/* Add Set Button Trigger */}
                <div className="pt-2 flex justify-center">
                    <div className="pt-2 flex justify-center">
                        <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm" >
                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Set
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[450px]">
                                <DialogHeader>
                                    <DialogTitle>{editingSet ? `Edit Set ${editingSet.set_number}` : `Add Set ${nextSetNumber}`}</DialogTitle>
                                    <DialogDescription>
                                        Specify the parameters for this set of {exercise?.name || 'this exercise'}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div>
                                    {/* Render the form, passing appropriate props */}
                                    <AddEditSetForm
                                        planId={planId}
                                        exerciseEntryId={exerciseEntry.id}
                                        setNumber={editingSet ? editingSet.set_number : nextSetNumber}
                                        existingSetData={editingSet}
                                        onSuccess={() => setIsSetDialogOpen(false)} // Close dialog on success
                                    />
                                </div>

                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}