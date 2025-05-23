// src/api/user/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from './endpoint';
import type { UserContext, UserProfile } from '@/types'; // Import types
import type { UserMeasurements } from '@/lib/supabase/types'; // Import types

// --- Query Keys ---
const userKeys = {
    context: ['userContext'] as const,
};

// --- Query Hooks --- (Keep these as they were)
export const useUserQuery = () => {
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

/** Hook to fetch a list of users */
export const useUsers = () => {
    return useQuery<UserProfile[], Error>({
        queryKey: ['users'],
        queryFn: userApi.fetchUsers,
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
};

/** Hook to fetch a single user by userId */
export const useUser = (userId: string) => {
    return useQuery<UserProfile | undefined, Error>({
        queryKey: ['user', userId],
        queryFn: async () => {
            const users = await userApi.fetchUsers();
            return users.find(user => user.id === userId);
        },
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
};

/** Hook to fetch the user's teams */
export const useUserTeams = (userId: string) => {
    return useQuery<string[], Error>({
        queryKey: ['userTeams', userId],
        queryFn: () => userApi.fetchUserTeams(userId),
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
};


/** Hook to fetch the user's plans */
export const useUserPlans = (userId: string) => {
    return useQuery<string[], Error>({
        queryKey: ['userPlans', userId],
        queryFn: () => userApi.fetchUserPlans(userId),
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
};

/** Hook to fetch the user's public workouts */
export const useUserPublicWorkouts = (userId: string) => {
    return useQuery<string[], Error>({
        queryKey: ['userPublicWorkouts', userId],
        queryFn: () => userApi.fetchPublicWorkouts(userId),
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
};

export const useUserMeasurements = (userId: string) => {
    return useQuery<UserMeasurements[], Error>({
        queryKey: ['userMeasurements', userId],
        queryFn: () => userApi.fetchUserMeasurements(userId),
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });
}    