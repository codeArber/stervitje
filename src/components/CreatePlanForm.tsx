// src/components/plans/CreatePlanForm.tsx (New File)
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Import Select components if needed for fields like visibility, difficulty
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatePlanSchema, CreatePlanPayload } from '@/types/type'; // Adjust path
import { useCreatePlan } from '@/api/plans/plan';

interface CreatePlanFormProps {
  onSuccess?: () => void; // Optional callback on successful creation
}

export function CreatePlanForm({ onSuccess }: CreatePlanFormProps) {
  const createPlanMutation = useCreatePlan();

  const form = useForm<CreatePlanPayload>({
    resolver: zodResolver(CreatePlanSchema),
    defaultValues: {
      title: "",
      description: "",
      // Initialize other fields if they are part of the schema
      // visibility: 'private',
    },
  });

  function onSubmit(values: CreatePlanPayload) {
    console.log("Submitting Plan Data:", values);
    createPlanMutation.mutate(values, {
        onSuccess: (newPlan) => {
            console.log("Plan created via mutation:", newPlan);
            form.reset(); // Reset form fields
            onSuccess?.(); // Call the success callback (e.g., close dialog)
        },
        onError: (error) => {
            // Error is already logged/alerted by the hook, but you could add more specific handling
            console.error("Form submission error:", error);
        }
    });
  }

  return (
    // Use shadcn Form component
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Beginner Strength Program" {...field} />
              </FormControl>
              <FormDescription>
                A short, descriptive title for your plan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the goal or focus of this plan..."
                  className="resize-none"
                  {...field}
                   // Assign value explicitly to handle potential null from optional field
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add other FormFields here for difficulty, duration, sport, visibility etc. */}
        {/* Example for Visibility using Select: */}
        {/*
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who can see this plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private (Only You)</SelectItem>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                   <SelectItem value="team">Team (Requires Team Selection - more complex)</SelectItem>
                </SelectContent>
              </Select>
               <FormDescription>
                 Default is Private. Public plans can be discovered by others.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Button type="submit" disabled={createPlanMutation.isPending}>
          {createPlanMutation.isPending ? 'Creating Plan...' : 'Create Plan'}
        </Button>
      </form>
    </Form>
  );
}