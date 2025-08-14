import { supabase } from '@/lib/supabase/supabaseClient';
import { Profile, ProfileUpdate } from '@/types/index';
import { profileSchema } from '@/validation/schemas';
import { z } from 'zod';

/** Fetches all profiles */
export const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchProfiles:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches a single profile by its ID */
export const fetchProfileById = async (profileId: string): Promise<Profile | null> => {
  if (!profileId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchProfileById: Profile ${profileId} not found.`);
      return null;
    }
    console.error(`API Error fetchProfileById (ID: ${profileId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Fetches the current user's profile */
export const fetchCurrentUserProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchCurrentUserProfile: Profile for user ${user.id} not found.`);
      return null;
    }
    console.error(`API Error fetchCurrentUserProfile (User ID: ${user.id}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a profile */
export const updateProfile = async (
  profileId: string,
  payload: Partial<ProfileUpdate>
): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // Only allow updating own profile
  if (user.id !== profileId) {
    throw new Error("Cannot update another user's profile");
  }

  // Validate payload with Zod before sending to database
  const validatedPayload = profileSchema.parse(payload);

  const { data, error } = await supabase
    .from('profiles')
    .update(validatedPayload)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateProfile (ID: ${profileId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates a profile for a user (if it doesn't exist) */
export const createProfile = async (userId: string, payload: Partial<ProfileUpdate>): Promise<Profile> => {
  // Validate payload with Zod before sending to database
  const validatedPayload = profileSchema.parse(payload);

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...validatedPayload
    })
    .select()
    .single();

  if (error) {
    console.error("API Error createProfile:", error);
    throw new Error(error.message);
  }

  return data;
};
