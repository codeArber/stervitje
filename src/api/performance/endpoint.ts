// FILE: src/api/performance/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Plan } from '@/types/plan';
import type { Enums } from '@/types/database.types';
import { Profile } from '@/types';

// --- Type Definitions for the RPC response ---

// This type matches the `performance_summary` object in the JSON
export interface PlanPerformanceSummary {
  total_sessions_in_plan: number;
  logged_sessions_count: number;
  total_volume_kg: number;
  first_workout_date: string | null;
  last_workout_date: string | null;
}

// This is the type for a single item in the array returned by the RPC
export interface UserPlanPerformanceData {
  plan_details: Pick<Plan, 'id' | 'title' | 'description' | 'difficulty_level'>;
  performance_summary: PlanPerformanceSummary;
  user_plan_status_id: string;
  user_status_on_plan: Enums<'plan_status'>;
}

/**
 * Fetches a simple list of all dates on which a user logged a workout.
 * @param userId The UUID of the user.
 */
export const fetchUserWorkoutDates = async (userId: string): Promise<{ workout_date: string }[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_user_workout_dates', {
    p_user_id: userId,
  });

  if (error) {
    console.error('API Error fetchUserWorkoutDates:', error);
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches a list of all plans a user has started, along with
 * performance summary statistics for each plan.
 * @param userId The UUID of the user whose performance is being fetched.
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

  // The RPC returns a single JSONB array, so we cast it.
  // If `data` is null (e.g., user has no plans), return an empty array.
  return (data as UserPlanPerformanceData[]) || [];
};

// FILE: src/api/performance/endpoint.ts
// ... (keep existing functions and types)

// --- ADD THESE NEW TYPES AND FUNCTION ---
export interface LogbookEntry {
  log_id: string;
  workout_date: string;
  session_title: string | null;
  plan_title: string | null;
  duration_minutes: number | null;
  overall_feeling: number | null;
  plan_id: string | null;
}

export const fetchUserLogbook = async (userId: string): Promise<LogbookEntry[]> => {
  if (!userId) return [];

  const { data, error } = await supabase.rpc('get_user_logbook', {
    p_user_id: userId,
  });

  if (error) {
    console.error('API Error fetchUserLogbook:', error);
    throw new Error(error.message);
  }
  return data || [];
};

export interface UserProfileUpdatePayload {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  unit: 'metric' | 'imperial';
}

/**
 * Calls the RPC to update the current user's profile information.
 * @param payload The new profile data.
 * @returns The updated profile record from the database.
 */
export const updateUserProfile = async (payload: UserProfileUpdatePayload): Promise<Profile> => {
  const { data, error } = await supabase
    .rpc('update_user_profile', {
      p_full_name: payload.full_name,
      p_username: payload.username,
      p_bio: payload.bio,
      p_unit: payload.unit,
    })
    .single();

  if (error) {
    console.error("API Error updateUserProfile:", error);
    throw new Error(error.message);
  }

  return data as Profile;
};