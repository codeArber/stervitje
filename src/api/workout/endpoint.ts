// src/api/workout/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { WorkoutDetails, SessionLog, SetLog, NewSetLog } from '@/types/workout/index';

/**
 * Fetches the complete, aggregated details for a specific historical workout log.
 * @param logId - The UUID of the session_log to fetch.
 */
export const fetchWorkoutDetails = async (logId: string): Promise<WorkoutDetails | null> => {
  if (!logId) return null;
  const { data, error } = await supabase.rpc('get_workout_details', { p_log_id: logId });
  if (error) {
    console.error(`API Error fetchWorkoutDetails (Log ID: ${logId}):`, error);
    throw new Error(error.message);
  }
  return data;
};



/**
 * Initiates a new workout session by calling the corrected RPC.
 * @param planSessionId - The optional UUID of the planned session.
 */
export const startWorkoutSession = async (planSessionId?: string): Promise<SessionLog> => {
  const { data, error } = await supabase
    .rpc('start_workout_session', { p_plan_session_id: planSessionId })
    .single();

  if (error) {
    console.error('API Error startWorkoutSession:', error);
    throw new Error(error.message);
  }
  
  // CORRECTED RETURN: We use a type assertion ('as') to cast the unknown data type.
  // This tells TypeScript: "Trust me, this 'data' object is a SessionLog."
  return data as SessionLog;
};


/**
 * Logs a single performed set during an active workout.
 * @param newSet - The data for the new set log.
 */
export const logWorkoutSet = async (newSet: NewSetLog): Promise<SetLog> => {
  const { data, error } = await supabase
    .from('set_logs')
    .insert(newSet)
    .select()
    .single();
  if (error) {
    console.error('API Error logWorkoutSet:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Finalizes a workout session with summary data.
 * @param logId - The ID of the session_log to update.
 * @param updates - The final data to add (duration, notes, etc.).
 */
export const finishWorkoutSession = async (
  logId: string,
  updates: { duration_minutes?: number; notes?: string; overall_feeling?: number }
): Promise<SessionLog> => {
  const { data, error } = await supabase
    .from('session_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  if (error) {
    console.error('API Error finishWorkoutSession:', error);
    throw new Error(error.message);
  }
  return data;
};