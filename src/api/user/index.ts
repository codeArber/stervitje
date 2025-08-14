// src/api/user/index.ts
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUserProfile } from './endpoint';
import type { Profile } from '@/types/index';

// --- Query Keys ---
const userKeys = {
  all: ['user'] as const,
  currentUser: () => [...userKeys.all, 'current'] as const,
};

// --- Hooks ---

/** Hook for fetching the current user's profile */
export const useUserQuery = () => {
  return useQuery<Profile | null, Error>({
    queryKey: userKeys.currentUser(),
    queryFn: fetchCurrentUserProfile,
  });
};
