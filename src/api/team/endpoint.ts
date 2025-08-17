// src/api/team/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
import type { NewTeam, Team, TeamDetails, RichTeamCardData, TeamInvitationWithRelations } from '@/types/team';
import type { TeamMemberRole } from '@/types/team/index';

export interface TeamFilters {
  searchTerm?: string;
}

export const fetchTeamDetails = async (teamId: string): Promise<TeamDetails | null> => {
  const { data, error } = await supabase.rpc('get_team_details_and_members', { p_team_id: teamId });
  if (error) { throw new Error(error.message); }
  return data;
};

/**
 * NEW & REPLACES OLD FUNCTION: Fetches rich data for team cards on the Explore page.
 */
export const fetchRichTeamCards = async (filters: TeamFilters): Promise<RichTeamCardData[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_teams_rich', {
        p_search_term: filters.searchTerm,
      });

    if (error) {
      console.error('API Error fetchRichTeamCards:', error);
      throw new Error(error.message);
    }
    return (data as RichTeamCardData[]) || [];
};

export const createTeam = async (newTeamData: Omit<NewTeam, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_personal_workspace'>): Promise<Team> => {
  const { name, description, is_private } = newTeamData;
  const { data, error } = await supabase.rpc('create_new_team', { p_name: name, p_description: description, p_is_private: is_private }).single();
  if (error) { throw new Error(error.message); }
  return data as Team;
};


export const fetchPendingInvitations = async (): Promise<TeamInvitationWithRelations[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // The 'select' string has been corrected to remove the trailing comma.
    const { data, error } = await supabase
        .from('team_invitations')
        .select(`
            *,
            teams(*),
            profiles:invited_by(*)
        `) // <--- The comma is now removed from the end of this line
        .eq('status', 'pending')
        .eq('invited_user_id', user.id);
    
    if (error) {
        console.error('API Error fetchPendingInvitations:', error);
        throw new Error(error.message);
    }
    return data || [];
};



const sendInvitationEmail = async (invitationId: string) => {
  // The 'invoke' helper is simple. The second argument is the body object.
  // It automatically handles POST, headers, and stringifying the body.
  const { error } = await supabase.functions.invoke('send-invite-email', {
    body: { invitationId }, // Just pass the object directly
  });

  if (error) {
    // We log the error but don't re-throw, so the UI can succeed
    // even if the email fails to send.
    console.error(`Failed to send invitation email for invite ${invitationId}:`, error.message);
  }
};

// This is the main function that orchestrates the entire process
export const inviteMember = async ({ teamId, email, role, userId }: {
  teamId: string;
  role: TeamMemberRole;
  email?: string;
  userId?: string;
}) => {
  // Step 1: Call the RPC to create the database record and get the new ID back.
  const { data: responseData, error: rpcError } = await supabase.rpc('invite_member_to_team', {
    p_team_id: teamId,
    p_role: role,
    p_invited_email: email,
    p_invited_user_id: userId
  });

  if (rpcError) {
    // If the database operation fails, we stop immediately.
    throw new Error(rpcError.message);
  }

  const newInvitationId = responseData?.id;

  if (!newInvitationId) {
    throw new Error("Failed to create invitation record in the database.");
  }

  // Step 2: If the record was created and an email was provided,
  // invoke the Edge Function to send the notification.
  if (email) {
    await sendInvitationEmail(newInvitationId);
  }
};

export const respondToInvitation = async ({ invitationId, accept }: { invitationId: string, accept: boolean }) => {
  const { error } = await supabase
    .rpc('respond_to_team_invitation', {
      p_invitation_id: invitationId,
      p_accepted: accept
    });

  if (error) {
    console.error('API Error respondToInvitation:', error);
    throw new Error(error.message);
  }
};