// FILE: src/components/plan-editor/ExerciseEditor.tsx

import React from 'react';
import { useFieldArray, UseFormReturn, Control } from 'react-hook-form';
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AccordionContent, AccordionItem, AccordionTrigger, Accordion
} from '@/components/ui/accordion';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

// Icons
import { Dumbbell, Edit, Trash2, PlusCircle, Save, GripVertical, Info } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// API Hooks & Types
import { useUpdatePlanSessionExerciseMutation, useDeletePlanSessionExerciseMutation, useAddPlanSessionExerciseSetMutation } from '@/api/plan';
import type { PlanExercise, PlanSet, AddPlanSessionExerciseSetPayload, UpdatePlanSessionExercisePayload } from '@/types/plan';

// Import the SetEditor
import { SetEditor } from './SetEditor';
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';


interface ExerciseEditorProps {
  exercise: PlanExercise & { sets: PlanSet[] };
  exerciseIndex: number;
  sessionIndex: number;
  dayIndex: number;
  weekIndex: number;
  canEdit: boolean;
  form: UseFormReturn<PlanEditFormData>;
  control: Control<PlanEditFormData>;
  onDeleteSuccess?: () => void;
  refetchPlanDetails: () => void; // Passed from parent
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  exercise,
  exerciseIndex,
  sessionIndex,
  dayIndex,
  weekIndex,
  canEdit,
  form,
  control,
  onDeleteSuccess,
  refetchPlanDetails, // Destructure
}) => {
  const { mutate: updateExercise, isPending: isUpdatingExercise } = useUpdatePlanSessionExerciseMutation();
  const { mutate: deleteExercise, isPending: isDeletingExercise } = useDeletePlanSessionExerciseMutation();
  const { mutate: addSet, isPending: isAddingSet } = useAddPlanSessionExerciseSetMutation();

  const [isEditingExerciseDetails, setIsEditingExerciseDetails] = React.useState(false);

  // Use useFieldArray for managing sets within this exercise
  const { fields: sets, append: appendSet, remove: removeSet } = useFieldArray({
    control: form.control,
    name: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.exercises.${exerciseIndex}.sets` as const,
    keyName: 'fieldId',
  });

  // Define the common path prefix for this exercise
  const exercisePathPrefix = `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.exercises.${exerciseIndex}` as const;

  // Handle saving exercise details (notes, execution_group, rest_seconds)
  const handleSaveExerciseDetails = () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this plan.");
      return;
    }
    const toastId = toast.loading('Saving exercise details...');

    const values = form.getValues(exercisePathPrefix);

    const payload: UpdatePlanSessionExercisePayload = {
      p_plan_session_exercise_id: exercise.id,
      p_exercise_id: values.exercise_id,
      p_order_within_session: values.order_within_session,
      p_notes: values.notes ?? null,
      p_execution_group: values.execution_group ?? null,
      p_post_exercise_rest_seconds: values.post_exercise_rest_seconds ?? null,
      p_post_group_rest_seconds: values.post_group_rest_seconds ?? null,
    };

    updateExercise(payload, {
      onSuccess: () => {
        toast.success('Exercise details updated!', { id: toastId });
        setIsEditingExerciseDetails(false);
        refetchPlanDetails(); // Refetch after updating exercise details
      },
      onError: (err) => {
        toast.error(`Failed to save exercise: ${err.message}`, { id: toastId });
      }
    });
  };

  // Handle adding a new set
  const handleAddSet = () => {
    if (!canEdit) {
      toast.error("You don't have permission to add sets.");
      return;
    }
    const nextSetNumber = (sets.length > 0 ? Math.max(...sets.map(s => s.set_number)) : 0) + 1;
    
    const payload: AddPlanSessionExerciseSetPayload = {
      p_plan_session_exercise_id: exercise.id,
      p_set_number: nextSetNumber,
      p_set_type: 'normal', // Default to normal set
      p_target_reps: null, // Set to null default
      p_target_weight: null,
      p_notes: null,
      p_target_duration_seconds: null,
      p_target_distance_meters: null,
      p_target_rest_seconds: null,
      p_metadata: null,
    };

    const toastId = toast.loading(`Adding Set ${nextSetNumber}...`);
    addSet(payload, {
      onSuccess: (newSetData) => {
        toast.success(`Set ${newSetData.set_number} added!`, { id: toastId });
        refetchPlanDetails(); // Refetch after adding set
      },
      onError: (err) => {
        toast.error(`Failed to add set: ${err.message}`, { id: toastId });
      }
    });
  };

  // Handle deleting the entire exercise
  const handleDeleteExercise = () => {
    if (!canEdit) {
      toast.error("You don't have permission to delete exercises.");
      return;
    }
    if (!confirm(`Are you sure you want to delete this exercise? This will also delete all sets within it.`)) {
      return;
    }
    const toastId = toast.loading('Deleting exercise...');
    deleteExercise({ p_plan_session_exercise_id: exercise.id }, {
      onSuccess: () => {
        toast.success('Exercise deleted!', { id: toastId });
        onDeleteSuccess?.(); // Notify parent SessionEditor to refetch/update hierarchy
      },
      onError: (err) => {
        toast.error(`Failed to delete exercise: ${err.message}`, { id: toastId });
      }
    });
  };

  return (
    <AccordionItem value={exercise.id}>
      <AccordionTrigger className="font-semibold text-base hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <img src={exercise.exercise_details.image_url || 'https://placehold.co/20x20?text=E'} alt={exercise.exercise_details.name} className="h-6 w-6 rounded-sm object-cover" />
            <span>Exercise {exercise.order_within_session}: {exercise.exercise_details.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsEditingExerciseDetails(true); }} disabled={!canEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteExercise(); }} disabled={!canEdit || isDeletingExercise}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6 space-y-4">
        {isEditingExerciseDetails && (
          <Card className="p-4 bg-muted/20">
            <h4 className="font-semibold mb-2">Edit Exercise Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${exercisePathPrefix}.order_within_session` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Within Session</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!canEdit || isUpdatingExercise}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${exercisePathPrefix}.notes` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes for this exercise..."
                        rows={2}
                        {...field}
                        disabled={!canEdit || isUpdatingExercise}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add fields for execution_group, post_exercise_rest_seconds, post_group_rest_seconds */}
              <FormField
                control={form.control}
                name={`${exercisePathPrefix}.execution_group` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Group</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g., 1 (for supersets)"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!canEdit || isUpdatingExercise}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${exercisePathPrefix}.post_exercise_rest_seconds` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rest After Exercise (s)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g., 60"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!canEdit || isUpdatingExercise}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${exercisePathPrefix}.post_group_rest_seconds` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rest After Group (s)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g., 120 (for superset end)"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!canEdit || isUpdatingExercise}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setIsEditingExerciseDetails(false)} disabled={isUpdatingExercise}>Cancel</Button>
              <Button size="sm" onClick={handleSaveExerciseDetails} disabled={!canEdit || isUpdatingExercise}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </Card>
        )}

        {/* Link to view exercise details */}
        <div className="flex justify-end">
            <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.exercise_id }} className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                <Info className="h-3 w-3" /> View Exercise Details
            </Link>
        </div>

        {/* Sets within this exercise */}
        <h4 className="font-semibold text-lg mt-4">Sets</h4>
        <Button size="sm" onClick={handleAddSet} disabled={!canEdit || isAddingSet}>
          <PlusCircle className="mr-2 h-4 w-4" /> {isAddingSet ? 'Adding Set...' : 'Add Set'}
        </Button>
        <div className="space-y-3">
          {sets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sets added to this exercise yet.</p>
          ) : (
            sets.map((setField, setIndex) => (
              <SetEditor
                key={setField.id}
                set={setField}
                setIndex={setIndex}
                exerciseIndex={exerciseIndex}
                sessionIndex={sessionIndex}
                dayIndex={dayIndex}
                weekIndex={weekIndex}
                canEdit={canEdit}
                form={form}
                control={control}
                onDeleteSuccess={refetchPlanDetails} // Pass refetch for set delete success
              />
            ))
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};