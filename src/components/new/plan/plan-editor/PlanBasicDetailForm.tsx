// FILE: src/components/plan-editor/PlanBasicDetailsForm.tsx

import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
from '@/components/ui/select';

// Icons
import { Save, FileText, Lock, Unlock, Trophy } from 'lucide-react';

// API Hooks & Types
import { usePlanDetailsQuery } from '@/api/plan'; // Just for data type reference
import type { Plan } from '@/types/plan'; // For Plan type
import { supabase } from '@/lib/supabase/supabaseClient'; // Direct supabase call for update RPC


// Zod schema for basic plan details (matches parts of Tables<'plans'>)
const planBasicDetailsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").nullable().optional(),
  difficulty_level: z.preprocess(
    // Preprocess: Convert empty string or "null" string from Select to actual null, otherwise to Number
    (val) => (val === '' || val === 'null' ? null : Number(val)), // <--- FIXED PREPROCESS FOR "null" STRING
    z.number().int().min(1, "Difficulty must be 1-5").max(5, "Difficulty must be 1-5").nullable().optional(),
  ),
  private: z.boolean().default(false).optional(),
  // For simplicity, allow_public_forking is not editable here directly, but could be added.
});

type PlanBasicDetailsFormData = z.infer<typeof planBasicDetailsSchema>;

interface PlanBasicDetailsFormProps {
  planId: string;
  initialPlanData: Plan; // The initial plan data to pre-fill the form
  canEdit: boolean; // Permission to edit
  onSaveSuccess?: () => void; // Optional callback on successful save
}

export const PlanBasicDetailsForm: React.FC<PlanBasicDetailsFormProps> = ({
  planId,
  initialPlanData,
  canEdit,
  onSaveSuccess,
}) => {
  const form = useForm<PlanBasicDetailsFormData>({
    resolver: zodResolver(planBasicDetailsSchema),
    defaultValues: {
      title: initialPlanData.title,
      description: initialPlanData.description,
      difficulty_level: initialPlanData.difficulty_level ?? null,
      private: initialPlanData.private,
    },
    values: { // Use `values` to keep form in sync with external `initialPlanData` changes (e.g., after an invalidation)
        title: initialPlanData.title,
        description: initialPlanData.description,
        difficulty_level: initialPlanData.difficulty_level ?? null,
        private: initialPlanData.private,
    },
  });

  const [isSaving, setIsSaving] = React.useState(false);

  const onSubmit = async (data: PlanBasicDetailsFormData) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving plan details...");

    try {
      const { error } = await supabase.rpc('update_plan_details', {
        p_plan_id: planId,
        p_title: data.title,
        p_description: data.description,
        p_difficulty_level: data.difficulty_level,
        p_private: data.private,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Plan details saved!", { id: toastId });
      onSaveSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`, { id: toastId });
      console.error("Error saving plan details:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Basic Plan Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Plan" {...field} disabled={!canEdit || isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief overview of the plan..." rows={3} {...field} disabled={!canEdit || isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Difficulty Level
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'null' ? null : Number(value))} // <--- FIXED onValueChange
                    value={field.value === null ? 'null' : field.value.toString()} // <--- FIXED value prop
                    disabled={!canEdit || isSaving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">(Optional) No Level</SelectItem> {/* <--- FIXED value prop */}
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canEdit || isSaving}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make Plan Private</FormLabel>
                    <FormDescription>
                      If checked, this plan will only be visible to its creator and team members.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {canEdit && (
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Details"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};