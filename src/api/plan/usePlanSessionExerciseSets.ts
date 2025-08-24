// FILE: /src/api/plan/usePlanSessionExerciseSets.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { addPlanSessionExerciseSet, updatePlanSessionExerciseSet, deletePlanSessionExerciseSet } from './planSessionExerciseSets.endpoint';
import type { AddPlanSessionExerciseSetPayload, UpdatePlanSessionExerciseSetPayload, DeletePlanSessionExerciseSetPayload, PlanSet } from '@/types/plan/planSessionExerciseSets';

// --- MUTATIONS ---

/**
 * @description Hook for adding a new set to a plan session exercise.
 */
export const useAddPlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSet, Error, AddPlanSessionExerciseSetPayload>({
    mutationFn: (payload) => addPlanSessionExerciseSet(payload),
    onSuccess: (newSet) => {
      toast.success(`Set ${newSet.set_number} added!`);
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExerciseSets(newSet.plan_session_exercise_id) }); // Specific sets for this exercise
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to add set: ${error.message}`);
    }
  });
};

/**
 * @description Hook for updating an existing set within a plan session exercise.
 */
export const useUpdatePlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSet, Error, UpdatePlanSessionExerciseSetPayload>({
    mutationFn: (payload) => updatePlanSessionExerciseSet(payload),
    onSuccess: (updatedSet) => {
      toast.success(`Set ${updatedSet.set_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExerciseSets(updatedSet.plan_session_exercise_id) });
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to update set: ${error.message}`);
    }
  });
};

/**
 * @description Hook for deleting a set from a plan session exercise.
 */
export const useDeletePlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionExerciseSetPayload>({
    mutationFn: (payload) => deletePlanSessionExerciseSet(payload),
    onSuccess: (_, deletedSetPayload) => {
      toast.success(`Set deleted successfully!`);
      // NOTE: Invalidation needs access to the plan_session_exercise_id of the deleted set's parent.
      // If the payload only contains `p_set_id`, the RPC needs to return `plan_session_exercise_id`
      // or you need to fetch it before deleting. For now, a broad invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete set: ${error.message}`);
    }
  });
};