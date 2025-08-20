// FILE: src/components/plans/SetBaselinesDialog.tsx

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSetGoalBaselineMutation } from '@/api/performance';
import type { PendingBaselineGoal } from '@/api/plan/endpoint';
import { useAuthStore } from '@/stores/auth-store';

// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SetBaselinesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBaselinesSet: () => void; // Callback to proceed to workout
  goals: PendingBaselineGoal[];
}

export const SetBaselinesDialog: React.FC<SetBaselinesDialogProps> = ({ isOpen, onClose, onBaselinesSet, goals }) => {
  const { user } = useAuthStore();
  const { mutate: setBaseline, isPending } = useSetGoalBaselineMutation(user!.id);

  const form = useForm({
    defaultValues: {
      baselines: goals.map(g => ({ progressId: g.progress_id, value: '' }))
    }
  });
  const { fields } = useFieldArray({ control: form.control, name: "baselines" });

  const onSubmit = form.handleSubmit((data) => {
    const baselinePromises = data.baselines.map(baseline => {
      return new Promise((resolve, reject) => {
        setBaseline({
          progressId: baseline.progressId,
          baselineValue: Number(baseline.value),
        }, { onSuccess: resolve, onError: reject });
      });
    });

    toast.promise(Promise.all(baselinePromises), {
        loading: 'Saving baselines...',
        success: () => {
            onBaselinesSet(); // Call the callback to start the workout
            return 'Baselines saved! Starting workout...';
        },
        error: 'Failed to save a baseline.',
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Baselines</DialogTitle>
          <DialogDescription>
            Before you start, we need your current performance for the following goals.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((field, index) => {
              const goal = goals[index];
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`baselines.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{goal.goal_title} ({goal.exercise_name})</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`Current ${goal.metric.replace(/_/g, ' ')}`} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            })}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save & Start Workout'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};