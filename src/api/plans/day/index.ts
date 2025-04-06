// src/api/plans/day/index.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as dayApi from './endpoint'; // Relative import
import type { PlanDay, PlanDayDetails, PlanDetail } from '@/types/planTypes'; // Adjust path
import type { CreateDayPayload, UpdateDayPayload } from './endpoint'; // Import payload types

// Import planKeys from the shared location or parent
import { planKeys } from '../plan'; // Assuming keys are exported from ../plan/index.ts

export const planDayKeys = {
    all: ['planDays'] as const,
    details: () => [...planDayKeys.all, 'detail'] as const,
    detail: (planDayId: string | undefined) => [...planDayKeys.details(), planDayId] as const,
};

/**
 * Hook for creating a new day within a plan week.
 */
export const useCreatePlanDay = () => {
    const queryClient = useQueryClient();

    // Variables need the payload AND the top-level planId for invalidation
    type CreateVars = CreateDayPayload & { planId: string };

    // Mutation takes CreateVars, returns the new PlanDay
    return useMutation<PlanDay, Error, CreateVars>({
        mutationFn: (vars) => dayApi.createPlanDay({ // Pass only required payload to API
            plan_week_id: vars.plan_week_id,
            day_number: vars.day_number,
            title: vars.title,
            description: vars.description,
            is_rest_day: vars.is_rest_day,
        }),
        onSuccess: (newDay, variables) => {
            console.log('Plan Day created:', newDay);
            // Invalidate the parent plan's details query to refetch the entire structure
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (more complex to insert into nested array)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreatePlanDay for Week ID ${variables.plan_week_id}:`, error);
            alert(`Create Day Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for updating a plan day's details.
 */
export const useUpdatePlanDay = () => {
    const queryClient = useQueryClient();

    // Variables need dayId, updateData, and planId (for invalidation)
    type UpdateVars = { dayId: string; updateData: UpdateDayPayload; planId: string };

    // Mutation takes vars, returns updated PlanDay (basic info)
    return useMutation<PlanDay, Error, UpdateVars>({
        mutationFn: (vars) => dayApi.updatePlanDay({ dayId: vars.dayId, updateData: vars.updateData }),
        onSuccess: (updatedDay, variables) => {
            console.log(`Plan Day ${variables.dayId} updated:`, updatedDay);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (find day in nested cache and update)
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlanDay (ID: ${variables.dayId}):`, error);
            alert(`Update Day Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting a plan day.
 */
export const useDeletePlanDay = () => {
    const queryClient = useQueryClient();

    // Variables need dayId and planId (for invalidation)
    type DeleteVars = { dayId: string; planId: string };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => dayApi.deletePlanDay(vars.dayId),
        onSuccess: (data, variables) => {
            console.log(`Plan Day ${variables.dayId} deleted successfully`);
            // Invalidate the parent plan's details query
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });

            // Optional: Optimistic update (filter day out of nested cache)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeletePlanDay (ID: ${variables.dayId}):`, error);
            alert(`Delete Day Error: ${error.message}`); // Replace UI
        },
    });
};


export const useGetPlanDayDetails = (planDayId: string | undefined) => {
    return useQuery<PlanDayDetails | null, Error>({ // Return type can be PlanDayDetails or null
        // Use a specific query key for this day's details
        queryKey: planDayKeys.detail(planDayId),

        // Function to fetch data using the endpoint
        queryFn: () => dayApi.getPlanDayDetails(planDayId!), // Pass the ID

        // Only run the query if planDayId is available
        enabled: !!planDayId,

        // Optional: Configuration like staleTime
        // staleTime: 10 * 60 * 1000, // e.g., 10 minutes
    });
};