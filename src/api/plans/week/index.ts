// src/api/plans/week/index.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as weekApi from './endpoint'; // Relative import
import type { PlanWeek, PlanDetail } from '@/types/planTypes'; // Adjust path
import type { CreateWeekPayload, UpdateWeekPayload } from './endpoint'; // Import payload types

// Import planKeys - consider putting this in a shared file 'src/api/plans/keys.ts'
// If keys are not shared, define planKeys.detail here or pass it
import { planKeys } from '../plan'; // Assuming keys are exported from ../plan/index.ts

/**
 * Hook for creating a new week within a plan.
 */
export const useCreatePlanWeek = () => {
    const queryClient = useQueryClient();

    // Mutation takes the payload, returns the new PlanWeek
    return useMutation<PlanWeek, Error, CreateWeekPayload>({
        mutationFn: weekApi.createPlanWeek,
        onSuccess: (newWeek, variables) => {
            console.log('Plan Week created:', newWeek);
            // Invalidate the parent plan's details query to refetch the entire structure
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.plan_id) });

            // Optional: Optimistically add the new week to the cached plan details
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.plan_id), (oldData) => {
            //     if (!oldData) return null;
            //     const updatedWeeks = [...(oldData.plan_weeks || []), newWeek].sort((a, b) => a.week_number - b.week_number);
            //     return { ...oldData, plan_weeks: updatedWeeks };
            // });
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreatePlanWeek for Plan ID ${variables.plan_id}:`, error);
            alert(`Create Week Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for updating a plan week's description.
 */
export const useUpdatePlanWeek = () => {
    const queryClient = useQueryClient();

    // Variables need weekId, updateData, and planId (for invalidation)
    type UpdateVars = { weekId: string; updateData: UpdateWeekPayload; planId: string };

    // Mutation takes vars, returns updated PlanWeek (basic info)
    return useMutation<PlanWeek, Error, UpdateVars>({
        mutationFn: (vars) => weekApi.updatePlanWeek({ weekId: vars.weekId, updateData: vars.updateData }),
        onSuccess: (updatedWeek, variables) => {
            console.log(`Plan Week ${variables.weekId} updated:`, updatedWeek);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistically update the specific week within the cached plan details
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) => {
            //     if (!oldData?.plan_weeks) return oldData;
            //     const updatedWeeks = oldData.plan_weeks.map(week =>
            //         week.id === variables.weekId ? { ...week, ...updatedWeek } : week
            //     );
            //     return { ...oldData, plan_weeks: updatedWeeks };
            // });
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlanWeek (ID: ${variables.weekId}):`, error);
            alert(`Update Week Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting a plan week.
 */
export const useDeletePlanWeek = () => {
    const queryClient = useQueryClient();

    // Variables need weekId and planId (for invalidation)
    type DeleteVars = { weekId: string; planId: string };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => weekApi.deletePlanWeek(vars.weekId),
        onSuccess: (data, variables) => {
            console.log(`Plan Week ${variables.weekId} deleted successfully`);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistically remove the week from the cached plan details
            // queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) => {
            //     if (!oldData?.plan_weeks) return oldData;
            //     const updatedWeeks = oldData.plan_weeks.filter(week => week.id !== variables.weekId);
            //     // Potentially re-number subsequent weeks? Or handle numbering separately.
            //     return { ...oldData, plan_weeks: updatedWeeks };
            // });
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeletePlanWeek (ID: ${variables.weekId}):`, error);
            alert(`Delete Week Error: ${error.message}`); // Replace UI
        },
    });
};