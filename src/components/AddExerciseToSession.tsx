// src/components/plans/AddExerciseToSessionForm.tsx
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Keep if schema defined here

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure this path is correct
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

// Adjust import paths as needed
import { useFetchExerciseListForSelector } from '@/api/exercises';
import { useCreatePlanSessionExercise } from '@/api/plans/exercise_entry';
import { PlanExerciseEntryPayload } from '@/types/planTypes';

// Define Zod Schema and Type here or import them
const AddExerciseEntrySchema = z.object({
    exercise_id: z.string().uuid({ message: "Please select a valid exercise." }),
    notes: z.string().max(500).optional().nullable(),
    target_sets_min: z.coerce.number().int().min(1).optional().nullable(),
    target_sets_max: z.coerce.number().int().min(1).optional().nullable(),
    target_rest_seconds: z.coerce.number().int().min(0).optional().nullable(), // Allow 0 rest
}).refine(data => !data.target_sets_max || !data.target_sets_min || data.target_sets_max >= data.target_sets_min, {
    message: "Max sets must be >= min sets",
    path: ["target_sets_max"],
});
type AddExerciseEntryValues = z.infer<typeof AddExerciseEntrySchema>;


interface AddExerciseToSessionFormProps {
  planId: string; // For invalidation
  sessionId: string; // Target session ID
  nextOrderIndex: number; // Order within the session
  onSuccess?: () => void;
}

export function AddExerciseToSessionForm({
  planId,
  sessionId,
  nextOrderIndex,
  onSuccess,
}: AddExerciseToSessionFormProps) {
  const createExerciseEntryMutation = useCreatePlanSessionExercise();
  const { data: exercises, isLoading: isLoadingExercises, error: exerciseError } = useFetchExerciseListForSelector();
  const [openCombobox, setOpenCombobox] = useState(false);

  const form = useForm<AddExerciseEntryValues>({
    resolver: zodResolver(AddExerciseEntrySchema),
    // Ensure defaultValues match the schema fields
    defaultValues: {
      exercise_id: '',
      notes: '',
      target_sets_min: undefined,
      target_sets_max: undefined,
      target_rest_seconds: undefined,
    },
  });

  function onSubmit(values: AddExerciseEntryValues) {
    console.log("Submitting Exercise Entry Data:", values);

    // Construct the payload expected by the API endpoint
    const payload: PlanExerciseEntryPayload & { order_index: number } = {
      plan_session_id: sessionId,
      exercise_id: values.exercise_id,
      order_index: nextOrderIndex,
      notes: values.notes || null, // Send null if empty string
      target_sets_min: values.target_sets_min ?? null, // Convert undefined to null
      target_sets_max: values.target_sets_max ?? null, // Convert undefined to null
      target_rest_seconds: values.target_rest_seconds ?? null, // Convert undefined to null
    };

    createExerciseEntryMutation.mutate({ ...payload, planId: planId }, {
      onSuccess: (newEntry) => {
        console.log("Exercise Entry created:", newEntry);
        form.reset(); // Reset form to defaults
        onSuccess?.(); // Close dialog
      },
      onError: (error) => {
        console.error("Add exercise entry form error:", error);
        // Consider showing a user-friendly error message here
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">

        {/* Exercise Combobox Field */}
        <FormField
          control={form.control}
          name="exercise_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Exercise *</FormLabel>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                      disabled={isLoadingExercises || !!exerciseError}
                    >
                      {isLoadingExercises ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading... </>
                      ) : field.value ? (
                          exercises?.find((ex) => ex.id === field.value)?.name
                      ) : ( "Select exercise..." )
                      }
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Search exercises..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingExercises ? "Loading..." : exerciseError ? "Error loading" : "No exercise found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {exercises?.map((ex) => (
                          <CommandItem
                            key={ex.id}
                            value={ex.name} // Use name for Command filtering/search
                            onSelect={(currentValue) => {
                              const selectedId = exercises?.find(e => e.name.toLowerCase() === currentValue.toLowerCase())?.id;
                              if (selectedId) {
                                form.setValue("exercise_id", selectedId, { shouldValidate: true }); // Set ID and validate
                              }
                              setOpenCombobox(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === ex.id ? "opacity-100" : "opacity-0")} />
                            {ex.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
              {exerciseError && <p className='text-xs font-medium text-destructive pt-1'>Could not load exercises: {exerciseError.message}</p>}
            </FormItem>
          )}
        />

        {/* Optional Fields for the Exercise Block */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <FormField
                control={form.control}
                name="target_sets_min"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Target Min Sets</FormLabel>
                        <FormControl><Input type="number" min="1" placeholder="e.g., 3" {...field} onChange={event => field.onChange(+event.target.value)} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="target_sets_max"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Target Max Sets</FormLabel>
                        <FormControl><Input type="number" min="1" placeholder="e.g., 5" {...field} onChange={event => field.onChange(+event.target.value)} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                     </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="target_rest_seconds"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Rest After Exercise (sec)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="Rest after all sets (e.g., 120)" {...field} onChange={event => field.onChange(+event.target.value)} value={field.value ?? ''} /></FormControl>
                    <FormDescription>Time to rest before the next exercise in the session.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Overall Notes (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Overall notes for this exercise block..." className="resize-y min-h-[60px]" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <Button type="submit" disabled={createExerciseEntryMutation.isPending || isLoadingExercises}>
          {createExerciseEntryMutation.isPending ? 'Adding...' : 'Add Exercise to Session'}
        </Button>
      </form>
    </Form>
  );
}