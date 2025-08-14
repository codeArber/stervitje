// src/api/workout-logs/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { 
  SessionLog, 
  SetLog 
} from '@/types/index';

// --- Session Log Operations ---

/** Fetches all session logs */
export const fetchSessionLogs = async (): Promise<SessionLog[]> => {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchSessionLogs:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches session logs by user ID */
export const fetchSessionLogsByUserId = async (userId: string): Promise<SessionLog[]> => {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error(`API Error fetchSessionLogsByUserId (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches a single session log by its ID */
export const fetchSessionLogById = async (logId: string): Promise<SessionLog | null> => {
  if (!logId) return null;

  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('id', logId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchSessionLogById: Session log ${logId} not found.`);
      return null;
    }
    console.error(`API Error fetchSessionLogById (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates a new session log */
export const createSessionLog = async (payload: Omit<SessionLog, 'id' | 'created_at'>): Promise<SessionLog> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // Ensure the payload has the correct user_id
  const logData = {
    ...payload,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('session_logs')
    .insert(logData)
    .select()
    .single();

  if (error) {
    console.error("API Error createSessionLog:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a session log */
export const updateSessionLog = async (
  logId: string,
  payload: Partial<Omit<SessionLog, 'id' | 'created_at' | 'user_id'>>
): Promise<SessionLog> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing log to check ownership
  const { data: existingLog, error: fetchError } = await supabase
    .from('session_logs')
    .select('user_id')
    .eq('id', logId)
    .single();

  if (fetchError) {
    console.error(`API Error updateSessionLog (ID: ${logId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingLog.user_id !== user.id) {
    throw new Error("Cannot update another user's session log");
  }

  const { data, error } = await supabase
    .from('session_logs')
    .update(payload)
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateSessionLog (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a session log */
export const deleteSessionLog = async (logId: string): Promise<{ success: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing log to check ownership
  const { data: existingLog, error: fetchError } = await supabase
    .from('session_logs')
    .select('user_id')
    .eq('id', logId)
    .single();

  if (fetchError) {
    console.error(`API Error deleteSessionLog (ID: ${logId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingLog.user_id !== user.id) {
    throw new Error("Cannot delete another user's session log");
  }

  const { error } = await supabase
    .from('session_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error(`API Error deleteSessionLog (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Set Log Operations ---

/** Fetches all set logs */
export const fetchSetLogs = async (): Promise<SetLog[]> => {
  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchSetLogs:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches set logs by exercise log ID */
export const fetchSetLogsByExerciseLogId = async (exerciseLogId: string): Promise<SetLog[]> => {
  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .eq('exercise_log_id', exerciseLogId)
    .order('set_number', { ascending: true });

  if (error) {
    console.error(`API Error fetchSetLogsByExerciseLogId (Exercise Log ID: ${exerciseLogId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches a single set log by its ID */
export const fetchSetLogById = async (logId: string): Promise<SetLog | null> => {
  if (!logId) return null;

  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .eq('id', logId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchSetLogById: Set log ${logId} not found.`);
      return null;
    }
    console.error(`API Error fetchSetLogById (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates a new set log */
export const createSetLog = async (payload: Omit<SetLog, 'id' | 'created_at'>): Promise<SetLog> => {
  const { data, error } = await supabase
    .from('set_logs')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createSetLog:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a set log */
export const updateSetLog = async (
  logId: string,
  payload: Partial<Omit<SetLog, 'id' | 'created_at' | 'exercise_log_id'>>
): Promise<SetLog> => {
  const { data, error } = await supabase
    .from('set_logs')
    .update(payload)
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateSetLog (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a set log */
export const deleteSetLog = async (logId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('set_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error(`API Error deleteSetLog (ID: ${logId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
