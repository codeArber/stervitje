// FILE: /src/api/plan/usePlanSessionExercises.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { addPlanSessionExercise, updatePlanSessionExercise, deletePlanSessionExercise } from './planSessionExercises.endpoint';
import type { AddPlanSessionExercisePayload, UpdatePlanSessionExercisePayload, DeletePlanSessionExercisePayload, PlanExercise } from '@/types/plan/planSessionExercises';

// --- MUTATIONS ---

/**
 * @description Hook for adding a new exercise to a plan session.
 */
export const useAddPlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanExercise, Error, AddPlanSessionExercisePayload>({
    mutationFn: (payload) => addPlanSessionExercise(payload),
    onSuccess: (newExercise) => {
      toast.success(`Exercise "${newExercise.exercise_details.name}" added!`);
      // Invalidate queries related to the parent session and full plan.
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExercises(newExercise.plan_session_id) }); // Specific exercises for this session
      // The RPC `add_plan_session_exercise` returns the full PlanExercise, which contains `plan_session_id`.
      // To invalidate the full plan details, you'd need the ultimate plan_id. This often requires another query
      // or the RPC returning more info. For now, rely on `planKeys.all` as a fallback or if the parent component
      // will handle the top-level refetch.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to add exercise: ${error.message}`);
    }
  });
};

/**
 * @description Hook for updating an existing exercise within a plan session.
 */
export const useUpdatePlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanExercise, Error, UpdatePlanSessionExercisePayload>({
    mutationFn: (payload) => updatePlanSessionExercise(payload),
    onSuccess: (updatedExercise) => {
      toast.success(`Exercise "${updatedExercise.exercise_details.name}" updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExercises(updatedExercise.plan_session_id) });
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to update exercise: ${error.message}`);
    }
  });
};

/**
 * @description Hook for deleting an exercise from a plan session.
 */
export const useDeletePlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionExercisePayload>({
    mutationFn: (payload) => deletePlanSessionExercise(payload),
    onSuccess: (_, deletedExercisePayload) => {
      toast.success(`Exercise deleted successfully!`);
      // NOTE: Invalidation needs access to the plan_session_id of the deleted exercise's parent.
      // If the payload only contains `p_plan_session_exercise_id`, the RPC needs to return `plan_session_id`
      // or you need to fetch it before deleting. For now, a broad invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete exercise: ${error.message}`);
    }
    });
};