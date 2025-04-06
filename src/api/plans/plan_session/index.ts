// src/api/plans/session/index.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as sessionApi from './endpoint'; // Relative import
import type { PlanSession, PlanDetail } from '@/types/planTypes'; // Adjust path
import type { CreateSessionPayload, UpdateSessionPayload } from './endpoint'; // Import payload types

// Import planKeys from the shared location or parent
import { planKeys } from '../plan'; // Assuming keys are exported from ../plan/index.ts

/**
 * Hook for creating a new session within a plan day.
 */
export const useCreatePlanSession = () => {
    const queryClient = useQueryClient();

    // Variables need the payload AND the top-level planId for invalidation
    type CreateVars = CreateSessionPayload & { planId: string };

    // Mutation takes CreateVars, returns the new PlanSession
    return useMutation<PlanSession, Error, CreateVars>({
        mutationFn: (vars) => sessionApi.createPlanSession({ // Pass only required payload to API
            plan_day_id: vars.plan_day_id,
            order_index: vars.order_index,
            title: vars.title,
            notes: vars.notes,
        }),
        onSuccess: (newSession, variables) => {
            console.log('Plan Session created:', newSession);
            // Invalidate the parent plan's details query to refetch the entire structure
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (more complex: find day, add session to it)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreatePlanSession for Day ID ${variables.plan_day_id}:`, error);
            alert(`Create Session Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for updating a plan session's details.
 */
export const useUpdatePlanSession = () => {
    const queryClient = useQueryClient();

    // Variables need sessionId, updateData, and planId (for invalidation)
    type UpdateVars = { sessionId: string; updateData: UpdateSessionPayload; planId: string };

    // Mutation takes vars, returns updated PlanSession (basic info)
    return useMutation<PlanSession, Error, UpdateVars>({
        mutationFn: (vars) => sessionApi.updatePlanSession({ sessionId: vars.sessionId, updateData: vars.updateData }),
        onSuccess: (updatedSession, variables) => {
            console.log(`Plan Session ${variables.sessionId} updated:`, updatedSession);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (find session in nested cache and update)
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlanSession (ID: ${variables.sessionId}):`, error);
            alert(`Update Session Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting a plan session.
 */
export const useDeletePlanSession = () => {
    const queryClient = useQueryClient();

    // Variables need sessionId and planId (for invalidation)
    type DeleteVars = { sessionId: string; planId: string };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => sessionApi.deletePlanSession(vars.sessionId),
        onSuccess: (data, variables) => {
            console.log(`Plan Session ${variables.sessionId} deleted successfully`);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            // Optional: Optimistic update (filter session out of nested cache)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeletePlanSession (ID: ${variables.sessionId}):`, error);
            alert(`Delete Session Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for fetching a plan session by its ID.
 */
export const usePlanSession = (sessionId: string) => {
    return useQuery<PlanSession, Error>({
        queryKey: ['planSession', sessionId],
        queryFn: () => sessionApi.fetchPlanSession(sessionId),
        enabled: !!sessionId, // Only fetch if sessionId is provided
    });
};