// FILE: /src/api/plan/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { FullPlan, PlanPerformanceEntry, RichPlanCardData, UserPlanStatus } from "@/types/plan";
import type { Tag } from "@/types/exercise";
import type { Tables } from "@/types/database.types";

export interface PlanFilters {
  searchTerm?: string;
  tagIds?: number[];
  difficultyLevel?: number;
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * Fetches the complete, aggregated details for a single plan.
 */
export const fetchPlanDetails = async (planId: string): Promise<FullPlan | null> => {
  const { data, error } = await supabase.rpc('get_plan_details_for_user', { p_plan_id: planId });
  if (error) { throw new Error(error.message); }
  return data as FullPlan | null;
};

/**
 * Fetches the rich, analytical data for plan cards on the explore page.
 */
export const fetchRichPlanCards = async (filters: PlanFilters): Promise<RichPlanCardData[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_plans_rich', {
        p_search_term: filters.searchTerm,
        p_tag_ids: filters.tagIds,
        p_difficulty_level: filters.difficultyLevel,
        p_page_limit: filters.pageLimit,
        p_page_offset: filters.pageOffset
      });

    if (error) { throw new Error(error.message); }
    return (data as RichPlanCardData[]) || [];
};

/**
 * Fetches the performance leaderboard for a specific plan.
 */
export const fetchPlanPerformanceList = async (planId: string): Promise<PlanPerformanceEntry[]> => {
  const { data, error } = await supabase.rpc('get_plan_user_performance_list', { p_plan_id: planId });
  if (error) { throw new Error(error.message); }
  return (data as PlanPerformanceEntry[]) || [];
};

/**
 * Creates an 'active' status record for the user and the given plan.
 */
export const startPlanForUser = async (planId: string): Promise<UserPlanStatus> => {
  const { data, error } = await supabase
    .rpc('start_plan_for_user', { p_plan_id: planId })
    .single();

  if (error || !data) { throw new Error(error?.message || "Failed to start plan."); }
  return data as UserPlanStatus;
};

/**
 * Creates a new session_log for a given plan_session_id.
 */
export const startWorkout = async (planSessionId: string): Promise<Tables<'session_logs'>> => {
  const { data, error } = await supabase
    .rpc('start_workout_session', { p_plan_session_id: planSessionId })
    .single();

  if (error || !data) { throw new Error(error?.message || "Failed to start workout session."); }
  return data as Tables<'session_logs'>;
};

/**
 * RESTORED: Fetches a single session_log record by its ID. This is critical for the workout player.
 */
export const fetchSessionLog = async (sessionId: string): Promise<Tables<'session_logs'> | null> => {
  const { data, error } = await supabase
    .rpc('get_session_log', { p_session_log_id: sessionId })
    .single();

  if (error) { throw new Error(error.message); }
  return data as Tables<'session_logs'> | null;
};

/**
 * Fetches all tags of a specific type (e.g., 'equipment').
 */
export const fetchTagsByType = async (tagType: string): Promise<Tag[]> => {
  const { data, error } = await supabase.from('tags').select('id, name, tag_type').eq('tag_type', tagType);
  if (error) { throw new Error(error.message); }
  return data || [];
};