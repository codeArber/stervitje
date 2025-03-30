// src/components/plans/CreateSessionForm.tsx (New File)
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
import { useCreatePlanSession } from '@/api/plans/plan_session';
// Define Zod Schema for the form
const CreateSessionFormSchema = z.object({
  title: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  // order_index is managed by parent
});
type CreateSessionFormValues = z.infer<typeof CreateSessionFormSchema>;

interface CreateSessionFormProps {
  planId: string; // Needed for invalidation
  dayId: string;
  nextOrderIndex: number;
  onSuccess?: () => void;
}

export function CreateSessionForm({ planId, dayId, nextOrderIndex, onSuccess }: CreateSessionFormProps) {
  const createSessionMutation = useCreatePlanSession();

  const form = useForm<CreateSessionFormValues>({
    resolver: zodResolver(CreateSessionFormSchema),
    defaultValues: {
      title: "",
      notes: "",
    },
  });

  function onSubmit(values: CreateSessionFormValues) {
    const payload = {
      plan_day_id: dayId,
      order_index: nextOrderIndex,
      title: values.title || null,
      notes: values.notes || null,
    };

    createSessionMutation.mutate({ ...payload, planId: planId }, {
      onSuccess: (newSession) => {
        console.log("Session created:", newSession);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Create session form error:", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>Session Order</FormLabel>
          <FormControl>
            <Input type="number" value={nextOrderIndex} readOnly className="bg-muted" />
          </FormControl>
          <FormDescription>Order within the day.</FormDescription>
        </FormItem>

        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Session Title (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="E.g., Morning Strength, Evening Run" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Session Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Overall goal or notes for this session..." {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={createSessionMutation.isPending}>
          {createSessionMutation.isPending ? 'Adding Session...' : 'Add Session'}
        </Button>
      </form>
    </Form>
  );
}