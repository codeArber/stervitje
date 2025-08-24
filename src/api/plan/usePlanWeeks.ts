// FILE: /src/api/plan/usePlanWeeks.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { addPlanWeek, updatePlanWeek, deletePlanWeek } from './planWeeks.endpoint';
import type { AddPlanWeekPayload, UpdatePlanWeekPayload, DeletePlanWeekPayload, PlanWeek } from '@/types/plan/planWeeks';

// --- MUTATIONS ---

/**
 * @description Hook for adding a new week to a plan.
 */
export const useAddPlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, AddPlanWeekPayload>({
    mutationFn: (payload) => addPlanWeek(payload),
    onSuccess: (newWeek) => {
      toast.success(`Week ${newWeek.week_number} added!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newWeek.plan_id) }); // Invalidate full plan details
      queryClient.invalidateQueries({ queryKey: planKeys.planWeeks(newWeek.plan_id) }); // Invalidate specific weeks query
    },
    onError: (error) => {
      toast.error(`Failed to add week: ${error.message}`);
    }
  });
};

/**
 * @description Hook for updating an existing plan week.
 */
export const useUpdatePlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, UpdatePlanWeekPayload>({
    mutationFn: (payload) => updatePlanWeek(payload),
    onSuccess: (updatedWeek) => {
      toast.success(`Week ${updatedWeek.week_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(updatedWeek.plan_id) });
      queryClient.invalidateQueries({ queryKey: planKeys.planWeeks(updatedWeek.plan_id) });
    },
    onError: (error) => {
      toast.error(`Failed to update week: ${error.message}`);
    }
  });
};

/**
 * @description Hook for deleting a plan week.
 */
export const useDeletePlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanWeekPayload>({
    mutationFn: (payload) => deletePlanWeek(payload),
    onSuccess: (_, deletedWeekPayload) => {
      toast.success(`Week deleted successfully!`);
      // NOTE: Invalidation needs access to the plan_id of the deleted week's parent.
      // If the payload only contains `p_week_id`, the RPC needs to return `plan_id`
      // or you need to fetch it before deleting. For now, a broad invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete week: ${error.message}`);
    }
  });
};