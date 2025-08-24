// src/api/user/index.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeOnboarding,
  fetchCurrentUserProfile,
  fetchUserPlanHistory,
  fetchUserProfileDetails,
  fetchRichUserCards,
  fetchUserMeasurements,
  setCurrentUserWorkspace,
  insertUserMeasurement,
  fetchDiscoverableUsers,
  type RichUserCardFilters, // Import the new filters type
} from './endpoint';
import { useAuthStore } from '@/stores/auth-store';
import type { Profile, UserMeasurement } from '@/types/index';
import type {
  DiscoverableUser,
  DiscoverableUserFilters,
  RichUserCardData,
  UserPlanHistoryItem,
  UserProfileDetails,
  UserProfileUpdatePayload, // Import the new payload type
} from '@/types/user/index';
import { Tables, TablesInsert } from '@/types/database.types'; // Still used for TablesInsert
import { toast } from 'sonner';
// Assuming updateUserProfile and UserProfileUpdatePayload are correctly imported
// from `../performance/endpoint` as discussed.
import { updateUserProfile } from '../performance/endpoint';


// --- Query Keys ---
const userKeys = {
  all: ['user'] as const,
  currentUser: () => [...userKeys.all, 'current'] as const,
  profileDetails: (userId: string) => [...userKeys.all, 'details', userId] as const,
  richLists: () => [...userKeys.all, 'rich', 'list'] as const,
  richList: (filters: RichUserCardFilters) => [...userKeys.richLists(), filters] as const, // Use RichUserCardFilters
  planHistory: (userId: string) => [...userKeys.all, 'planHistory', userId] as const,
  measurements: () => [...userKeys.all, 'measurements'] as const,
  userMeasurements: (userId: string) => [...userKeys.measurements(), userId] as const,
  discoverableList: (filters: DiscoverableUserFilters) => [...userKeys.all, 'list', 'discoverable', filters] as const, // Updated path for clarity
};

// --- Hooks ---

/**
 * @description Hook for fetching the current authenticated user's simple profile record.
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
 * @description Hook for fetching the complete, aggregated profile details for any user.
 */
export const useUserProfileDetailsQuery = (userId: string | undefined) => {
  return useQuery<UserProfileDetails | null, Error>({
    queryKey: userKeys.profileDetails(userId!),
    queryFn: () => fetchUserProfileDetails(userId!),
    enabled: !!userId,
  });
};

/**
 * @description Hook for fetching rich, analytical data for user/coach cards on the Explore page.
 */
export const useRichUserCardsQuery = (filters: RichUserCardFilters) => {
    return useQuery<RichUserCardData[], Error>({
      queryKey: userKeys.richList(filters),
      queryFn: () => fetchRichUserCards(filters),
    });
};

/**
 * @description Hook for fetching a user's complete workout plan history.
 */
export const useUserPlanHistoryQuery = (userId: string | undefined) => {
  return useQuery<UserPlanHistoryItem[], Error>({
    queryKey: userKeys.planHistory(userId!),
    queryFn: () => fetchUserPlanHistory(userId!),
    enabled: !!userId,
  });
};

/**
 * @description Hook for the mutation to complete the user's onboarding process.
 */
export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() });
      toast.success('Onboarding completed!'); // Added toast for user feedback
    },
    onError: (error) => {
      console.error('Error completing onboarding mutation:', error);
      toast.error(`Failed to complete onboarding: ${error.message}`); // Added toast for error
    }
  });
};

/**
 * @description Hook for the mutation to set the current user's active workspace.
 */
export const useSetCurrentUserWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string | null>({
    mutationFn: (workspaceId) => setCurrentUserWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }); // Invalidate dashboard summary
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() }); // Invalidate current user profile
      toast.success('Workspace updated successfully!'); // Added toast
    },
    onError: (error) => {
      console.error('Error setting current workspace:', error);
      toast.error(`Failed to set workspace: ${error.message}`); // Added toast
    }
  });
};

/**
 * @description Hook for fetching a user's body measurements.
 */
export const useUserMeasurementsQuery = (userId: string | undefined) => {
  return useQuery<UserMeasurement[], Error>({
    queryKey: userKeys.userMeasurements(userId!),
    queryFn: () => fetchUserMeasurements(userId!),
    enabled: !!userId,
  });
};

/**
 * @description Hook for inserting a new user measurement.
 */
export const useInsertUserMeasurementMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation<UserMeasurement, Error, TablesInsert<'user_measurements'>>({ // Return type `UserMeasurement`
    mutationFn: (newMeasurementData) => insertUserMeasurement(newMeasurementData),
    onSuccess: (newRecord) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: userKeys.userMeasurements(user.id) });
      }
      toast.success('Measurement added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding measurement: ${error.message}`);
    }
  });
};

/**
 * @description Hook for the mutation to update the current user's profile.
 */
export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useAuthStore.getState();

  return useMutation<Profile, Error, UserProfileUpdatePayload>({ // Return type `Profile`
    mutationFn: (payload) => updateUserProfile(payload),
    onSuccess: (updatedProfile) => {
      toast.success("Profile updated successfully!");
      setProfile(updatedProfile); // Update the auth store
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: userKeys.profileDetails(updatedProfile.id) });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    }
  });
};

/**
 * @description Hook for fetching a list of discoverable users based on filters.
 */
export const useDiscoverableUsersQuery = (filters: DiscoverableUserFilters) => {
  return useQuery<DiscoverableUser[], Error>({
    queryKey: userKeys.discoverableList(filters),
    queryFn: () => fetchDiscoverableUsers(filters),
    enabled: true,
  });
};