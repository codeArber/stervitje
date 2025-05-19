// src/api/plans/plan/index.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, QueryKey, InfiniteData } from '@tanstack/react-query';
import * as planApi from './endpoint'; // Relative import
import type {
    Plan,
    PlanDetail,
    DiscoverablePlan,
    CreatePlanPayload,
    UpdatePlanPayload
} from '@/types/planTypes';

// --- Query Keys ---
// Consider placing keys in a shared file like 'src/api/plans/keys.ts'
export const planKeys = {
    all: ['plans'] as const,
    // Key for ALL plan detail queries (used for broad invalidation)
    details: () => [...planKeys.all, 'detail'] as const,
     // Key for ONE specific plan's details
    detail: (planId: string | null | undefined) => [...planKeys.details(), planId] as const,
    // Key for discoverable plans list
    discoverable: () => [...planKeys.all, 'discoverable'] as const,
    // Key for user's created plans list
    userCreated: () => [...planKeys.all, 'userCreated'] as const,
};

// --- Hooks ---

/** Hook for fetching FULL details of a single plan (including nested structure) */
export const usePlanDetails = (planId: string | null | undefined) => {
    return useQuery<PlanDetail | null, Error>({
        // Use the specific key including the ID
        queryKey: planKeys.detail(planId),
        queryFn: () => planApi.fetchPlanDetails(planId),
        enabled: !!planId, // Only fetch if planId is provided
        staleTime: 1000 * 60 * 2, // Cache fetched structure for 2 minutes (adjust as needed)
    });
};

/** Hook for fetching plans associated with a specific team */
export const useTeamPlans = (teamId: string | null | undefined) => {
    return useQuery<Plan[], Error>({
        queryKey: [...planKeys.all, 'team', teamId] as const, // Key for team-specific plans
        queryFn: () => planApi.fetchTeamPlans(teamId || ''),
        enabled: !!teamId, // Only fetch if teamId is provided
        staleTime: 1000 * 60 * 5, // Cache list for 5 minutes
    });
};

/** Hook for fetching plans created by the current user (basic info list) */
export const useUserCreatedPlans = () => {
    return useQuery<Plan[], Error>({
        queryKey: planKeys.userCreated(),
        queryFn: planApi.fetchUserCreatedPlans,
        staleTime: 1000 * 60 * 5, // Cache list longer
    });
};

/** Hook for fetching discoverable plans with infinite scrolling */
export const useInfiniteDiscoverablePlans = (limit = 20) => {
    return useInfiniteQuery<DiscoverablePlan[], Error, InfiniteData<DiscoverablePlan[]>, QueryKey, number>({
        queryKey: planKeys.discoverable(), // Base key for the infinite list
        queryFn: ({ pageParam = 1 }) => planApi.fetchDiscoverablePlans(pageParam, limit),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === limit ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });
};


/** Hook for creating a new plan (top level) */
export const useCreatePlan = () => {
     const queryClient = useQueryClient();
     // Takes CreatePlanPayload, returns basic Plan
     return useMutation<Plan, Error, CreatePlanPayload>({
        mutationFn: planApi.createPlan,
        onSuccess: (newPlan) => {
            console.log('Plan created:', newPlan);
            // Invalidate the list of user's plans so it appears
            queryClient.invalidateQueries({queryKey: planKeys.userCreated()});
             // Optional: Pre-populate cache for the detail view immediately?
             // queryClient.setQueryData(planKeys.detail(newPlan.id), newPlan); // Note: this wouldn't have nested data yet
        },
         onError: (error) => {
            console.error("Mutation Error useCreatePlan:", error);
            alert(`Create Plan Error: ${error.message}`); // Replace with better UI feedback
        },
     });
};

/** Hook for updating top-level plan details */
export const useUpdatePlan = () => {
     const queryClient = useQueryClient();
     // Takes ID and payload, returns basic Plan
     return useMutation<Plan, Error, { planId: string, updateData: UpdatePlanPayload }>({
        mutationFn: planApi.updatePlan,
        onSuccess: (updatedPlanData, variables) => {
             console.log('Plan updated:', updatedPlanData);
             // Invalidate the specific plan details query to refetch ALL data
             queryClient.invalidateQueries({queryKey: planKeys.detail(variables.planId)});
             // Also invalidate lists where title/visibility might affect display/filtering
             queryClient.invalidateQueries({queryKey: planKeys.userCreated()});
             queryClient.invalidateQueries({queryKey: planKeys.discoverable() });

             // Optional: Optimistically update the cache for basic fields
            //  queryClient.setQueryData<PlanDetail | null>(planKeys.detail(variables.planId), (oldData) =>
            //     oldData ? { ...oldData, ...updatedPlanData } : null
            //  );
        },
         onError: (error, variables) => {
            console.error(`Mutation Error useUpdatePlan (ID: ${variables.planId}):`, error);
            alert(`Update Plan Error: ${error.message}`); // Replace UI
        },
     });
};

/** Hook for deleting a plan */
export const useDeletePlan = () => {
     const queryClient = useQueryClient();
     // Takes planId (string), returns { success: boolean }
     return useMutation<{ success: boolean }, Error, string>({
        mutationFn: planApi.deletePlan,
        onSuccess: (data, deletedPlanId) => {
             console.log(`Plan ${deletedPlanId} deleted successfully`);
             // Remove the detailed query from cache
             queryClient.removeQueries({queryKey: planKeys.detail(deletedPlanId)});
             // Invalidate lists
             queryClient.invalidateQueries({queryKey: planKeys.userCreated()});
             queryClient.invalidateQueries({queryKey: planKeys.discoverable() });
        },
         onError: (error: Error, deletedPlanId) => {
            console.error(`Mutation Error useDeletePlan (ID: ${deletedPlanId}):`, error);
            alert(`Delete Plan Error: ${error.message}`); // Replace UI
        },
     });
};

/** Hook for forking a plan */
export const useForkPlan = () => {
    const queryClient = useQueryClient();
    // Takes originalPlanId (string), returns newPlanId (string)
    return useMutation<string, Error, string>({
        mutationFn: planApi.forkPlan,
        onSuccess: (newPlanId, originalPlanId) => {
            console.log(`Plan ${originalPlanId} forked successfully, new ID: ${newPlanId}`);
            // Invalidate the list of user's own plans to show the new fork
            queryClient.invalidateQueries({ queryKey: planKeys.userCreated() });
            // Invalidate the original plan's detail view to update fork count (if displayed)
            queryClient.invalidateQueries({ queryKey: planKeys.detail(originalPlanId) });
            // Invalidate discoverable plans list as fork counts may have changed
            queryClient.invalidateQueries({ queryKey: planKeys.discoverable() });
        },
        onError: (error, originalPlanId) => {
            console.error(`Mutation Error useForkPlan (Original ID: ${originalPlanId}):`, error);
            alert(`Fork Error: ${error.message}`); // Replace UI
        },
    });
};