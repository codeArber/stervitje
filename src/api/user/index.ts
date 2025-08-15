// FILE: src/api/user/index.ts
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUserProfile, fetchDiscoverableUsers, fetchUserPlanHistory, fetchUserProfileDetails, UserFilters } from './endpoint';
import { useAuthStore } from '@/stores/auth-store'; // Import the Zustand store
import type { Profile } from '@/types/index';
import type { DiscoverableUser, UserPlanHistoryItem, UserProfileDetails } from '@/types/user/index';

// --- Query Keys ---
const userKeys = {
  all: ['user'] as const,
  currentUser: () => [...userKeys.all, 'current'] as const,
  profileDetails: (userId: string) => [...userKeys.all, 'details', userId] as const,
  discoverableLists: () => [...userKeys.all, 'discoverable', 'list'] as const,
  discoverableList: (filters: UserFilters) => [...userKeys.discoverableLists(), filters] as const,
  planHistory: (userId: string) => [...userKeys.all, 'planHistory', userId] as const,
};

// --- Hooks ---

/**
 * Hook for fetching the current authenticated user's simple profile record.
 * This is now powered by the Zustand store.
 */
export const useCurrentUserQuery = () => {
  // Get the user object from the Zustand store
  const { user } = useAuthStore();

  return useQuery<Profile | null, Error>({
    queryKey: userKeys.currentUser(),
    queryFn: fetchCurrentUserProfile,
    // The query will only be enabled when the Zustand store confirms a user is logged in.
    enabled: !!user,
  });
};

/**
 * Hook for fetching the complete, aggregated profile details for any user.
 * (This hook does not need to change, but is included for completeness)
 */
export const useUserProfileDetailsQuery = (userId: string | undefined) => {
  return useQuery<UserProfileDetails | null, Error>({
    queryKey: userKeys.profileDetails(userId!),
    queryFn: () => fetchUserProfileDetails(userId!),
    enabled: !!userId,
  });
};

export const useDiscoverableUsersQuery = (filters: UserFilters) => {
  return useQuery<DiscoverableUser[], Error>({
    queryKey: userKeys.discoverableList(filters),
    queryFn: () => fetchDiscoverableUsers(filters),
  });
};

/**
 * **NEW:** Hook for fetching a user's complete workout plan history.
 * @param userId - The ID of the user whose history you want to fetch.
 */
export const useUserPlanHistoryQuery = (userId: string | undefined) => {
  return useQuery<UserPlanHistoryItem[], Error>({
    queryKey: userKeys.planHistory(userId!),
    queryFn: () => fetchUserPlanHistory(userId!),
    enabled: !!userId,
  });
};