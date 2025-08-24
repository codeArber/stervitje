// src/api/team/endpoint.ts

import { supabase } from '@/lib/supabase/supabaseClient';
// Use centralized types where possible
import type {  Team as BaseTeam, TeamMemberRole } from '@/types/index';
import type {
  NewTeamInsert, // The type for inserting a new team
  TeamDetails,
  RichTeamCardData,
  TeamInvitationWithRelations,
  TeamFilters, // Import the filters interface
  InviteMemberToTeamPayload,
  InviteMemberToTeamResponse,
  RespondToInvitationPayload,
  TeamManagementPlanFilters,
  TeamManagementPlanSummary
} from '@/types/team';


// --- No longer need to define TeamFilters inline ---
// export interface TeamFilters {
//   searchTerm?: string;
// }

/**
 * @description Fetches the complete details for a specific team, including its members and plans.
 * Corresponds to the `get_team_details_and_members` RPC.
 * @param teamId The UUID of the team.
 * @returns A promise that resolves to `TeamDetails` or `null` if not found/permission denied.
 */
export const fetchTeamDetails = async (teamId: string): Promise<TeamDetails | null> => {
  // The RPC itself handles permission checks and raises exceptions.
  const { data, error } = await supabase.rpc('get_team_details_and_members', { p_team_id: teamId });
  if (error) {
    console.error(`API Error fetchTeamDetails (Team ID: ${teamId}):`, error);
    throw new Error(error.message);
  }
  // RPC returns jsonb_build_object, which can be `null` if no team found or access denied (caught by RPC error).
  return data as TeamDetails | null;
};

export const fetchTeamManagementPlans = async (teamId: string, filters: TeamManagementPlanFilters): Promise<TeamManagementPlanSummary[]> => {
  if (!teamId) return [];

  const { data, error } = await supabase
    .rpc('get_team_plans_rich_for_management', {
      p_team_id: teamId,
      p_search_term: filters.searchTerm, // Assuming RPC supports searchTerm if needed
      p_page_limit: filters.pageLimit,
      p_page_offset: filters.pageOffset,
    });

  if (error) {
    console.error(`API Error fetchTeamManagementPlans (Team ID: ${teamId}):`, error);
    throw new Error(error.message);
  }
  // The RPC returns jsonb_agg, which will be [] if no results.
  return (data as TeamManagementPlanSummary[]) || [];
};

/**
 * @description Fetches rich data for team cards on the Explore page.
 * Corresponds to the `get_filtered_teams_rich` RPC.
 * @param filters An object containing optional search terms and pagination.
 * @returns A promise that resolves to an array of `RichTeamCardData`.
 */
export const fetchRichTeamCards = async (filters: TeamFilters): Promise<RichTeamCardData[]> => {
    const { data, error } = await supabase
      .rpc('get_filtered_teams_rich', {
        p_search_term: filters.searchTerm,
        p_page_limit: filters.pageLimit, // Include pagination parameters
        p_page_offset: filters.pageOffset,
      });

    if (error) {
      console.error('API Error fetchRichTeamCards:', error);
      throw new Error(error.message);
    }
    // RPC returns jsonb_agg, which will be [] if no results.
    return (data as RichTeamCardData[]) || [];
};

/**
 * @description Creates a new team and automatically makes the creator an admin.
 * Corresponds to the `create_new_team` RPC.
 * @param newTeamData The data for the new team (excluding auto-generated fields).
 * @returns A promise that resolves to the newly created `Team` record.
 */
export const createTeam = async (newTeamData: Omit<NewTeamInsert, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_personal_workspace'>): Promise<BaseTeam> => {
  const { name, description, is_private, sport } = newTeamData; // Added 'sport'
  // The RPC `create_new_team` returns `SETOF teams` (an array of teams).
  // If it's designed to always return exactly one team, we can pick the first element.
  const { data, error } = await supabase.rpc('create_new_team', {
    p_name: name,
    p_description: description,
    p_is_private: is_private,
    p_sport: sport // Pass sport to RPC
  });

  if (error) {
    console.error('API Error createTeam:', error);
    throw new Error(error.message);
  }

  // The RPC function is typed as returning an array in `database.types.ts`.
  // If `create_new_team` always returns exactly one new team, take the first element.
  if (data && data.length > 0) {
    return data[0] as BaseTeam;
  }
  throw new Error("Failed to create team: No data returned.");
};


/**
 * @description Fetches all pending team invitations for the current user.
 * Corresponds to the `get_my_pending_invitations` RPC.
 * @returns A promise that resolves to an array of `TeamInvitationWithRelations`.
 */
export const fetchPendingInvitations = async (): Promise<TeamInvitationWithRelations[]> => {
    const { data, error } = await supabase
      .rpc('get_my_pending_invitations');

    if (error) {
        console.error('API Error fetchPendingInvitations:', error);
        throw new Error(error.message);
    }

    // The RPC returns a single JSONB array, which will be [] if no invites.
    return (data as TeamInvitationWithRelations[]) || [];
};

/**
 * @description Sends an invitation email via an Edge Function.
 * @param invitationId The UUID of the newly created team_invitations record.
 */
const sendInvitationEmail = async (invitationId: string) => {
  const { error } = await supabase.functions.invoke('send-invite-email', {
    body: { invitationId },
  });

  if (error) {
    console.error(`Failed to send invitation email for invite ${invitationId}:`, error.message);
  }
};

/**
 * @description Orchestrates inviting a member to a team, including creating the DB record and sending an email.
 * Corresponds to the `invite_member_to_team` RPC and a Supabase Edge Function call.
 * @param inviteData - Object containing `teamId`, `role`, `email` (optional), and `userId` (optional).
 */
export const inviteMember = async (inviteData: InviteMemberToTeamPayload): Promise<InviteMemberToTeamResponse> => {
  // Step 1: Call the RPC to create the database record and get the new ID back.
  const { data: responseData, error: rpcError } = await supabase.rpc('invite_member_to_team', {
    p_team_id: inviteData.teamId,
    p_role: inviteData.role,
    p_invited_email: inviteData.email,
    p_invited_user_id: inviteData.userId
  });

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  // The RPC explicitly returns `jsonb_build_object('id', new_invitation_id)`.
  const newInvitationId = (responseData as InviteMemberToTeamResponse)?.id;

  if (!newInvitationId) {
    throw new Error("Failed to create invitation record in the database or retrieve its ID.");
  }

  // Step 2: If an email was provided, invoke the Edge Function to send the notification.
  if (inviteData.email) {
    await sendInvitationEmail(newInvitationId);
  }

  return { id: newInvitationId }; // Explicitly return the new ID
};

/**
 * @description Responds to a team invitation (accept or decline).
 * Corresponds to the `respond_to_team_invitation` RPC.
 * @param responseData - Object containing `invitationId` and `accept` boolean.
 */
export const respondToInvitation = async (responseData: RespondToInvitationPayload): Promise<void> => {
  const { error } = await supabase
    .rpc('respond_to_team_invitation', {
      p_invitation_id: responseData.invitationId,
      p_accepted: responseData.accept
    });

  if (error) {
    console.error('API Error respondToInvitation:', error);
    throw new Error(error.message);
  }
};