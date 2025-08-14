// src/api/user-measurements/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { UserMeasurements } from '@/types/index';

/** Fetches all user measurements */
export const fetchUserMeasurements = async (): Promise<UserMeasurements[]> => {
  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchUserMeasurements:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches user measurements by user ID */
export const fetchUserMeasurementsByUserId = async (userId: string): Promise<UserMeasurements[]> => {
  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false });

  if (error) {
    console.error(`API Error fetchUserMeasurementsByUserId (User ID: ${userId}):`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches a single user measurement by its ID */
export const fetchUserMeasurementById = async (measurementId: string): Promise<UserMeasurements | null> => {
  if (!measurementId) return null;

  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .eq('id', measurementId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchUserMeasurementById: Measurement ${measurementId} not found.`);
      return null;
    }
    console.error(`API Error fetchUserMeasurementById (ID: ${measurementId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates new user measurements */
export const createUserMeasurements = async (payload: Omit<UserMeasurements, 'id' | 'created_at'>): Promise<UserMeasurements> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // Ensure the payload has the correct user_id
  const measurementData = {
    ...payload,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('user_measurements')
    .insert(measurementData)
    .select()
    .single();

  if (error) {
    console.error("API Error createUserMeasurements:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates user measurements */
export const updateUserMeasurements = async (
  measurementId: string,
  payload: Partial<Omit<UserMeasurements, 'id' | 'created_at' | 'user_id'>>
): Promise<UserMeasurements> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing measurement to check ownership
  const { data: existingMeasurement, error: fetchError } = await supabase
    .from('user_measurements')
    .select('user_id')
    .eq('id', measurementId)
    .single();

  if (fetchError) {
    console.error(`API Error updateUserMeasurements (ID: ${measurementId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingMeasurement.user_id !== user.id) {
    throw new Error("Cannot update another user's measurements");
  }

  const { data, error } = await supabase
    .from('user_measurements')
    .update(payload)
    .eq('id', measurementId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateUserMeasurements (ID: ${measurementId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes user measurements */
export const deleteUserMeasurements = async (measurementId: string): Promise<{ success: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing measurement to check ownership
  const { data: existingMeasurement, error: fetchError } = await supabase
    .from('user_measurements')
    .select('user_id')
    .eq('id', measurementId)
    .single();

  if (fetchError) {
    console.error(`API Error deleteUserMeasurements (ID: ${measurementId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingMeasurement.user_id !== user.id) {
    throw new Error("Cannot delete another user's measurements");
  }

  const { error } = await supabase
    .from('user_measurements')
    .delete()
    .eq('id', measurementId);

  if (error) {
    console.error(`API Error deleteUserMeasurements (ID: ${measurementId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
