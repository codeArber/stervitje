// FILE: /src/api/plan/plan.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type {
  FullPlan, PlanFilters, FilteredPlanRich, CreateBasicPlanPayload,
  PlanPerformanceEntry, LogWorkoutPayload, LoggedExercise
} from "@/types/plan";
import type { Tag } from "@/types/index"; // Import Tag from central index
import type { UserPlanStatus, SessionLog } from "@/types/index"; // Import UserPlanStatus, SessionLog
import { Tables } from "@/types/database.types";

/**
 * @description Fetches the complete, aggregated details for a single plan.
 * Corresponds to the `get_plan_details_for_user` RPC.
 * @param planId The UUID of the plan.
 * @returns A promise that resolves to `FullPlan` or `null`.
 */
export const fetchPlanDetails = async (planId: string): Promise<FullPlan | null> => {
  const { data, error } = await supabase.rpc('get_plan_details_for_user', { p_plan_id: planId });
  if (error) {
    console.error(`API Error fetchPlanDetails (Plan ID: ${planId}):`, error);
    throw new Error(error.message);
  }
  return data as FullPlan | null;
};

/**
 * @description Fetches the rich, analytical data for plan cards on the explore page.
 * Corresponds to the `get_filtered_plans_rich` RPC.
 * @param filters Filters for the plan list.
 * @returns A promise that resolves to an array of `FilteredPlanRich`.
 */
export const fetchRichPlanCards = async (filters: PlanFilters): Promise<FilteredPlanRich[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_plans_rich', {
        p_search_term: filters.searchTerm,
        p_tag_ids: filters.tagIds,
        p_difficulty_level: filters.difficultyLevel,
        p_page_limit: filters.pageLimit,
        p_page_offset: filters.pageOffset
      });

    if (error) {
      console.error('API Error fetchRichPlanCards:', error);
      throw new Error(error.message);
    }
    return (data as FilteredPlanRich[]) || [];
};

/**
 * @description Fetches the performance leaderboard for a specific plan.
 * Corresponds to the `get_plan_user_performance_list` RPC.
 * @param planId The UUID of the plan.
 * @returns A promise that resolves to an array of `PlanPerformanceEntry`.
 */
export const fetchPlanPerformanceList = async (planId: string): Promise<PlanPerformanceEntry[]> => {
  const { data, error } = await supabase.rpc('get_plan_user_performance_list', { p_plan_id: planId });
  if (error) {
    console.error(`API Error fetchPlanPerformanceList (Plan ID: ${planId}):`, error);
    throw new Error(error.message);
  }
  return (data as PlanPerformanceEntry[]) || [];
};

/**
 * @description Creates an 'active' status record for the user and the given plan.
 * Corresponds to the `start_plan_for_user` RPC.
 * @param planId The UUID of the plan to start.
 * @returns A promise that resolves to the newly created `UserPlanStatus` record.
 */
export const startPlanForUser = async (planId: string): Promise<UserPlanStatus> => {
  const { data, error } = await supabase
    .rpc('start_plan_for_user', { p_plan_id: planId })
    .single();

  if (error || !data) {
    console.error('API Error startPlanForUser:', error);
    throw new Error(error?.message || "Failed to start plan.");
  }
  return data as UserPlanStatus;
};

/**
 * @description Creates a new session_log for a given plan_session_id.
 * Corresponds to the `start_workout_session` RPC.
 * @param planSessionId The UUID of the planned session to start.
 * @returns A promise that resolves to the new `SessionLog` record.
 */
export const startWorkout = async (planSessionId: string): Promise<SessionLog> => {
  const { data, error } = await supabase
    .rpc('start_workout_session', { p_plan_session_id: planSessionId })
    .single();

  if (error || !data) {
    console.error('API Error startWorkout:', error);
    throw new Error(error?.message || "Failed to start workout session.");
  }
  return data as SessionLog;
};


/**
 * @description Calls the secure RPC to mark a workout session as 'completed'.
 * Corresponds to the `finish_workout_session` RPC.
 * @param sessionLogId The ID of the session_log to finish.
 * @returns A promise that resolves to the updated `SessionLog` record.
 */
export const finishWorkoutSession = async (sessionLogId: string): Promise<SessionLog> => {
  const { data, error } = await supabase
    .rpc('finish_workout_session', { p_session_log_id: sessionLogId })
    .single(); // .single() is correct here, as the RPC will error if it fails.

  if (error) {
    console.error('API Error finishWorkoutSession:', error);
    throw new Error(error.message);
  }
  return data as SessionLog;
};


/**
 * @description Saves a completed workout session to the database.
 * This includes all logged exercises and sets, and updates the session log status.
 * Corresponds to the `log_workout` RPC.
 * @param payload The complete record of the performed workout.
 */
export const logWorkout = async (payload: LogWorkoutPayload): Promise<void> => {
  const { error } = await supabase.rpc('log_workout', {
    p_payload: payload,
  });

  if (error) {
    console.error('API Error logWorkout:', error);
    throw new Error(error.message);
  }
};

/**
 * @description Fetches a single session_log record by its ID.
 * Corresponds to the `get_session_log` RPC.
 * @param sessionId The ID of the session_log.
 * @returns A promise that resolves to a `SessionLog` or `null`.
 */
export const fetchSessionLog = async (sessionId: string): Promise<SessionLog | null> => {
  const { data, error } = await supabase
    .rpc('get_session_log', { p_session_log_id: sessionId })
    .single();

  if (error) {
    console.error(`API Error fetchSessionLog (Session ID: ${sessionId}):`, error);
    throw new Error(error.message);
  }
  return data as SessionLog | null;
};

/**
 * @description Fetches all tags of a specific type (e.g., 'equipment').
 * @param tagType The type of tags to fetch.
 * @returns A promise that resolves to an array of `Tag`.
 */
export const fetchTagsByType = async (tagType: string): Promise<Tag[]> => {
  const { data, error } = await supabase.from('tags').select('id, name, tag_type').eq('tag_type', tagType);
  if (error) {
    console.error(`API Error fetchTagsByType (Tag Type: ${tagType}):`, error);
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * @description Creates a new basic plan.
 * Corresponds to the `create_basic_plan` RPC.
 * @param planData The data for the new plan.
 * @returns A promise that resolves to the newly created `Plan` record.
 */
export const createBasicPlan = async (planData: CreateBasicPlanPayload): Promise<Tables<'plans'>> => {
  const { data, error } = await supabase.rpc('create_basic_plan', planData).single();

  if (error || !data) {
    console.error('API Error createBasicPlan:', error);
    throw new Error(error?.message || "Failed to create basic plan.");
  }
  return data as Tables<'plans'>;
};