// FILE: src/components/plan-editor/SessionEditorDialog.tsx

import React, { useEffect } from 'react';
import { useForm, useFieldArray, FormProvider, useWatch, Control } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// API & Types
import { useUpdatePlanSessionMutation, useAddPlanSessionExerciseMutation, useDeletePlanSessionExerciseMutation, useAddPlanSessionExerciseSetMutation, useDeletePlanSessionExerciseSetMutation } from '@/api/plan';
import type { PlanSession, PlanExercise, UpdatePlanSessionPayload, PlanSet, AddPlanSessionExercisePayload, AddPlanSessionExerciseSetPayload } from '@/types/plan';
import type { Exercise } from '@/types/exercise';
import type { Tables } from '@/types/database.types';

// UI Components & Icons
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, PlusCircle, Trash2, GripVertical } from 'lucide-react';

// Child Editor Components
import { ExerciseSelectorDialog } from './ExerciseSelectorDialog';
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';

// ====================================================================
// --- Main Dialog Component ---
// ====================================================================

interface SessionEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: PlanSession;
  canEdit: boolean;
  refetchPlanDetails: () => void;
}

export const SessionEditorDialog: React.FC<SessionEditorDialogProps> = ({
  isOpen,
  onOpenChange,
  session,
  canEdit,
  refetchPlanDetails,
}) => {
  const form = useForm<PlanEditFormData>({
    values: { hierarchy: { weeks: [{ days: [{ sessions: [session] }] }] } } as any,
  });

  const { control, handleSubmit, reset, getValues } = form;

  useEffect(() => {
    if (isOpen) {
      reset({ hierarchy: { weeks: [{ days: [{ sessions: [session] }] }] } } as any);
    }
  }, [isOpen, session, reset]);

  const { fields: exercises } = useFieldArray({
    control,
    name: 'hierarchy.weeks.0.days.0.sessions.0.exercises' as const,
    keyName: 'fieldId',
  });

  const { mutate: updateSession, isPending: isUpdatingSession } = useUpdatePlanSessionMutation();
  const { mutate: addExercise, isPending: isAddingExercise } = useAddPlanSessionExerciseMutation();

  const onSaveChanges = (data: any) => {
    if (!canEdit) return;
    const sessionData = data.hierarchy.weeks[0].days[0].sessions[0];
    const payload: UpdatePlanSessionPayload = {
      p_session_id: session.id,
      p_order_index: sessionData.order_index,
      p_title: sessionData.title,
      p_notes: sessionData.notes,
    };
    const toastId = toast.loading('Saving session details...');
    updateSession(payload, {
      onSuccess: () => {
        toast.success('Session saved!', { id: toastId });
        refetchPlanDetails();
        onOpenChange(false);
      },
      onError: (err) => toast.error(`Save failed: ${err.message}`, { id: toastId }),
    });
  };

  const handleSelectExercise = (exerciseId: string, exerciseDetails: Exercise) => {
    if (!canEdit) return;
    const currentExercises = getValues('hierarchy.weeks.0.days.0.sessions.0.exercises' as const) || [];
    const nextOrder = currentExercises.length > 0 ? Math.max(...currentExercises.map(e => e.order_within_session)) + 1 : 1;
    const payload: AddPlanSessionExercisePayload = {
      p_plan_session_id: session.id,
      p_exercise_id: exerciseId,
      p_order_within_session: nextOrder,
    };
    const toastId = toast.loading(`Adding "${exerciseDetails.name}"...`);
    addExercise(payload, {
      onSuccess: () => {
        toast.success(`"${exerciseDetails.name}" added!`, { id: toastId });
        refetchPlanDetails();
      },
      onError: (err) => toast.error(`Failed to add exercise: ${err.message}`, { id: toastId }),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-y-auto">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSaveChanges)} className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-xl">Edit Session</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                <FormField control={control} name={'hierarchy.weeks.0.days.0.sessions.0.title' as const} render={({ field }) => (<FormItem><FormLabel className="text-xs">Session Title</FormLabel><FormControl><Input placeholder="e.g., Upper Body Power" {...field} disabled={!canEdit} className="h-9" /></FormControl></FormItem>)} />
                <FormField control={control} name={'hierarchy.weeks.0.days.0.sessions.0.notes' as const} render={({ field }) => (<FormItem><FormLabel className="text-xs">Session Notes</FormLabel><FormControl><Textarea placeholder="Describe the focus of this session..." {...field} rows={1} disabled={!canEdit} className="h-9 py-2" /></FormControl></FormItem>)} />
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/50">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-semibold">Exercises</h3>
                <ExerciseSelectorDialog onSelectExercise={handleSelectExercise}><Button type="button" size="sm" disabled={!canEdit || isAddingExercise}><PlusCircle className="mr-2 h-4 w-4" /> Add Exercise</Button></ExerciseSelectorDialog>
              </div>
              
              {exercises.length > 0 ? (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <CompactExerciseEditor
                      key={exercise.fieldId}
                      control={control}
                      exercise={exercise as PlanExercise & { sets: PlanSet[] }}
                      exercisePath={`hierarchy.weeks.0.days.0.sessions.0.exercises.${index}` as const}
                      canEdit={canEdit}
                      refetchPlanDetails={refetchPlanDetails}
                    />
                  ))}
                </div>
              ) : ( <p className="text-sm text-center text-muted-foreground py-10">No exercises yet. Add one to get started.</p> )}
            </div>

            <DialogFooter className="p-3 border-t bg-background"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!canEdit || isUpdatingSession}><Save className="mr-2 h-4 w-4" /> {isUpdatingSession ? 'Saving...' : 'Save Changes'}</Button></DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};


