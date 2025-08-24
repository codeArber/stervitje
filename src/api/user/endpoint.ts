// src/api/user/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import { Tables, TablesInsert } from '@/types/database.types'; // Used for generic table types
import type { Profile, UserMeasurement } from '@/types/index'; // Import base Profile and UserMeasurement
import type {
  DiscoverableUser,
  DiscoverableUserFilters,
  RichUserCardData,
  UserPlanHistoryItem,
  UserProfileDetails,
  UserProfileUpdatePayload, // Import the new payload type
  RichUserCardFilters // Import the new filters type
} from '@/types/user/index'; // Import specific user types

// Renamed from UserFilters to RichUserCardFilters for clarity,
// as the original UserFilters was loosely defined for discoverableUsers
export type { RichUserCardFilters };


/**
 * @description Fetches the simple profile record for the currently authenticated user.
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
    if (error.code === 'PGRST116') { // This code typically means "no rows found"
      console.warn(`API Warning fetchCurrentUserProfile: Profile for user ${user.id} not found.`);
      return null;
    }
    console.error(`API Error fetchCurrentUserProfile (User ID: ${user.id}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * @description Fetches the complete, aggregated profile details for a specific user.
 * Corresponds to the `get_user_profile_details` RPC.
 *
 * @param userId - The UUID of the user whose profile we want to fetch.
 * @returns A promise that resolves to `UserProfileDetails` or `null` if not found/permission denied.
 */
export const fetchUserProfileDetails = async (userId: string): Promise<UserProfileDetails | null> => {
  if (!userId) {
    console.warn("API Warning fetchUserProfileDetails: No userId provided.");
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_user_profile_details', { p_user_id: userId });

  if (error) {
    // The RPC itself will throw an exception for permission denied.
    // So if 'data' is null here, it means the RPC returned NULL (e.g., if v_active_plan_id was null)
    // or the error was caught and converted.
    console.error(`API Error fetchUserProfileDetails (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }

  // RPC SQL returns jsonb_build_object for single result, which is null if no profile matches.
  // The RPC is SECURITY DEFINER, and has a direct SELECT into v_result.
  // If the user is not found or permission denied (due to RPC's internal check), it raises EXCEPTION.
  // So `data` should either be the object or `null` if the SELECT INTO didn't find a profile for *any* reason
  // (though the RPC is designed to raise an exception for permission denied).
  return data as UserProfileDetails | null;
};

/**
 * @description Fetches rich, analytical data for user/coach cards on the Explore page,
 * powered by the `coach_analytics_summary` view.
 * Corresponds to the `get_filtered_users_rich` RPC.
 *
 * @param filters - An object containing optional search terms and pagination.
 * @returns A promise that resolves to an array of `RichUserCardData`.
 */
export const fetchRichUserCards = async (filters: RichUserCardFilters): Promise<RichUserCardData[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_users_rich', {
        p_search_term: filters.searchTerm,
        p_page_limit: filters.pageLimit, // Include pagination parameters
        p_page_offset: filters.pageOffset,
      });

    if (error) {
      console.error('API Error fetchRichUserCards:', error);
      throw new Error(error.message);
    }
    // RPC returns jsonb_agg, which will be [] if no results.
    return (data as RichUserCardData[]) || [];
};

/**
 * @description Calls the RPC to mark the current user's onboarding as complete.
 * Corresponds to the `complete_onboarding` RPC.
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
 * @description Fetches the complete workout plan history for a specific user.
 * Corresponds to the `get_user_plan_history` RPC.
 *
 * @param userId - The UUID of the user.
 * @returns A promise that resolves to an array of `UserPlanHistoryItem`.
 */
export const fetchUserPlanHistory = async (userId: string): Promise<UserPlanHistoryItem[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_user_plan_history', { p_user_id: userId });

  if (error) {
    // The RPC itself will return '[]'::jsonb or raise an exception for permission denied.
    console.error(`API Error fetchUserPlanHistory (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }
  // RPC returns jsonb_agg, which will be [] if no results or permission denied for non-SECURITY DEFINER part.
  return (data as UserPlanHistoryItem[]) || [];
};

/**
 * @description Sets the current user's active workspace.
 * Corresponds to the `set_current_user_workspace` RPC.
 * @param workspaceId - The UUID of the workspace, or `null` to clear.
 */
export const setCurrentUserWorkspace = async (workspaceId: string | null): Promise<void> => {
  const { error } = await supabase
    .rpc('set_current_user_workspace', { p_workspace_id: workspaceId });

  if (error) {
    console.error(`API Error setCurrentUserWorkspace (ID: ${workspaceId}):`, error);
    throw new Error(error.message);
  }
};

/**
 * @description Fetches a list of all body measurements for a specific user, ordered by date.
 * Corresponds to the `get_user_measurements` RPC.
 * @param userId - The UUID of the user.
 * @returns A promise that resolves to an array of `UserMeasurement`.
 */
export const fetchUserMeasurements = async (userId: string): Promise<UserMeasurement[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_user_measurements', { p_user_id: userId });

  if (error) {
    // This RPC is STABLE and relies on RLS or internal security check.
    // If it returns no rows due to RLS, `data` will be an empty array.
    console.error(`API Error fetchUserMeasurements (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }
  return data || []; // `data` is already typed as `user_measurements[]` by Supabase types
};

/**
 * @description Inserts a new body measurement record for the current user.
 * Corresponds to the `insert_user_measurement` RPC.
 * @param measurementData - The data for the new measurement (partial `UserMeasurement` for insert).
 * @returns A promise that resolves to the newly created `UserMeasurement` record.
 */
export const insertUserMeasurement = async (measurementData: TablesInsert<'user_measurements'>): Promise<UserMeasurement> => {
  const { data, error } = await supabase
    .rpc('insert_user_measurement', { p_measurement_data: measurementData }); // RPC returns a single object

  if (error || !data) {
    console.error('API Error insertUserMeasurement:', error);
    throw new Error(error?.message || 'Failed to insert measurement.');
  }
  // The RPC returns `user_measurements`, which Supabase correctly types.
  // However, the `database.types.ts` shows it returns `{ created_at: string | null ... }` which is just the Row type.
  // It returns a single object, not an array.
  return data as UserMeasurement;
};

/**
 * @description Calls the `get_discoverable_users` RPC function to fetch a list of users
 * based on provided filters.
 *
 * @param filters - An object containing optional filters like searchTerm, roleFilter,
 *                    excludeTeamId, pageLimit, and pageOffset.
 * @returns A promise that resolves to an array of `DiscoverableUser` objects.
 * @throws {Error} If the RPC call returns an error.
 */
export const fetchDiscoverableUsers = async (filters: DiscoverableUserFilters): Promise<DiscoverableUser[]> => {
  const { searchTerm, roleFilter, excludeTeamId, pageLimit, pageOffset } = filters;

  const { data, error } = await supabase.rpc('get_discoverable_users', {
    p_search_term: searchTerm || null,
    p_role_filter: roleFilter || null,
    p_exclude_team_id: excludeTeamId || null,
    p_page_limit: pageLimit,
    p_page_offset: pageOffset,
  });

  if (error) {
    console.error('API Error fetchDiscoverableUsers:', error);
    throw new Error(error.message);
  }

  // The RPC returns jsonb_agg, which means data will be an array of JSON objects.
  // It returns `[]` if no users match.
  return (data as DiscoverableUser[]) || [];
};