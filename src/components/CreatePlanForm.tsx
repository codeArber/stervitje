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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCreatePlan } from '@/api/plans/plan';
import { useTeamStore } from '@/store/useTeamStore';
import { CreatePlanPayload, CreatePlanSchema } from '@/types/planTypes';

interface CreatePlanFormProps {
  onSuccess?: () => void; // Optional callback on successful creation
}

// Sports options
const SPORTS_OPTIONS = [
  "Weightlifting",
  "Bodybuilding",
  "CrossFit",
  "Running",
  "Swimming",
  "Cycling",
  "Yoga",
  "Pilates",
  "HIIT",
  "Calisthenics",
  "Other"
];

export function CreatePlanForm({ onSuccess }: CreatePlanFormProps) {
  const createPlanMutation = useCreatePlan();
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId);

  const form = useForm<CreatePlanPayload>({
    resolver: zodResolver(CreatePlanSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty_level: 3,
      duration_weeks: 4,
      sport: undefined,
      visibility: 'private',
      allow_public_forking: false,
    },
  });

  function onSubmit(values: CreatePlanPayload) {
    console.log("Submitting Plan Data:", values);

    let payload 
    if (selectedTeamId) {
      payload = {
        ...values,
        visibility: 'team',
        team_id: selectedTeamId,
      };
    } else {
      payload = values;
    }
    

    // Submit the mutation
    createPlanMutation.mutate(payload as CreatePlanPayload, {
      onSuccess: () => {
        form.reset(); // Reset form on success
        onSuccess?.(); // Call the success callback if provided
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
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Provide details about what this plan aims to achieve.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Difficulty Level Field */}
        <FormField
          control={form.control}
          name="difficulty_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[field.value || 3]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                  <div className="text-center text-sm">
                    Level: {field.value || 3}/5
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Set the difficulty level of your training plan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration Weeks Field */}
        <FormField
          control={form.control}
          name="duration_weeks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (Weeks)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={52} 
                  placeholder="4" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                How many weeks will this plan run for?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sport Field */}
        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport/Activity Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport or activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPORTS_OPTIONS.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                What type of training does this plan focus on?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Only show visibility if not in team context */}
        {!selectedTeamId && (
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Control who can see your training plan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Public Forking Field - only relevant for public plans */}
        {(form.watch("visibility") === "public" || selectedTeamId) && (
          <FormField
            control={form.control}
            name="allow_public_forking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Allow Others to Fork</FormLabel>
                  <FormDescription>
                    Let others create their own version based on your plan.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={createPlanMutation.isPending}>
          {createPlanMutation.isPending ? 'Creating Plan...' : 'Create Plan'}
        </Button>
      </form>
    </Form>
  );
}