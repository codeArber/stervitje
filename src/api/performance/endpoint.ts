// FILE: src/api/performance/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import type {  Profile, UserMeasurement } from '@/types/index'; // Use centralized imports for base types
import type {
  UserPlanPerformanceData,
  LogbookEntry,
  PlanPerformanceDetails,
  UserWorkoutDate, // Import the new type
} from '@/types/performance'; // Import the new performance types
import { UserProfileUpdatePayload } from '@/types/user'; // Import from user/index for consistency

/**
 * @description Fetches a simple list of all dates on which a user logged a workout.
 * Corresponds to the `get_user_workout_dates` RPC.
 * @param userId The UUID of the user.
 * @returns A promise that resolves to an array of dates (`string[]`).
 */
export const fetchUserWorkoutDates = async (userId: string): Promise<UserWorkoutDate[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_user_workout_dates', {
    p_user_id: userId,
  });

  if (error) {
    console.error('API Error fetchUserWorkoutDates:', error);
    throw new Error(error.message);
  }
  // RPC returns SETOF date, which database.types.ts correctly infers as `string[]`.
  return data || [];
};

/**
 * @description Fetches a list of all plans a user has started, along with
 * performance summary statistics for each plan.
 * Corresponds to the `get_user_plan_performance_summary_list` RPC.
 * @param userId The UUID of the user whose performance is being fetched.
 * @returns A promise that resolves to an array of `UserPlanPerformanceData`.
 */
export const fetchUserPlanPerformanceList = async (userId: string): Promise<UserPlanPerformanceData[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_user_plan_performance_summary_list', {
    p_user_id: userId,
  });

  if (error) {
    console.error('API Error fetchUserPlanPerformanceList:', error);
    throw new Error(error.message);
  }

  // The RPC returns jsonb_agg, which will be `[]` if no plans match.
  return (data as UserPlanPerformanceData[]) || [];
};

/**
 * @description Fetches a user's workout logbook, including session and plan titles.
 * Corresponds to the `get_user_logbook` RPC.
 * @param userId The UUID of the user.
 * @returns A promise that resolves to an array of `LogbookEntry`.
 */
export const fetchUserLogbook = async (userId: string): Promise<LogbookEntry[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_user_logbook', {
    p_user_id: userId,
  });

  if (error) {
    console.error('API Error fetchUserLogbook:', error);
    throw new Error(error.message);
  }
  // RPC returns SETOF a record type, which `database.types.ts` gives as `Record<string, unknown>[]`.
  // We cast to our specific `LogbookEntry[]`.
  return (data as LogbookEntry[]) || [];
};

/**
 * @description Calls the RPC to update the current user's profile information.
 * Corresponds to the `update_user_profile` RPC.
 * @param payload The new profile data.
 * @returns The updated `Profile` record from the database.
 */
export const updateUserProfile = async (payload: UserProfileUpdatePayload): Promise<Profile> => {
  const { data, error } = await supabase
    .rpc('update_user_profile', {
      p_full_name: payload.p_full_name,
      p_username: payload.p_username,
      p_bio: payload.p_bio,
      p_unit: payload.p_unit,
    })
    .single(); // Assuming the RPC returns a single row

  if (error || !data) { // Check for !data in case single() returns null if no row found (e.g. RLS issues)
    console.error("API Error updateUserProfile:", error);
    throw new Error(error?.message || 'Failed to update profile.');
  }

  // RPC returns a single row of the updated profile, which should match `Profile`.
  return data as Profile;
};

/**
 * @description Sets the initial baseline value for a user's goal progress record.
 * Corresponds to the `set_goal_baseline` RPC.
 * @param payload - Object containing `progressId` and `baselineValue`.
 */
export const setGoalBaseline = async (payload: { progressId: string; baselineValue: number }): Promise<void> => {
  const { error } = await supabase.rpc('set_goal_baseline', {
    p_progress_id: payload.progressId,
    p_baseline_value: payload.baselineValue,
  });

  if (error) {
    console.error('API Error setGoalBaseline:', error);
    throw new Error(error.message);
  }
};

/**
 * @description Fetches detailed performance data for a specific user plan status, including goal progress.
 * Corresponds to the `get_user_plan_performance_details` RPC.
 * @param userPlanStatusId The UUID of the `user_plan_status` record.
 * @returns A promise that resolves to `PlanPerformanceDetails` or `null`.
 */
export const fetchPlanPerformanceDetails = async (userPlanStatusId: string): Promise<PlanPerformanceDetails | null> => {
  if (!userPlanStatusId) return null;
  const { data, error } = await supabase.rpc('get_user_plan_performance_details', {
    p_user_plan_status_id: userPlanStatusId
  });
  if (error) {
    console.error('API Error fetchPlanPerformanceDetails:', error);
    throw new Error(error.message);
  }
  // RPC returns jsonb_build_object, which can be `null` if no match.
  return data as PlanPerformanceDetails | null;
};