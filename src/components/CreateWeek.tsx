// src/components/plans/CreateWeekForm.tsx (New File)
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // For week number (read-only?)
import { Textarea } from "@/components/ui/textarea";
import { useCreatePlanWeek } from '@/api/plans/week';
// We don't need the full PlanWeekPayload type here, just description perhaps
// Let's define a specific schema for the form input

const CreateWeekFormSchema = z.object({
  description: z.string().max(500).optional(),
  // week_number is determined automatically, not user input usually
});

type CreateWeekFormValues = z.infer<typeof CreateWeekFormSchema>;

interface CreateWeekFormProps {
  planId: string;
  nextWeekNumber: number; // Calculate this in the parent and pass it down
  onSuccess?: () => void; // Optional callback on successful creation
}

export function CreateWeekForm({ planId, nextWeekNumber, onSuccess }: CreateWeekFormProps) {
  const createWeekMutation = useCreatePlanWeek();

  const form = useForm<CreateWeekFormValues>({
    resolver: zodResolver(CreateWeekFormSchema),
    defaultValues: {
      description: "",
    },
  });

  function onSubmit(values: CreateWeekFormValues) {
    console.log("Submitting Week Data:", values);

    // Construct the full payload for the API
    const payload = {
        plan_id: planId,
        week_number: nextWeekNumber,
        description: values.description || null, // Send null if empty
    };

    createWeekMutation.mutate(payload, {
        onSuccess: (newWeek) => {
            console.log("Week created via mutation:", newWeek);
            form.reset(); // Reset form fields
            onSuccess?.(); // Call the success callback (e.g., close dialog)
        },
        onError: (error) => {
            // Error is already logged/alerted by the hook
            console.error("Create week form submission error:", error);
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Week Number Display (Read-only) */}
         <FormItem>
            <FormLabel>Adding Week Number</FormLabel>
            <FormControl>
               <Input type="number" value={nextWeekNumber} readOnly className="bg-muted" />
            </FormControl>
            <FormDescription>
               This will be the next week in the plan sequence.
            </FormDescription>
         </FormItem>

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="E.g., Focus on technique refinement..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''} // Handle potential null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createWeekMutation.isPending}>
          {createWeekMutation.isPending ? 'Adding Week...' : 'Add Week'}
        </Button>
      </form>
    </Form>
  );
}