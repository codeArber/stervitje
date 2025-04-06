// src/api/user_plans/index.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userPlanApi from './endpoint'; // Relative import
import type { DiscoverablePlan, UserPlan } from '@/types/planTypes'; // Adjust path
import type { CreateUserPlanPayload, UpdateUserPlanPayload } from './endpoint'; // Import payload types


export const planKeys = {
    // ... other plan keys
    detailUsers: (planId: string) => ['plans', planId, 'users'] as const,
}

// Define the structure we expect back, including nested plan details
export interface UserPlanWithPlanDetails extends UserPlan {
    // Supabase returns the joined table name as the key
    plans: DiscoverablePlan | null; // Or PlanDetail if you need more info
}

export const userPlanKeys = {
    all: ['userPlans'] as const,
    lists: () => [...userPlanKeys.all, 'list'] as const,
    // Query key for fetching the list of plans assigned to a specific user
    list: (userId: string) => [...userPlanKeys.lists(), { userId }] as const,
    details: () => [...userPlanKeys.all, 'detail'] as const,
    // Query key for fetching details of a specific user plan assignment (might not be needed often)
    detail: (userPlanId: string) => [...userPlanKeys.details(), userPlanId] as const,
  };
/**
 * Hook for creating a new user plan assignment.
 */
export const useCreateUserPlan = () => {
    const queryClient = useQueryClient();

    // Variables includes the payload. user_id is needed for invalidation.
    type CreateVars = CreateUserPlanPayload; // Assuming payload contains user_id

    // Mutation takes CreateVars, returns the new UserPlan
    return useMutation<UserPlan, Error, CreateVars>({
        mutationFn: (vars) => userPlanApi.createUserPlan(vars), // Pass the full payload
        onSuccess: (newUserPlan, variables) => {
            console.log('User Plan assignment created:', newUserPlan);
            // Invalidate the list of user plans for the specific user
            queryClient.invalidateQueries({ queryKey: userPlanKeys.list(variables.user_id) });
            // Optional: Invalidate list of users for the specific plan if you show that
             queryClient.invalidateQueries({ queryKey: planKeys.detailUsers(variables.plan_id) });
            // Optional: Optimistic update
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useCreateUserPlan for User ${variables.user_id}, Plan ${variables.plan_id}:`, error);
            alert(`Assign Plan Error: ${error.message}`); // Replace UI
        },
    });
};

export const useGetUserPlans = (userId: string | undefined | null) => {
    return useQuery<UserPlanWithPlanDetails[], Error>({ // Specify return type and error type
        // Use the query key defined earlier for a user's list
        queryKey: userPlanKeys.list(userId!), // Use non-null assertion or handle undefined key
        // The query function calls the endpoint function
        queryFn: () => userPlanApi.getUserPlans(userId!), // Pass userId
        // Only enable the query if a userId is actually provided
        enabled: !!userId,
        // Optional: Configure staleTime or cacheTime if needed
        // staleTime: 5 * 60 * 1000, // e.g., 5 minutes
    });
};

/**
 * Hook for updating a user plan assignment's details.
 */
export const useUpdateUserPlan = () => {
    const queryClient = useQueryClient();

    // Variables need userPlanId, updateData, and userId (for invalidation)
    type UpdateVars = { userPlanId: string; updateData: UpdateUserPlanPayload; userId: string; planId: string; };

    // Mutation takes vars, returns updated UserPlan
    return useMutation<UserPlan, Error, UpdateVars>({
        mutationFn: (vars) => userPlanApi.updateUserPlan({ userPlanId: vars.userPlanId, updateData: vars.updateData }),
        onSuccess: (updatedUserPlan, variables) => {
            console.log(`User Plan ${variables.userPlanId} updated:`, updatedUserPlan);
            // Invalidate the list of user plans for the specific user
            queryClient.invalidateQueries({ queryKey: userPlanKeys.list(variables.userId) });
            // Optional: Invalidate list of users for the specific plan if status changed etc.
             queryClient.invalidateQueries({ queryKey: planKeys.detailUsers(variables.planId) });
            // Optional: Optimistic update
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdateUserPlan (ID: ${variables.userPlanId}):`, error);
            alert(`Update User Plan Error: ${error.message}`); // Replace UI
        },
    });
};

/**
 * Hook for deleting a user plan assignment.
 */
export const useDeleteUserPlan = () => {
    const queryClient = useQueryClient();

    // Variables need userPlanId, userId, and planId (for invalidation)
    type DeleteVars = { userPlanId: string; userId: string; planId: string; };

    // Mutation takes vars, returns { success: boolean }
    return useMutation<{ success: boolean }, Error, DeleteVars>({
        mutationFn: (vars) => userPlanApi.deleteUserPlan(vars.userPlanId),
        onSuccess: (data, variables) => {
            console.log(`User Plan ${variables.userPlanId} deleted successfully`);
            // Invalidate the list of user plans for the specific user
            queryClient.invalidateQueries({ queryKey: userPlanKeys.list(variables.userId) });
             // Optional: Invalidate list of users for the specific plan
             queryClient.invalidateQueries({ queryKey: planKeys.detailUsers(variables.planId) });
            // Optional: Optimistic update
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeleteUserPlan (ID: ${variables.userPlanId}):`, error);
            alert(`Delete User Plan Error: ${error.message}`); // Replace UI
        },
    });
};