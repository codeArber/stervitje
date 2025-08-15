// src/api/user/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Profile } from '@/types/index';
import type { DiscoverableUser, UserPlanHistoryItem, UserProfileDetails } from '@/types/user/index';



export interface UserFilters {
  roleFilter?: 'coach' | 'member' | 'admin';
  searchTerm?: string;
}

/**
 * Fetches the simple profile record for the currently authenticated user.
 * Good for quick access to name, username, etc.
 */
export const fetchCurrentUserProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.warn(`API Warning fetchCurrentUserProfile: Profile for user ${user.id} not found.`);
      return null;
    }
    console.error(`API Error fetchCurrentUserProfile (User ID: ${user.id}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * **NEW:** Fetches the complete, aggregated profile details for a specific user.
 * This is the function that calls our powerful RPC.
 *
 * @param userId - The UUID of the user whose profile we want to fetch.
 */
export const fetchUserProfileDetails = async (userId: string): Promise<UserProfileDetails | null> => {
  if (!userId) {
    console.warn("API Warning fetchUserProfileDetails: No userId provided.");
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_user_profile_details', { p_user_id: userId });

  if (error) {
    console.error(`API Error fetchUserProfileDetails (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

export const fetchDiscoverableUsers = async (filters: UserFilters): Promise<DiscoverableUser[]> => {
  const { data, error } = await supabase
    .rpc('get_discoverable_users', {
      p_role_filter: filters.roleFilter,
      p_search_term: filters.searchTerm,
    });

  if (error) {
    console.error('API Error fetchDiscoverableUsers:', error);
    throw new Error(error.message);
  }
  return (data as DiscoverableUser[]) || [];
};

/**
 * **NEW:** Fetches the complete workout plan history for a specific user.
 * @param userId - The UUID of the user.
 */
export const fetchUserPlanHistory = async (userId: string): Promise<UserPlanHistoryItem[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_user_plan_history', { p_user_id: userId });

  if (error) {
    console.error(`API Error fetchUserPlanHistory (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }
  return (data as UserPlanHistoryItem[]) || [];
};