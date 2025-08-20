// FILE: src/ui/plan/edit/PlanGoalsEditor.tsx

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// --- API & TYPES ---
import { useAddPlanGoalMutation, useUpdatePlanGoalMutation, useDeletePlanGoalMutation } from '@/api/plan';
import type { PlanGoal } from '@/types/plan';
import type { Enums } from '@/types/database.types';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trophy, Edit, Trash2, Badge } from 'lucide-react';
import { findMetricByValue, GOAL_CATEGORIES, GoalCategory } from '@/utils/goal-metrics';
import { GoalCard } from './GoalCard';

// --- Utility to get our metric definitions ---

// --- NEW Zod Schema for the Goal Form ---
const goalFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  metric: z.string().min(1, "Please select a metric."),
  direction: z.enum(['increase', 'decrease']),
  target_type: z.enum(['absolute_value', 'percent_change', 'absolute_change']),
  target_value: z.coerce.number().min(0, "Target must be a positive number."),
  description: z.string().nullable().optional(),
  exercise_id: z.string().uuid().nullable().optional(),
});
type GoalFormData = z.infer<typeof goalFormSchema>;

// --- Main Editor Component (UPDATED) ---
interface PlanGoalsEditorProps {
  planId: string;
  goals: PlanGoal[] | null;
  canEdit: boolean;
}

export const PlanGoalsEditor: React.FC<PlanGoalsEditorProps> = ({ planId, goals, canEdit }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PlanGoal | null>(null);
  const { mutate: deleteGoal, isPending: isDeleting } = useDeletePlanGoalMutation(planId);

  const handleAddNew = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (goal: PlanGoal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
        deleteGoal(goalId);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Plan Goals</CardTitle>
            <CardDescription>Define the primary objectives for this training plan.</CardDescription>
        </div>
        {canEdit && (
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Goal</Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!goals || goals.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">No goals defined yet.</p>
        ) : (
          goals.map(goal => (
            // --- THIS IS THE CHANGE ---
            // Replace the old div with the new GoalCard component
            <GoalCard
              key={goal.id}
              goal={goal}
              canEdit={canEdit}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDelete(goal.id)}
              isDeleting={isDeleting}
            />
            // --- END OF CHANGE ---
          ))
        )}
      </CardContent>
      
      {/* The Dialog for Adding/Editing Goals remains the same */}
      <GoalFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        planId={planId}
        editingGoal={editingGoal}
      />
    </Card>
  );
};

// --- Form Dialog Sub-component (UPDATED with disabled logic) ---
interface GoalFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  editingGoal: PlanGoal | null;
}

