// src/api/profiles/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profilesApi from './endpoint';
import type { Profile, ProfileUpdate } from '@/types/index';

// --- Query Keys ---
const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
  currentUser: () => [...profileKeys.all, 'current'] as const,
};

// --- Hooks ---

/** Hook for fetching all profiles */
export const useFetchProfiles = () => {
  return useQuery<Profile[], Error>({
    queryKey: profileKeys.lists(),
    queryFn: profilesApi.fetchProfiles,
  });
};

/** Hook for fetching a single profile by ID */
export const useFetchProfileById = (profileId: string | undefined | null) => {
  return useQuery<Profile | null, Error>({
    queryKey: profileKeys.detail(profileId!),
    queryFn: () => profilesApi.fetchProfileById(profileId!),
    enabled: !!profileId,
  });
};

/** Hook for fetching the current user's profile */
export const useFetchCurrentUserProfile = () => {
  return useQuery<Profile | null, Error>({
    queryKey: profileKeys.currentUser(),
    queryFn: profilesApi.fetchCurrentUserProfile,
  });
};

/** Hook for updating a profile */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, { profileId: string; payload: Partial<ProfileUpdate> }>({
    mutationFn: ({ profileId, payload }) => profilesApi.updateProfile(profileId, payload),
    onSuccess: (updatedProfile, variables) => {
      console.log(`Profile ${variables.profileId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.profileId) });
      // Also invalidate current user profile if it was the current user
      if (variables.profileId === (window as any).currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: profileKeys.currentUser() });
      }
    },
  });
};

/** Hook for creating a profile */
export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, { userId: string; payload: Partial<ProfileUpdate> }>({
    mutationFn: ({ userId, payload }) => profilesApi.createProfile(userId, payload),
    onSuccess: (newProfile, variables) => {
      console.log('Profile created successfully:', newProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      queryClient.setQueryData(profileKeys.detail(newProfile.id), newProfile);
    },
  });
};
