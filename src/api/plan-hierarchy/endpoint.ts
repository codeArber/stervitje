// src/api/plan-hierarchy/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { 
  PlanWeek, 
  PlanDay, 
  PlanSession, 
  PlanSessionExercise, 
  PlanSessionExerciseSet 
} from '@/types/index';

// --- Plan Week Operations ---

/** Fetches all plan weeks */
export const fetchPlanWeeks = async (): Promise<PlanWeek[]> => {
  const { data, error } = await supabase
    .from('plan_weeks')
    .select('*');

  if (error) {
    console.error('API Error fetchPlanWeeks:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches plan weeks by plan ID */
export const fetchPlanWeeksByPlanId = async (planId: string): Promise<PlanWeek[]> => {
  const { data, error } = await supabase
    .from('plan_weeks')
    .select('*')
    .eq('plan_id', planId)
    .order('week_number', { ascending: true });

  if (error) {
    console.error(`API Error fetchPlanWeeksByPlanId (Plan ID: ${planId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new plan week */
export const createPlanWeek = async (payload: Omit<PlanWeek, 'id'>): Promise<PlanWeek> => {
  const { data, error } = await supabase
    .from('plan_weeks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createPlanWeek:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a plan week */
export const updatePlanWeek = async (
  weekId: string,
  payload: Partial<Omit<PlanWeek, 'id'>>
): Promise<PlanWeek> => {
  const { data, error } = await supabase
    .from('plan_weeks')
    .update(payload)
    .eq('id', weekId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlanWeek (ID: ${weekId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan week */
export const deletePlanWeek = async (weekId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('plan_weeks')
    .delete()
    .eq('id', weekId);

  if (error) {
    console.error(`API Error deletePlanWeek (ID: ${weekId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Plan Day Operations ---

/** Fetches all plan days */
export const fetchPlanDays = async (): Promise<PlanDay[]> => {
  const { data, error } = await supabase
    .from('plan_days')
    .select('*');

  if (error) {
    console.error('API Error fetchPlanDays:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches plan days by week ID */
export const fetchPlanDaysByWeekId = async (weekId: string): Promise<PlanDay[]> => {
  const { data, error } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_week_id', weekId)
    .order('day_number', { ascending: true });

  if (error) {
    console.error(`API Error fetchPlanDaysByWeekId (Week ID: ${weekId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new plan day */
export const createPlanDay = async (payload: Omit<PlanDay, 'id'>): Promise<PlanDay> => {
  const { data, error } = await supabase
    .from('plan_days')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createPlanDay:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a plan day */
export const updatePlanDay = async (
  dayId: string,
  payload: Partial<Omit<PlanDay, 'id'>>
): Promise<PlanDay> => {
  const { data, error } = await supabase
    .from('plan_days')
    .update(payload)
    .eq('id', dayId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlanDay (ID: ${dayId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan day */
export const deletePlanDay = async (dayId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('plan_days')
    .delete()
    .eq('id', dayId);

  if (error) {
    console.error(`API Error deletePlanDay (ID: ${dayId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Plan Session Operations ---

/** Fetches all plan sessions */
export const fetchPlanSessions = async (): Promise<PlanSession[]> => {
  const { data, error } = await supabase
    .from('plan_sessions')
    .select('*');

  if (error) {
    console.error('API Error fetchPlanSessions:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches plan sessions by day ID */
export const fetchPlanSessionsByDayId = async (dayId: string): Promise<PlanSession[]> => {
  const { data, error } = await supabase
    .from('plan_sessions')
    .select('*')
    .eq('plan_day_id', dayId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error(`API Error fetchPlanSessionsByDayId (Day ID: ${dayId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new plan session */
export const createPlanSession = async (payload: Omit<PlanSession, 'id'>): Promise<PlanSession> => {
  const { data, error } = await supabase
    .from('plan_sessions')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createPlanSession:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a plan session */
export const updatePlanSession = async (
  sessionId: string,
  payload: Partial<Omit<PlanSession, 'id'>>
): Promise<PlanSession> => {
  const { data, error } = await supabase
    .from('plan_sessions')
    .update(payload)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlanSession (ID: ${sessionId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan session */
export const deletePlanSession = async (sessionId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('plan_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error(`API Error deletePlanSession (ID: ${sessionId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Plan Session Exercise Operations ---

/** Fetches all plan session exercises */
export const fetchPlanSessionExercises = async (): Promise<PlanSessionExercise[]> => {
  const { data, error } = await supabase
    .from('plan_session_exercises')
    .select('*');

  if (error) {
    console.error('API Error fetchPlanSessionExercises:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches plan session exercises by session ID */
export const fetchPlanSessionExercisesBySessionId = async (sessionId: string): Promise<PlanSessionExercise[]> => {
  const { data, error } = await supabase
    .from('plan_session_exercises')
    .select('*')
    .eq('plan_session_id', sessionId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error(`API Error fetchPlanSessionExercisesBySessionId (Session ID: ${sessionId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new plan session exercise */
export const createPlanSessionExercise = async (payload: Omit<PlanSessionExercise, 'id'>): Promise<PlanSessionExercise> => {
  const { data, error } = await supabase
    .from('plan_session_exercises')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createPlanSessionExercise:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a plan session exercise */
export const updatePlanSessionExercise = async (
  exerciseId: string,
  payload: Partial<Omit<PlanSessionExercise, 'id'>>
): Promise<PlanSessionExercise> => {
  const { data, error } = await supabase
    .from('plan_session_exercises')
    .update(payload)
    .eq('id', exerciseId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlanSessionExercise (ID: ${exerciseId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan session exercise */
export const deletePlanSessionExercise = async (exerciseId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('plan_session_exercises')
    .delete()
    .eq('id', exerciseId);

  if (error) {
    console.error(`API Error deletePlanSessionExercise (ID: ${exerciseId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Plan Session Exercise Set Operations ---

/** Fetches all plan session exercise sets */
export const fetchPlanSessionExerciseSets = async (): Promise<PlanSessionExerciseSet[]> => {
  const { data, error } = await supabase
    .from('plan_session_exercise_sets')
    .select('*');

  if (error) {
    console.error('API Error fetchPlanSessionExerciseSets:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches plan session exercise sets by exercise ID */
export const fetchPlanSessionExerciseSetsByExerciseId = async (exerciseId: string): Promise<PlanSessionExerciseSet[]> => {
  const { data, error } = await supabase
    .from('plan_session_exercise_sets')
    .select('*')
    .eq('plan_session_exercise_id', exerciseId)
    .order('set_number', { ascending: true });

  if (error) {
    console.error(`API Error fetchPlanSessionExerciseSetsByExerciseId (Exercise ID: ${exerciseId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new plan session exercise set */
export const createPlanSessionExerciseSet = async (payload: Omit<PlanSessionExerciseSet, 'id'>): Promise<PlanSessionExerciseSet> => {
  const { data, error } = await supabase
    .from('plan_session_exercise_sets')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createPlanSessionExerciseSet:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a plan session exercise set */
export const updatePlanSessionExerciseSet = async (
  setId: string,
  payload: Partial<Omit<PlanSessionExerciseSet, 'id'>>
): Promise<PlanSessionExerciseSet> => {
  const { data, error } = await supabase
    .from('plan_session_exercise_sets')
    .update(payload)
    .eq('id', setId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlanSessionExerciseSet (ID: ${setId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan session exercise set */
export const deletePlanSessionExerciseSet = async (setId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('plan_session_exercise_sets')
    .delete()
    .eq('id', setId);

  if (error) {
    console.error(`API Error deletePlanSessionExerciseSet (ID: ${setId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