const GoalFormDialog: React.FC<GoalFormDialogProps> = ({ isOpen, onOpenChange, planId, editingGoal }) => {
  const { mutate: addGoal, isPending: isAdding } = useAddPlanGoalMutation(planId);
  const { mutate: updateGoal, isPending: isUpdating } = useUpdatePlanGoalMutation(planId);
  const isEditMode = !!editingGoal;
  const isLoading = isAdding || isUpdating;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      direction: 'increase',
      target_type: 'absolute_value',
      exercise_id: null,
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  
  const selectedMetricValue = form.watch('metric');
  const selectedMetric = findMetricByValue(selectedMetricValue);
  const selectedTargetType = form.watch('target_type');

  // --- THIS LOGIC IS THE KEY ---
  // Determine if the selected metric is exercise-specific
  const isExerciseMetric = selectedMetricValue && [
    "one_rep_max_kg", "max_weight_for_reps_kg", "max_reps_at_weight", "max_reps_bodyweight",
    "max_vertical_jump_cm", "max_box_jump_height_cm", "throw_distance_m"
  ].includes(selectedMetricValue);
  // --- END OF KEY LOGIC ---

  useEffect(() => {
    if (editingGoal && isOpen) {
      form.reset({
        title: editingGoal.title,
        description: editingGoal.description,
        metric: editingGoal.metric,
        direction: editingGoal.direction,
        target_type: editingGoal.target_type,
        target_value: Number(editingGoal.target_value),
        exercise_id: editingGoal.exercise_id,
      });
      const metricInfo = findMetricByValue(editingGoal.metric);
      const parentCategory = GOAL_CATEGORIES.find(cat => cat.metrics.some(m => m.value === metricInfo?.value));
      setSelectedCategory(parentCategory || null);
    } else if (!isOpen) {
      form.reset({ direction: 'increase', target_type: 'absolute_value', exercise_id: null });
      setSelectedCategory(null);
    }
  }, [editingGoal, isOpen, form]);

  const handleCategoryChange = (categoryName: string) => {
    const category = GOAL_CATEGORIES.find(c => c.name === categoryName) || null;
    setSelectedCategory(category);
    form.setValue('metric', '');
    form.setValue('exercise_id', null);
  };

  const handleMetricChange = (metricValue: string) => {
      form.setValue('metric', metricValue);
      // If the new metric is not exercise-specific, clear the exercise_id
      const isNowExerciseSpecific = ["one_rep_max_kg", "max_weight_for_reps_kg", "max_reps_at_weight", "max_reps_bodyweight", "max_vertical_jump_cm", "max_box_jump_height_cm", "throw_distance_m"].includes(metricValue);
      if (!isNowExerciseSpecific) {
          form.setValue('exercise_id', null);
      }
  }

  const onSubmit = (data: GoalFormData) => {
    const payload = { ...data, metric: data.metric as Enums<'goal_metric'>, };
    if (isEditMode) {
      updateGoal({ goalId: editingGoal.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      addGoal(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const getTargetLabel = () => {
    const unit = selectedMetric?.unit || '...';
    switch(selectedTargetType) {
        case 'absolute_value': return `Target Value (${unit})`;
        case 'percent_change': return `Percentage Change (%)`;
        case 'absolute_change': return `Change Amount (${unit})`;
        default: return 'Target Value';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Add a New Goal'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Increase Bench Press" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            
            <div className="grid grid-cols-2 gap-4">
                <FormItem><FormLabel>Goal Category</FormLabel><Select onValueChange={handleCategoryChange} value={selectedCategory?.name || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger></FormControl><SelectContent>{GOAL_CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent></Select></FormItem>
                <FormField control={form.control} name="metric" render={({ field }) => (
                    <FormItem><FormLabel>Specific Metric</FormLabel><Select onValueChange={handleMetricChange} value={field.value} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select metric..." /></SelectTrigger></FormControl><SelectContent>{selectedCategory?.metrics.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
            
            {/* --- THIS IS THE UPDATED SECTION --- */}
            <FormField control={form.control} name="exercise_id" render={({ field }) => (
              <FormItem>
                  <FormLabel className={!isExerciseMetric ? 'text-muted-foreground' : ''}>
                      Exercise (Optional)
                  </FormLabel>
                  {/* Here you would render your <ExerciseSelectorDialog> or a simple dropdown */}
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={!isExerciseMetric}>
                       <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder={isExerciseMetric ? "Select an exercise..." : "Not applicable for this metric"} />
                          </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                          {/* This should be populated by a query to your exercises */}
                          <SelectItem value="2f422e05-0ef6-442f-bf02-15a68ae01b2b">Bench Press</SelectItem>
                          <SelectItem value="a83ef2b1-397e-47d2-9d0a-6d423fba29c1">Barbell Squat</SelectItem>
                       </SelectContent>
                  </Select>
                  <FormDescription>Link this goal to a specific exercise if applicable.</FormDescription>
                  <FormMessage />
              </FormItem>
            )}/>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="direction" render={({ field }) => (
                    <FormItem><FormLabel>Direction</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="increase">Increase</SelectItem><SelectItem value="decrease">Decrease</SelectItem></SelectContent></Select></FormItem>
                )}/>
                 <FormField control={form.control} name="target_type" render={({ field }) => (
                    <FormItem><FormLabel>Target Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="absolute_value">To a Specific Value</SelectItem><SelectItem value="percent_change">By a Percentage</SelectItem><SelectItem value="absolute_change">By a Fixed Amount</SelectItem></SelectContent></Select></FormItem>
                )}/>
            </div>

            <FormField control={form.control} name="target_value" render={({ field }) => (
                <FormItem>
                    <FormLabel>{getTargetLabel()}</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10" {...field} disabled={!selectedMetric} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};