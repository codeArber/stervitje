// src/api/user/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from './endpoint';
import type { UserContext, UserProfile } from '@/types'; // Import types

// --- Query Keys ---
const userKeys = {
    context: ['userContext'] as const,
};

// --- Query Hooks --- (Keep these as they were)
export const useUserContext = () => {
    return useQuery<UserContext, Error>({
        queryKey: userKeys.context,
        queryFn: userApi.fetchUserContext,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

// --- Mutation Hooks ---

/** Hook to update the user's profile (Simplified Invalidation) */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation<UserProfile, Error, Partial<UserProfile>>({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            // Invalidate the user context query to refetch profile and team data
            queryClient.invalidateQueries({ queryKey: userKeys.context });
            console.log("Profile update successful, invalidating user context.");
        },
        onError: (error) => {
            console.error("Mutation Error useUpdateProfile:", error);
            // Handle error display to user
        },
    });
};