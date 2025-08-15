// FILE: src/api/plan/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import type { Plan } from '@/types/index';
import type { AddExercisePayload, AddSessionPayload, AddSetPayload, NewPlan, PlanDetails, PlanWithStats } from '@/types/plan/index';

// A type for our filter object
export interface PlanFilters {
  sport_filter?: string;
  muscle_groups_filter?: string[];
  difficulty_level?: number;
  page_limit?: number;
  page_offset?: number;
}


// This is the function for the plan list page (already exists)
export const fetchFilteredPlans = async (filters: any): Promise<PlanWithStats[]> => {
  // Use the single, correct function name
  const { data, error } = await supabase
    .rpc('get_filtered_plans_rich', { ...filters }); // Make sure this matches the function you kept!

  if (error) throw new Error(error.message);
  return (data as PlanWithStats[]) || [];
};

/**
 * **NEW:** Fetches the complete, aggregated details for a single plan.
 * @param planId - The UUID of the plan to fetch.
 */
export const fetchPlanDetails = async (planId: string): Promise<PlanDetails | null> => {
  const { data, error } = await supabase
    .rpc('get_plan_details', { p_plan_id: planId })
    .single(); // .single() because we expect one JSON object

  if (error) {
    console.error(`API Error fetchPlanDetails (ID: ${planId}):`, error);
    throw new Error(error.message);
  }
  return data as PlanDetails | null;
};


export const fetchFilteredPlansWithStats = async (filters: PlanFilters): Promise<PlanWithStats[]> => {
  const { data, error } = await supabase
    .rpc('get_filtered_plans_rich', { ...filters });

  if (error) {
    console.error('API Error fetchFilteredPlansWithStats:', error);
    throw new Error(error.message);
  }
  return (data as PlanWithStats[]) || [];
};


// --- CREATE Operation ---

export const createPlan = async (newPlanData: Pick<NewPlan, 'title' | 'description'>): Promise<Plan> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('plans')
    .insert({ ...newPlanData, created_by: user.id })
    .select()
    .single();

  if (error) {
    console.error('API Error createPlan:', error);
    throw new Error(error.message);
  }
  return data;
};


// --- HIERARCHY ADD Operations ---

export const addSession = async (payload: AddSessionPayload) => {
  const { data, error } = await supabase.rpc('plan_add_session', {
    _plan_day_id: payload.plan_day_id,
    _order_index: payload.order_index,
    _title: payload.title,
    _notes: payload.notes,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const addExerciseToSession = async (payload: AddExercisePayload) => {
  const { data, error } = await supabase.rpc('plan_add_session_exercise', {
    _plan_session_id: payload.plan_session_id,
    _exercise_id: payload.exercise_id,
    _order_index: payload.order_index,
    _notes: payload.notes,
    _target_rest_seconds: payload.target_rest_seconds,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const addSetToExercise = async (payload: AddSetPayload) => {
  const { data, error } = await supabase.rpc('plan_add_set', {
    _plan_session_exercise_id: payload.plan_session_exercise_id,
    _set_number: payload.set_number,
    _target_reps: payload.target_reps,
    _target_weight: payload.target_weight,
    _notes: payload.notes,
  });
  if (error) throw new Error(error.message);
  return data;
};


// --- HIERARCHY DELETE Operations ---

export const deleteSession = async (sessionId: string) => {
  const { error } = await supabase.rpc('plan_delete_session', { _session_id: sessionId });
  if (error) throw new Error(error.message);
};

export const deleteExerciseFromSession = async (planSessionExerciseId: string) => {
  const { error } = await supabase.rpc('plan_delete_session_exercise', { _plan_session_exercise_id: planSessionExerciseId });
  if (error) throw new Error(error.message);
};

export const deleteSetFromExercise = async (setId: string) => {
  const { error } = await supabase.rpc('plan_delete_set', { _set_id: setId });
  if (error) throw new Error(error.message);
};


/**
 * **NEW:** Starts a plan for the current user, creating their status record.
 * @param planId - The UUID of the plan to start.
 */
export const startUserPlan = async (planId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('start_user_plan', { p_plan_id: planId });

  if (error) {
    console.error(`API Error startUserPlan (ID: ${planId}):`, error);
    throw new Error(error.message);
  }
};