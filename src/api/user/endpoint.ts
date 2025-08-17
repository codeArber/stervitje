// src/api/user/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Profile } from '@/types/index';
import type { RichUserCardData, UserPlanHistoryItem, UserProfileDetails } from '@/types/user/index';

export interface UserFilters {
  searchTerm?: string;
  // NOTE: The roleFilter and excludeTeamId from the old discoverableUsers
  // are not used by the new rich user card RPC, but the interface can
  // be extended if needed in the future.
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
 * Fetches the complete, aggregated profile details for a specific user.
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

  return data as UserProfileDetails | null;
};

/**
 * NEW & REPLACES discoverableUsers: Fetches rich, analytical data for user/coach cards
 * on the Explore page, powered by the coach_analytics_summary view.
 */
export const fetchRichUserCards = async (filters: UserFilters): Promise<RichUserCardData[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_users_rich', {
        p_search_term: filters.searchTerm,
        // NOTE: p_page_limit and p_page_offset can be added here if pagination is needed
      });

    if (error) {
      console.error('API Error fetchRichUserCards:', error);
      throw new Error(error.message);
    }
    return (data as RichUserCardData[]) || [];
};

/**
 * Calls the RPC to mark the current user's onboarding as complete.
 */
export const completeOnboarding = async (): Promise<void> => {
  const { error } = await supabase
    .rpc('complete_onboarding');

  if (error) {
    console.error('API Error completeOnboarding:', error);
    throw new Error(error.message);
  }
};


/**
 * Fetches the complete workout plan history for a specific user.
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