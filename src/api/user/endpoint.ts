// src/api/user/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { UserContext, UserProfile } from '@/types'; // Import defined types

/** Fetches the current user's profile and team memberships using RPC. */
// Return type is explicitly Promise<UserContext>
export const fetchUserContext = async (): Promise<UserContext> => {
    const { data, error } = await supabase.rpc('get_user_context');
    if (error) {
        console.error("API Error fetchUserContext:", error);
        throw new Error(error.message);
    }
    // Cast the jsonb result from RPC to our defined UserContext type
    return data as UserContext;
};

/** Updates the calling user's profile. */
// Argument type is Partial<UserProfile>, return type Promise<UserProfile>
export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // Destructure to exclude non-updatable fields explicitly
    const { id, created_at, ...updateData } = profileData;

    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select() // Select updated record
        .single();

     if (error) {
        console.error("API Error updateProfile:", error);
        throw new Error(error.message);
    }
    // Cast the result to UserProfile
    return data as UserProfile;
}