// FILE: /src/api/plan/usePlanDays.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { addPlanDay, updatePlanDay, deletePlanDay } from './planDays.endpoint';
import { AddPlanDayPayload, DeletePlanDayPayload, PlanDay, UpdatePlanDayPayload } from '@/types/plan/PlanDays';

// --- MUTATIONS ---

/**
 * @description Hook for adding a new plan day.
 */
export const useAddPlanDayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, AddPlanDayPayload>({
    mutationFn: (payload) => addPlanDay(payload),
    onSuccess: (newDay) => {
      toast.success(`Day ${newDay.day_number} added!`);
      // Invalidate queries related to the parent week and full plan.
      // NOTE: Assumes newDay.plan_week_id is available for invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.planDays(newDay.plan_week_id) }); // Specific days for this week
      // The full plan details query also needs to be invalidated if days affect it.
      // This would require the RPC to return the parent plan_id. For now, broad.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to add day: ${error.message}`);
    }
  });
};

/**
 * @description Hook for updating an existing plan day.
 */
export const useUpdatePlanDayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, UpdatePlanDayPayload>({
    mutationFn: (payload) => updatePlanDay(payload),
    onSuccess: (updatedDay) => {
      toast.success(`Day ${updatedDay.day_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.planDays(updatedDay.plan_week_id) }); // Invalidate specific days for this week
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to update day: ${error.message}`);
    }
  });
};

/**
 * @description Hook for deleting a plan day.
 */
export const useDeletePlanDayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanDayPayload>({
    mutationFn: (payload) => deletePlanDay(payload),
    onSuccess: (_, deletedDayPayload) => {
      toast.success(`Day deleted successfully!`);
      // NOTE: Invalidation needs access to the plan_week_id of the deleted day's parent.
      // If the payload only contains `p_day_id`, the RPC needs to return `plan_week_id`
      // or you need to fetch it before deleting. For now, a broad invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete day: ${error.message}`);
    }
  });
};