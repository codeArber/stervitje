// FILE: /src/api/plan/usePlanGoals.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import {
  addPlanGoal, updatePlanGoal, deletePlanGoal,
  fetchPendingBaselinesForSession, fetchPlanGoals
} from './planGoals.endpoint'; // Import from specific endpoint file
import type { PlanGoalPayload, PendingBaselineGoal, PlanGoal, PlanGoalWithExerciseDetails } from '@/types/plan/planGoals';

// --- QUERIES ---

/**
 * @description Hook for fetching goals that require a baseline from the user for a specific session.
 * @param planSessionId The ID of the plan session.
 * @param options Options for the query, including `enabled`.
 */
export const usePendingBaselinesQuery = (planSessionId: string | undefined, options: { enabled: boolean }) => {
    return useQuery<PendingBaselineGoal[], Error>({
        queryKey: planKeys.pendingBaselines(planSessionId!),
        queryFn: () => fetchPendingBaselinesForSession(planSessionId!),
        enabled: !!planSessionId && options.enabled,
    });
};

/**
 * @description Hook for fetching all goals for a specific plan, including exercise details.
 * @param planId The ID of the plan.
 * @param options Options for the query, including `enabled`.
 */
export const usePlanGoalsQuery = (planId: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery<PlanGoalWithExerciseDetails[], Error>({
        queryKey: planKeys.planGoals(planId!),
        queryFn: () => fetchPlanGoals(planId!),
        enabled: !!planId && (options?.enabled ?? true),
    });
};

// --- MUTATIONS ---

/**
 * @description Hook for adding a new goal to a plan.
 * @param planId The ID of the plan to add the goal to.
 */
export const useAddPlanGoalMutation = (planId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<PlanGoal, Error, PlanGoalPayload>({
    mutationFn: (payload) => addPlanGoal(planId!, payload), // Assert planId because enabled will be true
    onSuccess: () => {
      toast.success("Goal added!");
      if (planId) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) }); // Invalidate full plan details
        queryClient.invalidateQueries({ queryKey: planKeys.planGoals(planId) }); // Invalidate specific goals query
      }
    },
    onError: (err) => toast.error(`Failed to add goal: ${err.message}`),
  });
};

/**
 * @description Hook for updating an existing plan goal.
 * @param planId The ID of the plan to which the goal belongs.
 */
export const useUpdatePlanGoalMutation = (planId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<PlanGoal, Error, { goalId: string, payload: PlanGoalPayload }>({
    mutationFn: (variables) => updatePlanGoal(variables.goalId, variables.payload),
    onSuccess: () => {
      toast.success("Goal updated!");
      if (planId) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        queryClient.invalidateQueries({ queryKey: planKeys.planGoals(planId) });
      }
    },
    onError: (err) => toast.error(`Failed to update goal: ${err.message}`),
  });
};

/**
 * @description Hook for deleting a plan goal.
 * @param planId The ID of the plan to which the goal belongs.
 */
export const useDeletePlanGoalMutation = (planId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ // `string` is the goalId
    mutationFn: (goalId) => deletePlanGoal(goalId),
    onSuccess: () => {
      toast.success("Goal deleted!");
      if (planId) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        queryClient.invalidateQueries({ queryKey: planKeys.planGoals(planId) });
      }
    },
    onError: (err) => toast.error(`Failed to delete goal: ${err.message}`),
  });
};