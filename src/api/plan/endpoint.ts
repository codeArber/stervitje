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
  UpdatePlanSessionExercisePayload,
  PlanHierarchy,
  LogWorkoutPayload,
  PlanGoal,
  FilteredPlanRich
} from "@/types/plan";
import type { Tag } from "@/types/exercise";
import type { Enums, Tables } from "@/types/database.types";
import { Update } from "vite/types/hmrPayload.js";
import { PlanChangeset } from "@/utils/plan-diff";
import { SessionLog } from "@/types/workout";

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
 */export const fetchRichPlanCards = async (filters: PlanFilters): Promise<FilteredPlanRich[]> => {
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
    // The data returned by the RPC is already `jsonb` which corresponds to `FilteredPlanRich[]`
    // No need for a cast here if using the Supabase client with generated types:
    // `supabase.rpc` in a typed client would return `Awaited<ReturnType<Database['public']['Functions']['get_filtered_plans_rich']['Returns']>>`
    // which should correctly map to `FilteredPlanRich[]` if your database.types.ts is up-to-date.
    return (data as FilteredPlanRich[]) || [];
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
 * Calls the secure RPC to mark a workout session as 'completed'.
 * @param sessionLogId The ID of the session_log to finish.
 * @returns The updated session_log record.
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
 * Saves a completed workout session to the database.
 * This includes all logged exercises and sets, and updates the session log status.
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

export const savePlanHierarchy = async (payload: { planId: string; hierarchy: PlanHierarchy }): Promise<void> => {
  const { error } = await supabase.rpc('save_plan_hierarchy', {
    p_plan_id: payload.planId,
    p_hierarchy: payload.hierarchy,
  });

  if (error) {
    console.error('API Error savePlanHierarchy:', error);
    throw new Error(error.message);
  }
};

// --- ADD THIS NEW PAYLOAD TYPE ---
export interface PlanGoalPayload {
  title: string;
  description: string | null;
  metric: Enums<'goal_metric'>;
  direction: Enums<'goal_direction'>; // <-- ADDED
  target_type: Enums<'goal_target_type'>; // <-- ADDED
  target_value: number;
  exercise_id?: string | null;
}
// --- ADD THESE THREE NEW FUNCTIONS ---
export const addPlanGoal = async (planId: string, payload: PlanGoalPayload): Promise<PlanGoal> => {
  // We need to map our payload keys to the RPC's expected parameter names (p_...)
  const rpcPayload = {
    p_plan_id: planId,
    p_title: payload.title,
    p_description: payload.description,
    p_metric: payload.metric,
    p_direction: payload.direction,
    p_target_type: payload.target_type,
    p_target_value: payload.target_value,
    p_exercise_id: payload.exercise_id
  };
  const { data, error } = await supabase.rpc('add_plan_goal', rpcPayload);
  if (error) throw new Error(error.message);
  return data;
};

export const updatePlanGoal = async (goalId: string, payload: PlanGoalPayload): Promise<PlanGoal> => {
  const { data, error } = await supabase.rpc('update_plan_goal', { p_goal_id: goalId, ...payload });
  if (error) throw new Error(error.message);
  return data;
};

export const deletePlanGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_goal', { p_goal_id: goalId });
  if (error) throw new Error(error.message);
};


export interface PendingBaselineGoal {
    progress_id: string;
    goal_title: string;
    metric: Enums<'goal_metric'>;
    exercise_name: string | null;
}

export const fetchPendingBaselinesForSession = async (planSessionId: string): Promise<PendingBaselineGoal[]> => {
    const { data, error } = await supabase.rpc('get_pending_baselines_for_session', {
        p_plan_session_id: planSessionId
    });
    if (error) throw new Error(error.message);
    return data || [];
};

export interface PlanGoalWithExercise extends PlanGoal {
    exercise_details: { id: string; name: string } | null;
}



export type PlanGoalWithExerciseDetails = PlanGoal & {
  exercises: { id: string; name: string } | null;
};

export interface UserBaseline {
    goal_id: string;
    baseline_value: number;
}

export const fetchPlanGoals = async (planId: string): Promise<PlanGoalWithExerciseDetails[]> => {
    if (!planId) return [];

    // THIS IS THE FIX:
    // We now call the dedicated RPC 'get_goals_for_plan' instead of accessing the table directly.
    const { data, error } = await supabase
        .rpc('get_goals_for_plan', { p_plan_id: planId });

    if (error) {
        console.error('API Error fetchPlanGoals:', error);
        throw new Error(error.message);
    }

    // The RPC returns a single JSONB array. If it's null (no goals found), we return an empty array.
    return data || [];
};

export const startPlanWithBaselines = async (planId: string, baselines: UserBaseline[]): Promise<UserPlanStatus> => {
  const { data, error } = await supabase.rpc('start_plan_with_baselines', {
    p_payload: { plan_id: planId, baselines: baselines }
  }).single();
  if (error) throw new Error(error.message);
  return data as UserPlanStatus;
};