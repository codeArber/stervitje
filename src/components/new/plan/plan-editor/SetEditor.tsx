// FILE: src/components/plan-editor/SetEditor.tsx

import React from 'react';
import { UseFormReturn, Control, useWatch } from 'react-hook-form'; // Import useWatch
import { toast } from 'sonner';
import { z } from 'zod'; // For type inference

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Icons
import { Trash2, Save, GripVertical, Dumbbell, Clock, Ruler, Text, Scale } from 'lucide-react';

// API Hooks & Types
import { useUpdatePlanSessionExerciseSetMutation, useDeletePlanSessionExerciseSetMutation } from '@/api/plan';
import type { PlanSet, UpdatePlanSessionExerciseSetPayload } from '@/types/plan';
import type { Tables } from '@/types/database.types'; // For set_type enum
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';


interface SetEditorProps {
  set: PlanSet; // Set data
  setIndex: number; // Index in the `sets` array
  exerciseIndex: number; // Index of parent exercise
  sessionIndex: number; // Index of parent session
  dayIndex: number; // Index of parent day
  weekIndex: number; // Index of parent week
  canEdit: boolean; // Permission to edit
  form: UseFormReturn<PlanEditFormData>; // Passed down from main PlanEditPage
  control: Control<PlanEditFormData>; // Passed down for useFieldArray
  onDeleteSuccess?: () => void; // Callback after successful delete
}

export const SetEditor: React.FC<SetEditorProps> = ({
  set,
  setIndex,
  exerciseIndex,
  sessionIndex,
  dayIndex,
  weekIndex,
  canEdit,
  form,
  control,
  onDeleteSuccess,
}) => {
  const { mutate: updateSet, isPending: isUpdatingSet } = useUpdatePlanSessionExerciseSetMutation();
  const { mutate: deleteSet, isPending: isDeletingSet } = useDeletePlanSessionExerciseSetMutation();

  // Watch the set_type field to conditionally render inputs
  const currentSetType = useWatch({
    control,
    name: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.exercises.${exerciseIndex}.sets.${setIndex}.set_type` as const,
    defaultValue: set.set_type,
  }) as Tables<'plan_session_exercise_sets'>['set_type'];

  // Define the common path prefix for this set
  const setPathPrefix = `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.exercises.${exerciseIndex}.sets.${setIndex}` as const;


  // Handle saving set details
  const handleSaveSetDetails = () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this plan.");
      return;
    }
    const toastId = toast.loading('Saving set details...');

    // Get current values from the form state for this specific set
    const values = form.getValues(setPathPrefix);

    const payload: UpdatePlanSessionExerciseSetPayload = {
      p_set_id: set.id,
      p_set_number: values.set_number,
      p_target_reps: values.target_reps ?? null,
      p_target_weight: values.target_weight ?? null,
      p_target_duration_seconds: values.target_duration_seconds ?? null,
      p_target_distance_meters: values.target_distance_meters ?? null,
      p_target_rest_seconds: values.target_rest_seconds ?? null,
      p_notes: values.notes ?? null,
      p_set_type: values.set_type,
      p_metadata: values.metadata ?? null,
    };

    updateSet(payload, {
      onSuccess: () => {
        toast.success('Set details updated!', { id: toastId });
      },
      onError: (err) => {
        toast.error(`Failed to save set: ${err.message}`, { id: toastId });
      }
    });
  };

  // Handle deleting the set
  const handleDeleteSet = () => {
    if (!canEdit) {
      toast.error("You don't have permission to delete sets.");
      return;
    }
    if (!confirm(`Are you sure you want to delete Set ${set.set_number}?`)) {
      return;
    }
    const toastId = toast.loading('Deleting set...');
    deleteSet({ p_set_id: set.id }, {
      onSuccess: () => {
        toast.success('Set deleted!', { id: toastId });
        onDeleteSuccess?.(); // Notify parent ExerciseEditor to refetch/update hierarchy
      },
      onError: (err) => {
        toast.error(`Failed to delete set: ${err.message}`, { id: toastId });
      }
    });
  };


  return (
    <Card className="p-4 bg-background/50 border relative group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Save button (can be integrated into field blur later for autosave, or explicit) */}
        <Button variant="ghost" size="sm" onClick={handleSaveSetDetails} disabled={!canEdit || isUpdatingSet}>
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteSet} disabled={!canEdit || isDeletingSet}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <h4 className="font-semibold text-md">Set {set.set_number}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
        {/* Set Type */}
        <FormField
          control={form.control}
          name={`${setPathPrefix}.set_type` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!canEdit || isUpdatingSet}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="warmup">Warmup</SelectItem>
                  <SelectItem value="dropset">Dropset</SelectItem>
                  <SelectItem value="amrap">AMRAP</SelectItem>
                  <SelectItem value="emom">EMOM</SelectItem>
                  <SelectItem value="for_time">For Time</SelectItem>
                  <SelectItem value="tabata">Tabata</SelectItem>
                  <SelectItem value="pyramid">Pyramid</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="rest_pause">Rest Pause</SelectItem>
                  <SelectItem value="isometrics">Isometrics</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Fields based on Set Type */}
        {(currentSetType === 'normal' || currentSetType === 'warmup' || currentSetType === 'dropset' || currentSetType === 'amrap' || currentSetType === 'pyramid' || currentSetType === 'failure' || currentSetType === 'rest_pause') && (
          <>
            <FormField
              control={form.control}
              name={`${setPathPrefix}.target_reps` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> Target Reps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="e.g., 10"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      disabled={!canEdit || isUpdatingSet}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${setPathPrefix}.target_weight` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Scale className="h-3 w-3" /> Target Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 50"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      disabled={!canEdit || isUpdatingSet}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {(currentSetType === 'emom' || currentSetType === 'for_time' || currentSetType === 'tabata' || currentSetType === 'isometrics') && (
          <FormField
            control={form.control}
            name={`${setPathPrefix}.target_duration_seconds` as const}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1"><Clock className="h-3 w-3" /> Duration (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="e.g., 60"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={!canEdit || isUpdatingSet}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentSetType === 'tabata' && (
          <FormField
            control={form.control}
            name={`${setPathPrefix}.target_rest_seconds` as const}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1"><Clock className="h-3 w-3" /> Rest Between Intervals (s)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="e.g., 20"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={!canEdit || isUpdatingSet}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Common fields applicable to most set types */}
        {(currentSetType === 'for_time' || currentSetType === 'emom') && (
            <FormField
                control={form.control}
                name={`${setPathPrefix}.target_distance_meters` as const}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-1"><Ruler className="h-3 w-3" /> Target Distance (m)</FormLabel>
                    <FormControl>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        disabled={!canEdit || isUpdatingSet}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}

        <FormField
            control={form.control}
            name={`${setPathPrefix}.target_rest_seconds` as const}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-1"><Clock className="h-3 w-3" /> Rest After Set (s)</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 60"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                            disabled={!canEdit || isUpdatingSet}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name={`${setPathPrefix}.notes` as const}
          render={({ field }) => (
            <FormItem className="lg:col-span-3"> {/* Span full width */}
              <FormLabel className="flex items-center gap-1"><Text className="h-3 w-3" /> Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Drop set on last set, focus on form"
                  rows={2}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={!canEdit || isUpdatingSet}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* metadata field is not directly exposed in UI yet, but can be added */}
      </div>
    </Card>
  );
};