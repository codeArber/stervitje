import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreatePlanDay } from "@/api/plans/day"; // Assuming useCreatePlanDay hook is available

// Define Zod Schema for the form
const CreateDayFormSchema = z.object({
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  is_rest_day: z.boolean().optional().default(false),
});

type CreateDayFormValues = z.infer<typeof CreateDayFormSchema>;

interface CreateDayFormProps {
  planId: string; // Needed for invalidation
  weekId: string;
  nextDayNumber: number;
  onSuccess?: () => void;
}

export function CreateDayForm({
  planId,
  weekId,
  nextDayNumber,
  onSuccess,
}: CreateDayFormProps) {
  const createDayMutation = useCreatePlanDay();

  const form = useForm<CreateDayFormValues>({
    resolver: zodResolver(CreateDayFormSchema),
    defaultValues: {
      title: "",
      description: "",
      is_rest_day: false,
    },
  });

  function onSubmit(values: CreateDayFormValues) {
    const payload = {
      plan_week_id: weekId,
      day_number: nextDayNumber,
      title: values.title || null,
      description: values.description || null,
      is_rest_day: values.is_rest_day,
    };

    createDayMutation.mutate({ ...payload, planId: planId }, {
      onSuccess: (newDay) => {
        console.log("Day created:", newDay);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Create day form error:", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Day Number (Read-only) */}
        <FormItem>
          <FormLabel>Day Number</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={nextDayNumber}
              readOnly
              className="bg-muted"
            />
          </FormControl>
          <FormDescription>Day number within the week.</FormDescription>
        </FormItem>

        {/* Title */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Day Title (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="E.g., Monday Training, Rest Day"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Description */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Day Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Overall description for the day..."
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Rest Day Switch */}
        <FormField control={form.control} name="is_rest_day" render={({ field }) => (
          <FormItem>
            <FormLabel>Rest Day</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Submit Button */}
        <Button type="submit" disabled={createDayMutation.isPending}>
          {createDayMutation.isPending ? 'Adding Day...' : 'Add Day'}
        </Button>
      </form>
    </Form>
  );
}
