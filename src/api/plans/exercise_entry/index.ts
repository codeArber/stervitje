// src/api/plans/exerciseEntry/index.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as exerciseEntryApi from './endpoint'; // Relative import
import type { PlanSessionExercise, PlanDetail } from '@/types/planTypes'; // Adjust path
import type { CreateExerciseEntryPayload, UpdateExerciseEntryPayload } from './endpoint'; // Import payload types

// Import planKeys from the shared location or parent
import { planKeys } from '../plan'; // Assuming keys are exported from ../plan/index.ts

/**
 * Hook for creating (adding) an exercise entry to a plan session.
 */
export const useCreatePlanSessionExercise = () => {
    const queryClient = useQueryClient();

    // Variables need payload and planId (for invalidation)
    type CreateVars = CreateExerciseEntryPayload & { planId: string };

    // Mutation takes CreateVars, returns the new PlanSessionExercise (with linked exercise, empty sets)
    return useMutation<PlanSessionExercise, Error, CreateVars>({
        mutationFn: (vars) => exerciseEntryApi.createPlanSessionExercise({ // Pass only payload fields to API
            plan_session_id: vars.plan_session_id,
            exercise_id: vars.exercise_id,
            order_index: vars.order_index,
            notes: vars.notes,
            target_rest_seconds: vars.target_rest_seconds,
        }),
        onSuccess: (newEntry, variables) => {
            console.log('Plan Session Exercise created:', newEntry);
            // Invalidate the parent plan's details query to refetch the entire structure
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (find session, add exercise entry to it)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreatePlanSessionExercise for Session ID ${variables.plan_session_id}:`, error);
            alert(`Add Exercise Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for updating a plan session exercise entry's details (notes, rest, order).
 */
export const useUpdatePlanSessionExercise = () => {
    const queryClient = useQueryClient();

    // Variables need exerciseEntryId, updateData, and planId (for invalidation)
    type UpdateVars = { exerciseEntryId: string; updateData: UpdateExerciseEntryPayload; planId: string };

    // Mutation takes vars, returns updated PlanSessionExercise (with nested sets)
    return useMutation<PlanSessionExercise, Error, UpdateVars>({
        mutationFn: (vars) => exerciseEntryApi.updatePlanSessionExercise({ exerciseEntryId: vars.exerciseEntryId, updateData: vars.updateData }),
        onSuccess: (updatedEntry, variables) => {
            console.log(`Plan Session Exercise ${variables.exerciseEntryId} updated:`, updatedEntry);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (find entry in nested cache and update its fields)
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlanSessionExercise (ID: ${variables.exerciseEntryId}):`, error);
            alert(`Update Exercise Entry Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting a plan session exercise entry (and its sets).
 */
export const useDeletePlanSessionExercise = () => {
    const queryClient = useQueryClient();

    // Variables need exerciseEntryId and planId (for invalidation)
    type DeleteVars = { exerciseEntryId: string; planId: string };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => exerciseEntryApi.deletePlanSessionExercise(vars.exerciseEntryId),
        onSuccess: (data, variables) => {
            console.log(`Plan Session Exercise ${variables.exerciseEntryId} deleted successfully`);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (filter entry out of nested cache)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeletePlanSessionExercise (ID: ${variables.exerciseEntryId}):`, error);
            alert(`Delete Exercise Entry Error: ${error.message}`); // Replace UI
        },
    });
};