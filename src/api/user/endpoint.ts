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

/** Fetches a list of all users. */
// Return type is explicitly Promise<UserProfile[]>
export const fetchUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*'); // Select all fields from the profiles table

    if (error) {
        console.error("API Error fetchUsers:", error);
        throw new Error(error.message);
    }
    // Cast the result to an array of UserProfile
    return data as UserProfile[];
};

/** Fetches the teams the current user is a member of. */
// Return type is explicitly Promise<any[]> (replace `any` with a specific type if available)
export const fetchUserTeams = async (userId: string): Promise<any[]> => {

    const { data, error } = await supabase
        .from('team_members')
        .select('*, team:teams(*)') // Adjust fields as needed
        .eq('user_id', userId)

    if (error) {
        console.error("API Error fetchUserTeams:", error);
        throw new Error(error.message);
    }
    return data || [];
};

/** Fetches the plans associated with the current user. */
// Return type is explicitly Promise<any[]> (replace `any` with a specific type if available)
export const fetchUserPlans = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('user_plans')
        .select('*, plan:plans(*)') // Adjust fields as needed
        .eq('user_id', userId);

    if (error) {
        console.error("API Error fetchUserPlans:", error);
        throw new Error(error.message);
    }
    return data || [];
};

/** Fetches a list of public workouts. */
// Return type is explicitly Promise<any[]> (replace `any` with a specific type if available)
export const fetchPublicWorkouts = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('workout_logs')
        .select('*') // Adjust fields as needed
        .eq('privacy_level', 'public') // Filter for public workouts
        .eq('user_id', userId); // Filter by user ID

    if (error) {
        console.error("API Error fetchPublicWorkouts:", error);
        throw new Error(error.message);
    }
    return data || [];
};