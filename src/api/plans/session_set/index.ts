// src/api/plans/set/index.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as setApi from './endpoint'; // Relative import
import type { PlanExerciseSet, PlanDetail } from '@/types/planTypes'; // Adjust path
import type { CreateSetPayload, UpdateSetPayload } from './endpoint'; // Import payload types

// Import planKeys from the shared location or parent
import { planKeys } from '../plan'; // Assuming keys are exported from ../plan/index.ts

/**
 * Hook for creating (adding) an individual set to a plan exercise entry.
 */
export const useCreatePlanSet = () => {
    const queryClient = useQueryClient();

    // Variables need the payload AND the top-level planId for invalidation
    type CreateVars = CreateSetPayload & { planId: string };

    // Mutation takes CreateVars, returns the new PlanExerciseSet
    return useMutation<PlanExerciseSet, Error, CreateVars>({
        mutationFn: (vars) => setApi.createPlanSet({ // Pass only payload fields to API
            plan_session_exercise_id: vars.plan_session_exercise_id,
            set_number: vars.set_number,
            target_reps: vars.target_reps,
            target_weight: vars.target_weight,
            target_weight_unit: vars.target_weight_unit,
            target_duration_seconds: vars.target_duration_seconds,
            target_distance_meters: vars.target_distance_meters,
            target_rest_seconds: vars.target_rest_seconds,
            notes: vars.notes,
        }),
        onSuccess: (newSet, variables) => {
            console.log('Plan Exercise Set created:', newSet);
            // Invalidate the parent plan's details query to refetch the entire structure
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (complex: find exercise entry, add set to its sets array, re-sort)
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) => {
            //     // ... logic to find the correct exercise entry and add the newSet ...
            //     return updatedData;
            // });
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreatePlanSet for Entry ID ${variables.plan_session_exercise_id}:`, error);
            alert(`Add Set Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for updating an individual plan exercise set.
 */
export const useUpdatePlanSet = () => {
    const queryClient = useQueryClient();

    // Variables need setId, updateData, and planId (for invalidation)
    type UpdateVars = { setId: string; updateData: UpdateSetPayload; planId: string };

    // Mutation takes vars, returns updated PlanExerciseSet
    return useMutation<PlanExerciseSet, Error, UpdateVars>({
        mutationFn: (vars) => setApi.updatePlanSet({ setId: vars.setId, updateData: vars.updateData }),
        onSuccess: (updatedSet, variables) => {
            console.log(`Plan Exercise Set ${variables.setId} updated:`, updatedSet);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (complex: find the specific set in nested cache and update)
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) => {
            //    // ... logic to find and update the specific set ...
            //    return updatedData;
            // });
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlanSet (ID: ${variables.setId}):`, error);
            alert(`Update Set Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting an individual plan exercise set.
 */
export const useDeletePlanSet = () => {
    const queryClient = useQueryClient();

    // Variables need setId and planId (for invalidation)
    type DeleteVars = { setId: string; planId: string };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => setApi.deletePlanSet(vars.setId),
        onSuccess: (data, variables) => {
            console.log(`Plan Exercise Set ${variables.setId} deleted successfully`);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (complex: find exercise entry, filter set out of its array, re-number?)
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) => {
            //     // ... logic to find and remove the specific set ...
            //     return updatedData;
            // });
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeletePlanSet (ID: ${variables.setId}):`, error);
            alert(`Delete Set Error: ${error.message}`); // Replace UI
        },
    });
};