// ====================================================================
// --- Compact Exercise Editor (Replaces Accordion-based one) ---
// ====================================================================
interface CompactExerciseEditorProps {
    control: Control<PlanEditFormData>;
    exercise: PlanExercise & { sets: PlanSet[] };
    exercisePath: string;
    canEdit: boolean;
    refetchPlanDetails: () => void;
}

const CompactExerciseEditor: React.FC<CompactExerciseEditorProps> = ({ control, exercise, exercisePath, canEdit, refetchPlanDetails }) => {
    const { fields: sets, append, remove } = useFieldArray({ control, name: `${exercisePath}.sets` as const, keyName: 'fieldId' });
    const { mutate: deleteExercise, isPending: isDeletingExercise } = useDeletePlanSessionExerciseMutation();
    const { mutate: addSet, isPending: isAddingSet } = useAddPlanSessionExerciseSetMutation();

    const handleAddSet = () => {
        const nextSetNumber = sets.length > 0 ? Math.max(...sets.map(s => s.set_number)) + 1 : 1;
        const payload: AddPlanSessionExerciseSetPayload = { p_plan_session_exercise_id: exercise.id, p_set_number: nextSetNumber, p_set_type: 'normal' };
        addSet(payload, { onSuccess: refetchPlanDetails, onError: (err) => toast.error(`Failed to add set: ${err.message}`) });
    };

    const handleDeleteExercise = () => {
        if (!confirm(`Delete "${exercise.exercise_details.name}" and all its sets?`)) return;
        deleteExercise({ p_plan_session_exercise_id: exercise.id }, { onSuccess: refetchPlanDetails, onError: (err) => toast.error(`Failed to delete: ${err.message}`) });
    };

    return (
        <Card className="bg-background overflow-hidden">
            <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <p className="font-semibold">{exercise.exercise_details.name}</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSet} disabled={!canEdit || isAddingSet}>Add Set</Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDeleteExercise} disabled={!canEdit || isDeletingExercise}><Trash2 className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="p-2 space-y-1.5">
                {sets.map((set, index) => (
                    <CompactSetEditor 
                        key={set.fieldId}
                        control={control}
                        setPath={`${exercisePath}.sets.${index}` as const}
                        canEdit={canEdit}
                        onDelete={() => remove(index)} // For now, optimistic UI remove. A mutation would be better.
                        refetchPlanDetails={refetchPlanDetails}
                    />
                ))}
            </div>
        </Card>
    );
};


// ====================================================================
// --- Compact Set Editor (Row-based) ---
// ====================================================================
interface CompactSetEditorProps {
    control: Control<PlanEditFormData>;
    setPath: string;
    canEdit: boolean;
    onDelete: () => void;
    refetchPlanDetails: () => void;
}

const CompactSetEditor: React.FC<CompactSetEditorProps> = ({ control, setPath, canEdit, onDelete, refetchPlanDetails }) => {
    const { mutate: deleteSet, isPending: isDeletingSet } = useDeletePlanSessionExerciseSetMutation();
    const currentSet = useWatch({ control, name: setPath as any });
    
    const handleDeleteSet = () => {
      deleteSet({ p_set_id: currentSet.id }, { onSuccess: refetchPlanDetails, onError: (err) => toast.error(`Failed: ${err.message}`) });
    };
    
    const setType = currentSet.set_type as Tables<'plan_session_exercise_sets'>['set_type'];
    const showRepsWeight = ['normal', 'warmup', 'dropset', 'amrap', 'pyramid', 'failure', 'rest_pause'].includes(setType);
    const showDuration = ['emom', 'for_time', 'tabata', 'isometrics'].includes(setType);

    return (
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 text-sm">
            <span className="font-mono text-muted-foreground text-xs pr-2">Set {currentSet.set_number}</span>
            <FormField control={control} name={`${setPath}.set_type` as const} render={({ field }) => ( <FormControl><Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="warmup">Warmup</SelectItem><SelectItem value="dropset">Dropset</SelectItem><SelectItem value="amrap">AMRAP</SelectItem><SelectItem value="for_time">For Time</SelectItem><SelectItem value="failure">To Failure</SelectItem></SelectContent></Select></FormControl>)} />
            {showRepsWeight ? <FormField control={control} name={`${setPath}.target_reps` as const} render={({ field }) => (<FormControl><Input type="number" placeholder="Reps" {...field} className="h-8" disabled={!canEdit} /></FormControl>)} /> : <div/>}
            {showRepsWeight ? <FormField control={control} name={`${setPath}.target_weight` as const} render={({ field }) => (<FormControl><Input type="number" placeholder="kg" {...field} className="h-8" disabled={!canEdit} /></FormControl>)} /> : <div/>}
            {showDuration ? <FormField control={control} name={`${setPath}.target_duration_seconds` as const} render={({ field }) => (<FormControl><Input type="number" placeholder="Seconds" {...field} className="h-8" disabled={!canEdit} /></FormControl>)} /> : <div/>}
            <FormField control={control} name={`${setPath}.target_rest_seconds` as const} render={({ field }) => (<FormControl><Input type="number" placeholder="Rest (s)" {...field} className="h-8" disabled={!canEdit} /></FormControl>)} />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDeleteSet} disabled={!canEdit || isDeletingSet}><Trash2 className="h-4 w-4" /></Button>
        </div>
    );
};