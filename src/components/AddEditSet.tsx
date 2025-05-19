// src/components/plans/AddEditSetForm.tsx (New File)
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Keep if schema defined here

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Also update/create the Zod schema definition (as shown above or in types file)
import { PlanExerciseSet, PlanSetPayload } from '@/types/planTypes';
import { useCreatePlanSet, useUpdatePlanSet } from '@/api/plans/session_set';
import { CreateSetPayload } from '@/api/plans/session_set/endpoint';
 // Adjust path
 
// Zod for the Add/Edit Set Form (can be in types file)
export const SetFormSchema = z.object({
    target_reps: z.coerce.number().int().min(0).optional().nullable(), // Allow 0 reps
    target_weight: z.coerce.number().min(0).optional().nullable(), // Allow 0 weight
    target_weight_unit: z.enum(['kg', 'lb']).optional().nullable(),
    target_duration_seconds: z.coerce.number().int().min(0).optional().nullable(),
    target_distance_meters: z.coerce.number().min(0).optional().nullable(),
    target_rest_seconds: z.coerce.number().int().min(0).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
}).refine(data => (data.target_weight !== null && data.target_weight !== undefined && data.target_weight > 0) ? data.target_weight_unit !== null && data.target_weight_unit !== undefined : true, {
    message: "Weight unit is required if weight > 0",
    path: ["target_weight_unit"],
});
export type SetFormValues = z.infer<typeof SetFormSchema>;


interface AddEditSetFormProps {
  planId: string;
  exerciseEntryId: string;
  setNumber: number; // The number for the set being added/edited
  existingSetData?: PlanExerciseSet | null; // Pass data if editing
  onSuccess?: () => void;
}

export function AddEditSetForm({
  planId,
  exerciseEntryId,
  setNumber,
  existingSetData = null, // Default to null for adding
  onSuccess,
}: AddEditSetFormProps) {
  const isEditing = !!existingSetData;
  const createSetMutation = useCreatePlanSet();
  const updateSetMutation = useUpdatePlanSet();

  const form = useForm<SetFormValues>({
    resolver: zodResolver(SetFormSchema),
    defaultValues: { // Populate with existing data if editing
        target_reps: existingSetData?.target_reps ?? undefined,
        target_weight: existingSetData?.target_weight ?? undefined,
        target_weight_unit: existingSetData?.target_weight_unit ?? null,
        target_duration_seconds: existingSetData?.target_duration_seconds ?? undefined,
        target_distance_meters: existingSetData?.target_distance_meters ?? undefined,
        target_rest_seconds: existingSetData?.target_rest_seconds ?? undefined,
        notes: existingSetData?.notes ?? '',
    },
  });

    // Reset form if editing data changes (e.g., opening dialog for different set)
    useEffect(() => {
        if (isEditing && existingSetData) {
            form.reset({
                target_reps: existingSetData.target_reps ?? undefined,
                target_weight: existingSetData.target_weight ?? undefined,
                target_weight_unit: existingSetData.target_weight_unit ?? null,
                target_duration_seconds: existingSetData.target_duration_seconds ?? undefined,
                target_distance_meters: existingSetData.target_distance_meters ?? undefined,
                target_rest_seconds: existingSetData.target_rest_seconds ?? undefined,
                notes: existingSetData.notes ?? '',
            });
        } else if (!isEditing) {
             form.reset(); // Reset to defaults when switching to add mode
        }
    }, [existingSetData, isEditing, form]);


  function onSubmit(values: SetFormValues) {
    console.log("Submitting Set Data:", values);

    // Construct payload, converting undefined form values to null for DB
    const payload: PlanSetPayload = {
        target_reps: values.target_reps ?? null,
        target_weight: values.target_weight ?? null,
        target_weight_unit: values.target_weight_unit, // Already nullable
        target_duration_seconds: values.target_duration_seconds ?? null,
        target_distance_meters: values.target_distance_meters ?? null,
        target_rest_seconds: values.target_rest_seconds ?? null,
        notes: values.notes || null,
    };

    if (isEditing && existingSetData) {
        // Update Existing Set
        updateSetMutation.mutate({ setId: existingSetData.id, updateData: payload, planId }, {
            onSuccess: (updatedSet) => {
                console.log("Set updated:", updatedSet);
                onSuccess?.(); // Close dialog
            },
             onError: (error) => { console.error("Update set error:", error); }
        });
    } else {
        // Create New Set
         const createPayload: CreateSetPayload = { // Type from set/endpoint.ts
            ...payload,
            plan_session_exercise_id: exerciseEntryId,
            set_number: setNumber,
         };
        createSetMutation.mutate({ ...createPayload, planId }, {
            onSuccess: (newSet) => {
                console.log("Set created:", newSet);
                form.reset(); // Reset after successful creation
                onSuccess?.(); // Close dialog
            },
             onError: (error) => { console.error("Create set error:", error); }
        });
    }
  }

  const isLoading = createSetMutation.isPending || updateSetMutation.isPending;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-h-[70vh] overflow-y-auto p-1">
        <FormDescription>Details for Set {setNumber}</FormDescription>
        {/* Grid for parameters */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <FormField control={form.control} name="target_reps" render={({ field }) => (
            <FormItem>
              <FormLabel>Target Reps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  {...field}
                  onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="target_weight" render={({ field }) => (
            <FormItem>
              <FormLabel>Target Weight</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 50"
                  {...field}
                  onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="target_weight_unit" render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="kg/lb" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
  
          <FormField control={form.control} name="target_duration_seconds" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (s)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g., 60"
                  {...field}
                  onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
  
          {/* Add distance if needed */}
          <FormField control={form.control} name="target_rest_seconds" render={({ field }) => (
            <FormItem>
              <FormLabel>Rest After (s)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g., 90"
                  {...field}
                  onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
  
        {/* Notes Field */}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Set Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notes for this specific set..."
                className="min-h-[50px] resize-y"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
  
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : isEditing ? 'Update Set' : 'Add Set'}
        </Button>
      </form>
    </Form>
  );  
}