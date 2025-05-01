// src/api/teams/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Team, TeamMemberWithProfile } from '@/types'; // Define these types

/** Fetches details for a specific team */
export const fetchTeamDetails = async (teamId: string | null | undefined): Promise<Team | null> => {
    if (!teamId) return null;

    // Rely on RLS to determine if the user can view this team
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle();

     if (error && error.code !== 'PGRST116') {
        console.error(`API Error fetchTeamDetails (ID: ${teamId}):`, error);
        throw new Error(error.message);
    }
    return data as Team | null;
}

/** Fetches all teams for a specific member */
export const fetchAllTeamsForMember = async (userId: string | null | undefined): Promise<Team[]> => {
    if (!userId) return [];

    // Rely on RLS to ensure the user can only see teams they are a member of
    const { data, error } = await supabase
        .from('team_members')
        .select(`
            team_id,
            teams ( id, name, description, sport, is_private, logo_url, created_by )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error(`API Error fetchAllTeamsForMember (User ID: ${userId}):`, error);
        throw new Error(error.message);
    }

    // Extract and return the teams
    return (data?.map(m => m.teams) || []) as unknown as Team[];
};


/** Fetches members of a specific team (includes user profile info) */
export const fetchTeamMembers = async (teamId: string | null | undefined): Promise<TeamMemberWithProfile[]> => {
     if (!teamId) return [];

     // Rely on RLS: User should be member of teamId to view members
     const { data, error } = await supabase
        .from('team_members')
        .select(`
         *,
            profiles ( * )
        `)
        .eq('team_id', teamId)
        // Ensure profiles relation returns data, filter out memberships without profiles if needed
        // .not('profiles', 'is', null); // Only include if profile exists

     if (error) {
        console.error(`API Error fetchTeamMembers (ID: ${teamId}):`, error);
        throw new Error(error.message);
    }
     // Clean up data structure if profiles is null for some reason
     return (data?.map(m => ({ ...m, profile: m.profiles })) || []) as unknown as TeamMemberWithProfile[];
}

// --- Team Management Endpoints (Examples - Require 'coach' role checks) ---

/** Creates a new team, making the caller the first 'coach' */
export const createTeam = async (teamData: Pick<Team, 'name' | 'description' | 'sport' | 'is_private' | 'logo_url'>): Promise<Team> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // Use a transaction or RPC for atomicity (create team AND add member)
    // For simplicity here, we do it sequentially, but this is not ideal
    const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({ ...teamData, created_by: user.id }) // Track creator
        .select()
        .single();

    if (teamError || !newTeam) {
         console.error(`API Error createTeam:`, teamError);
         throw new Error(teamError?.message || "Failed to create team record.");
    }

    // Add the creator as the first coach
    const { error: memberError } = await supabase
        .from('team_members')
        .insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'coach'
        });

     if (memberError) {
         console.error(`API Error adding initial coach for team ${newTeam.id}:`, memberError);
         // Ideally, roll back team creation here if using a transaction/RPC
         throw new Error(memberError.message);
     }

    return newTeam as Team;
}

/** Adds a user to a team (requires caller to be coach) */
export const addTeamMember = async ({ teamId, userId, role }: { teamId: string, userId: string, role: string}) => {
     // !! IMPORTANT: Add server-side check (RPC or Edge Function) to verify
     // !! that the calling user is a 'coach' of this teamId before proceeding.
     // !! Relying only on RLS might not be enough if members can invite members.

    const { data, error } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: userId, role: role })
        .select() // Optionally return the new membership record
        .single();

    if (error) {
        console.error(`API Error addTeamMember (Team: ${teamId}, User: ${userId}):`, error);
        // Handle specific errors like unique constraint violation (already member)
        if (error.code === '23505') throw new Error("User is already a member of this team.");
        throw new Error(error.message);
    }
    return data;
}

/** Removes a user from a team (requires caller to be coach) */
export const removeTeamMember = async ({ teamId, userId }: { teamId: string, userId: string }) => {
     // !! IMPORTANT: Add server-side check (RPC or Edge Function) to verify
     // !! that the calling user is a 'coach' of this teamId.
     // !! Also prevent coach from removing themselves if they are the last coach.

     const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

     if (error) {
        console.error(`API Error removeTeamMember (Team: ${teamId}, User: ${userId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
}

// Add updateTeam, updateMemberRole endpoints similarly, always including permission checks

/** Fetches all public teams */
export const fetchAllPublicTeams = async (): Promise<Team[]> => {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_private', false);

    if (error) {
        console.error(`API Error fetchAllPublicTeams:`, error);
        throw new Error(error.message);
    }

    return data as Team[];
};