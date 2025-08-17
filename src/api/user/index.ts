// src/api/user/index.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeOnboarding,
  fetchCurrentUserProfile,
  fetchUserPlanHistory,
  fetchUserProfileDetails,
  fetchRichUserCards, // The new function
  type UserFilters
} from './endpoint';
import { useAuthStore } from '@/stores/auth-store';
import type { Profile } from '@/types/index';
import type { RichUserCardData, UserPlanHistoryItem, UserProfileDetails } from '@/types/user/index';

// --- Query Keys ---
const userKeys = {
  all: ['user'] as const,
  currentUser: () => [...userKeys.all, 'current'] as const,
  profileDetails: (userId: string) => [...userKeys.all, 'details', userId] as const,
  // Key for the new rich user card lists
  richLists: () => [...userKeys.all, 'rich', 'list'] as const,
  richList: (filters: UserFilters) => [...userKeys.richLists(), filters] as const,
  planHistory: (userId: string) => [...userKeys.all, 'planHistory', userId] as const,
};

// --- Hooks ---

/**
 * Hook for fetching the current authenticated user's simple profile record.
 * This is now powered by the Zustand store.
 */
export const useCurrentUserQuery = () => {
  const { user } = useAuthStore();

  return useQuery<Profile | null, Error>({
    queryKey: userKeys.currentUser(),
    queryFn: fetchCurrentUserProfile,
    enabled: !!user,
  });
};

/**
 * Hook for fetching the complete, aggregated profile details for any user.
 */
export const useUserProfileDetailsQuery = (userId: string | undefined) => {
  return useQuery<UserProfileDetails | null, Error>({
    queryKey: userKeys.profileDetails(userId!),
    queryFn: () => fetchUserProfileDetails(userId!),
    enabled: !!userId,
  });
};

/**
 * NEW & REPLACES useDiscoverableUsersQuery: Hook for fetching rich, analytical data
 * for user/coach cards on the Explore page.
 */
export const useRichUserCardsQuery = (filters: UserFilters) => {
    return useQuery<RichUserCardData[], Error>({
      queryKey: userKeys.richList(filters),
      queryFn: () => fetchRichUserCards(filters),
    });
};

/**
 * Hook for fetching a user's complete workout plan history.
 */
export const useUserPlanHistoryQuery = (userId: string | undefined) => {
  return useQuery<UserPlanHistoryItem[], Error>({
    queryKey: userKeys.planHistory(userId!),
    queryFn: () => fetchUserPlanHistory(userId!),
    enabled: !!userId,
  });
};

/**
 * Hook for the mutation to complete the user's onboarding process.
 */
export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
    onError: (error) => {
      console.error('Error completing onboarding mutation:', error);
    }
  });
};