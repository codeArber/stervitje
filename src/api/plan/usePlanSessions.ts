// FILE: /src/api/plan/usePlanSessions.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { addPlanSession, updatePlanSession, deletePlanSession } from './planSessions.endpoint';
import type { AddPlanSessionPayload, UpdatePlanSessionPayload, DeletePlanSessionPayload, PlanSession } from '@/types/plan/planSessions';

// --- MUTATIONS ---

/**
 * @description Hook for adding a new session to a plan day.
 */
export const useAddPlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, AddPlanSessionPayload>({
    mutationFn: (payload) => addPlanSession(payload),
    onSuccess: (newSession) => {
      toast.success(`Session ${newSession.order_index} added!`);
      // Invalidate queries related to the parent day and full plan.
      // NOTE: Assumes newSession.plan_day_id is available for invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.planSessions(newSession.plan_day_id) }); // Specific sessions for this day
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to add session: ${error.message}`);
    }
  });
};

/**
 * @description Hook for updating an existing plan session.
 */
export const useUpdatePlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, UpdatePlanSessionPayload>({
    mutationFn: (payload) => updatePlanSession(payload),
    onSuccess: (updatedSession) => {
      toast.success(`Session ${updatedSession.order_index} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.planSessions(updatedSession.plan_day_id) }); // Invalidate specific sessions for this day
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    }
  });
};

/**
 * @description Hook for deleting a plan session.
 */
export const useDeletePlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionPayload>({
    mutationFn: (payload) => deletePlanSession(payload),
    onSuccess: (_, deletedSessionPayload) => {
      toast.success(`Session deleted successfully!`);
      // NOTE: Invalidation needs access to the plan_day_id of the deleted session's parent.
      // If the payload only contains `p_session_id`, the RPC needs to return `plan_day_id`
      // or you need to fetch it before deleting. For now, a broad invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    }
  });
};