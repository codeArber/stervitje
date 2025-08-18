// FILE: /src/api/plan/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type {
  AddPlanDayPayload, AddPlanWeekPayload, DeletePlanSessionPayload, DeletePlanWeekPayload, FullPlan, PlanDay, PlanPerformanceEntry, PlanSession, PlanWeek, RichPlanCardData, UpdatePlanSessionPayload, UpdatePlanWeekPayload, UserPlanStatus,
  // NEW IMPORTS for Day and Session Payloads
  UpdatePlanDayPayload, DeletePlanDayPayload, AddPlanSessionPayload,
  AddPlanSessionExercisePayload,
  PlanExercise,
  DeletePlanSessionExercisePayload,
  UpdatePlanSessionExerciseSetPayload,
  AddPlanSessionExerciseSetPayload,
  DeletePlanSessionExerciseSetPayload,
  PlanSet,
  UpdatePlanSessionExercisePayload
} from "@/types/plan";
import type { Tag } from "@/types/exercise";
import type { Tables } from "@/types/database.types";
import { Update } from "vite/types/hmrPayload.js";
import { PlanChangeset } from "@/utils/plan-diff";

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


export const savePlanChanges = async (changeset: PlanChangeset): Promise<any> => {
  const { data, error } = await supabase.rpc('save_plan_changes', {
    p_changeset: changeset,
  });

  if (error) {
    console.error('API Error savePlanChanges:', error);
    throw new Error(error.message);
  }
  return data;
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

export const createBasicPlan = async (planData: {
  p_title: string;
  p_description?: string | null;
  p_difficulty_level?: number | null;
  p_private?: boolean | null;
  p_team_id?: string | null;
}): Promise<Tables<'plans'>> => {
  const { data, error } = await supabase.rpc('create_basic_plan', planData).single();

  if (error || !data) {
    console.error('API Error createBasicPlan:', error);
    throw new Error(error?.message || "Failed to create basic plan.");
  }
  return data as Tables<'plans'>;
};

/**
 * NEW: Adds a new week to a plan.
 * @param payload - The data for the new week.
 */
export const addPlanWeek = async (payload: AddPlanWeekPayload): Promise<PlanWeek> => {
  const { data, error } = await supabase.rpc('add_plan_week', payload).single();
  if (error || !data) {
    console.error('API Error addPlanWeek:', error);
    throw new Error(error?.message || "Failed to add plan week.");
  }
  return data as PlanWeek;
};

/**
 * NEW: Updates an existing plan week.
 * @param payload - The data to update the week.
 */
export const updatePlanWeek = async (payload: UpdatePlanWeekPayload): Promise<PlanWeek> => {
  const { data, error } = await supabase.rpc('update_plan_week', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanWeek:', error);
    throw new Error(error?.message || "Failed to update plan week.");
  }
  return data as PlanWeek;
};

/**
 * NEW: Deletes a plan week and its contents.
 * @param payload - The ID of the week to delete.
 */
export const deletePlanWeek = async (payload: DeletePlanWeekPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_week', payload);
  if (error) {
    console.error('API Error deletePlanWeek:', error);
    throw new Error(error.message || "Failed to delete plan week.");
  }
};

/**
 * NEW: Adds a new day to a plan week.
 * @param payload - The data for the new day.
 */
export const addPlanDay = async (payload: AddPlanDayPayload): Promise<PlanDay> => {
  const { data, error } = await supabase.rpc('add_plan_day', payload).single();
  if (error || !data) {
    console.error('API Error addPlanDay:', error);
    throw new Error(error?.message || "Failed to add plan day.");
  }
  return data as PlanDay;
};

/**
 * NEW: Updates an existing plan day.
 * @param payload - The data to update the day.
 */
export const updatePlanDay = async (payload: UpdatePlanDayPayload): Promise<PlanDay> => { // <--- ADDED
  const { data, error } = await supabase.rpc('update_plan_day', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanDay:', error);
    throw new Error(error?.message || "Failed to update plan day.");
  }
  return data as PlanDay;
};

/**
 * NEW: Deletes a plan day and its contents.
 * @param payload - The ID of the day to delete.
 */
export const deletePlanDay = async (payload: DeletePlanDayPayload): Promise<void> => { // <--- ADDED
  const { error } = await supabase.rpc('delete_plan_day', payload);
  if (error) {
    console.error('API Error deletePlanDay:', error);
    throw new Error(error.message || "Failed to delete plan day.");
  }
};

/**
 * NEW: Adds a new session to a plan day.
 * @param payload - The data for the new session.
 */
export const addPlanSession = async (payload: AddPlanSessionPayload): Promise<PlanSession> => { // <--- ADDED
  const { data, error } = await supabase.rpc('add_plan_session', payload).single();
  if (error || !data) {
    console.error('API Error addPlanSession:', error);
    throw new Error(error?.message || "Failed to add plan session.");
  }
  return data as PlanSession;
};

/**
 * NEW: Updates an existing plan session.
 * @param payload - The data to update the session.
 */
export const updatePlanSession = async (payload: UpdatePlanSessionPayload): Promise<PlanSession> => {
  const { data, error } = await supabase.rpc('update_plan_session', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSession:', error);
    throw new Error(error?.message || "Failed to update plan session.");
  }
  return data as PlanSession;
};

/**
 * NEW: Deletes a plan session and its contents.
 * @param payload - The ID of the session to delete.
 */
export const deletePlanSession = async (payload: DeletePlanSessionPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session', payload);
  if (error) {
    console.error('API Error deletePlanSession:', error);
    throw new Error(error.message || "Failed to delete plan session.");
  }
};

export const addPlanSessionExercise = async (payload: AddPlanSessionExercisePayload): Promise<PlanExercise> => { // <--- Return type is PlanExercise
  const { data, error } = await supabase.rpc('add_plan_session_exercise', payload).single();
  if (error || !data) {
    console.error('API Error addPlanSessionExercise:', error);
    throw new Error(error?.message || "Failed to add plan session exercise.");
  }
  return data as PlanExercise; // <--- Cast to PlanExercise
};


/**
 * NEW: Updates an existing exercise within a plan session.
 * @param payload - The data to update the exercise.
 */
export const updatePlanSessionExercise = async (payload: UpdatePlanSessionExercisePayload): Promise<PlanExercise> => {
  const { data, error } = await supabase.rpc('update_plan_session_exercise', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSessionExercise:', error);
    throw new Error(error?.message || "Failed to update plan session exercise.");
  }
  return data as PlanExercise;
};

/**
 * NEW: Deletes an exercise from a plan session and its contents.
 * @param payload - The ID of the exercise to delete.
 */
export const deletePlanSessionExercise = async (payload: DeletePlanSessionExercisePayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session_exercise', payload);
  if (error) {
    console.error('API Error deletePlanSessionExercise:', error);
    throw new Error(error.message || "Failed to delete plan session exercise.");
  }
};

// --- NEW: Plan Session Exercise Set Endpoints ---
/**
 * NEW: Adds a new set to a plan session exercise.
 * @param payload - The data for the new set.
 */
export const addPlanSessionExerciseSet = async (payload: AddPlanSessionExerciseSetPayload): Promise<PlanSet> => {
  // --- FIX: Pass the entire payload object as a single JSONB parameter ---
  const { data, error } = await supabase.rpc('add_exercise_set', { p_set_data: payload }).single(); // <--- Changed RPC name and param
  if (error || !data) {
    console.error('API Error addPlanSessionExerciseSet:', error);
    throw new Error(error?.message || "Failed to add plan session exercise set.");
  }
  return data as PlanSet;
};

/**
 * NEW: Updates an existing set within a plan session exercise.
 * @param payload - The data to update the set.
 */
export const updatePlanSessionExerciseSet = async (payload: UpdatePlanSessionExerciseSetPayload): Promise<PlanSet> => {
  const { data, error } = await supabase.rpc('update_plan_session_exercise_set', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSessionExerciseSet:', error);
    throw new Error(error?.message || "Failed to update plan session exercise set.");
  }
  return data as PlanSet;
};

/**
 * NEW: Deletes a set from a plan session exercise.
 * @param payload - The ID of the set to delete.
 */
export const deletePlanSessionExerciseSet = async (payload: DeletePlanSessionExerciseSetPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session_exercise_set', payload);
  if (error) {
    console.error('API Error deletePlanSessionExerciseSet:', error);
    throw new Error(error.message || "Failed to delete plan session exercise set.");
  }
};