// src/api/user/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { Profile } from '@/types/index';

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
