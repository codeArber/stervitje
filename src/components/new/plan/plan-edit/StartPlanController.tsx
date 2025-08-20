// FILE: src/components/plans/StartPlanController.tsx

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';

// --- API & State ---
import { usePlanGoalsQuery, useStartPlanForUserMutation, useStartPlanWithBaselinesMutation } from '@/api/plan';
import type { PlanGoalWithExerciseDetails, UserBaseline } from '@/api/plan/endpoint';
import { findMetricByValue } from '@/utils/goal-metrics'; // Ensure path is correct

// --- UI Components ---
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

// --- Controller Component (No changes needed here) ---
interface StartPlanControllerProps {
  planId: string;
}
export const StartPlanController: React.FC<StartPlanControllerProps> = ({ planId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: goals, refetch: checkForGoals, isFetching } = usePlanGoalsQuery(planId, { enabled: false });
  const { mutate: startPlanSimple, isPending: isStartingSimple } = useStartPlanForUserMutation();
  const { mutateAsync: startWithBaselinesAsync, isPending: isStartingWithBaselines } = useStartPlanWithBaselinesMutation();
  const isLoading = isFetching || isStartingSimple || isStartingWithBaselines;

  const handleStartClick = async () => {
    const { data: fetchedGoals } = await checkForGoals();
    if (fetchedGoals && fetchedGoals.length > 0) {
      setIsDialogOpen(true);
    } else {
      startPlanSimple(planId, {
        onSuccess: () => toast.success("Plan started!"),
        onError: (err) => toast.error(`Failed to start: ${err.message}`),
      });
    }
  };

  return (
    <>
      <Button size="lg" onClick={handleStartClick} disabled={isLoading}>
        <PlusCircle className="mr-2 h-5 w-5" />
        {isLoading ? 'Checking...' : 'Start This Plan'}
      </Button>
      <SetBaselinesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        goals={goals || []}
        planId={planId}
        startWithBaselinesAsync={startWithBaselinesAsync}
        isPending={isStartingWithBaselines}
      />
    </>
  );
};


// --- Dialog Sub-component (DEFINITIVELY CORRECTED) ---
interface SetBaselinesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goals: PlanGoalWithExerciseDetails[]; // <-- Use the correct type
  planId: string;
  startWithBaselinesAsync: (vars: { planId: string; baselines: UserBaseline[] }) => Promise<any>;
  isPending: boolean;
}
const SetBaselinesDialog: React.FC<SetBaselinesDialogProps> = ({ isOpen, onClose, goals, planId, startWithBaselinesAsync, isPending }) => {
  const form = useForm({
    // Use an effect to reset the form when goals data changes
  });

  useEffect(() => {
    if (goals) {
      form.reset({
        baselines: goals.map(g => ({ goal_id: g.id, value: '' }))
      });
    }
  }, [goals, form.reset]);

  const { fields } = useFieldArray({ control: form.control, name: "baselines" });

  const onSubmit = form.handleSubmit(async (data) => {
    const baselinesPayload: UserBaseline[] = data.baselines.map(b => ({
      goal_id: b.goal_id,
      baseline_value: Number(b.value)
    }));
    const toastId = toast.loading("Starting plan with your baselines...");
    try {
      await startWithBaselinesAsync({ planId, baselines: baselinesPayload });
      toast.success("Plan started successfully!", { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(`Failed to start: ${err.message}`, { id: toastId });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Starting Baselines</DialogTitle>
          <DialogDescription>This plan has goals. Enter your current performance to personalize them.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((field, index) => {
              const goal = goals[index]; // `goal` is now of the correct type
              const metricInfo = findMetricByValue(goal.metric);
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`baselines.${index}.value`}
                  rules={{ required: "This field is required." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {goal.title} {/* <-- CORRECT: Access property directly */}
                        {goal.exercises && <span className="text-muted-foreground"> ({goal.exercises.name})</span>} {/* <-- CORRECT: Access nested property */}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`Current ${metricInfo?.label || 'Value'}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Starting...' : 'Confirm & Start Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};