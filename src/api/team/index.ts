// src/api/team/index.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createTeam,
    fetchTeamDetails,
    fetchRichTeamCards,
    fetchPendingInvitations,
    inviteMember,
    respondToInvitation,
    fetchTeamManagementPlans
} from './endpoint';
import type {
  NewTeamInsert, // Use the renamed type
  RichTeamCardData,
  Team as TeamType, // Alias BaseTeam to TeamType to avoid clash with module name
  TeamDetails,
  TeamInvitationWithRelations,
  TeamFilters, // Use the new filters interface
  InviteMemberToTeamPayload,
  InviteMemberToTeamResponse, // Import the new response type
  RespondToInvitationPayload,
  TeamManagementPlanFilters,
  TeamManagementPlanSummary
} from '@/types/team';
import { toast } from 'sonner';

const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: TeamFilters) => [...teamKeys.lists(), filters] as const, // Use TeamFilters
  details: () => [...teamKeys.all, 'details'] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
  teamManagementPlans: (teamId: string, filters: TeamManagementPlanFilters) => [...teamKeys.all, 'management', teamId, filters] as const, // NEW KEY

};

const teamInvitationKeys = {
    all: ['teamInvitations'] as const,
    lists: () => [...teamInvitationKeys.all, 'list'] as const,
    list: (status: string) => [...teamInvitationKeys.lists(), status] as const, // status is an enum, but string for key is fine
};

/**
 * @description Hook for fetching the complete details of a single team.
 * @param teamId The ID of the team. Query is enabled if teamId is provided.
 */
export const useTeamDetailsQuery = (teamId: string | undefined) => {
  return useQuery<TeamDetails | null, Error>({
    queryKey: teamKeys.detail(teamId!),
    queryFn: () => fetchTeamDetails(teamId!),
    enabled: !!teamId,
  });
};

/**
 * @description Hook for fetching rich data for team cards on the Explore page.
 * @param filters Optional filters for the team list.
 */
export const useRichTeamCardsQuery = (filters: TeamFilters) => { // Use TeamFilters here
    return useQuery<RichTeamCardData[], Error>({
      queryKey: teamKeys.list(filters),
      queryFn: () => fetchRichTeamCards(filters),
    });
};

/**
 * @description Hook for creating a new team.
 */
export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient();
  // Return type is `TeamType` (BaseTeam), and input payload uses `NewTeamInsert` (Omit unnecessary fields)
  return useMutation<TeamType, Error, Omit<NewTeamInsert, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_personal_workspace'>>({
    mutationFn: (newTeamData) => createTeam(newTeamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all }); // Invalidate all team lists/details
      toast.success("Team created successfully!"); // Added toast
    },
    onError: (error) => {
      toast.error(`Failed to create team: ${error.message}`); // Added toast
    }
  });
};

/**
 * @description Hook for fetching all pending team invitations for the current user.
 */
export const usePendingInvitationsQuery = () => {
    return useQuery<TeamInvitationWithRelations[], Error>({
        queryKey: teamInvitationKeys.list('pending'), // 'pending' status
        queryFn: fetchPendingInvitations,
    });
};

/**
 * @description Hook for inviting a member to a team.
 */
export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<InviteMemberToTeamResponse, Error, InviteMemberToTeamPayload>({ // Return type `InviteMemberToTeamResponse`
    mutationFn: (inviteData) => inviteMember(inviteData),
    onSuccess: (data, variables) => {
      // On success, we know the DB record was created, so we can refresh the team details
      // to reflect the new invitation/member count.
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      toast.success("Invitation sent!"); // Added toast
    },
    onError: (error) => {
      toast.error(`Failed to send invitation: ${error.message}`); // Added toast
    }
  });
};

/**
 * @description Hook for responding to a team invitation (accept or decline).
 */
export const useRespondToInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RespondToInvitationPayload>({
    mutationFn: (responseData) => respondToInvitation(responseData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamInvitationKeys.lists() }); // Invalidate pending invitations
      queryClient.invalidateQueries({ queryKey: teamKeys.all }); // Invalidate all teams to refresh member lists
      queryClient.invalidateQueries({ queryKey: ['user', 'details'] }); // Invalidate user details (e.g. dashboard, current_workspace_id)
      toast.success(`Invitation ${variables.accept ? 'accepted' : 'declined'}!`); // Added toast
    },
    onError: (error) => {
      toast.error(`Failed to respond to invitation: ${error.message}`); // Added toast
    }
  });
};


/**
 * @description Hook for fetching a detailed list of plans for a specific team,
 * tailored for management view.
 * @param teamId The ID of the team.
 * @param filters Optional filters for search and pagination.
 * @returns A query result containing an array of `TeamManagementPlanSummary`.
 */
export const useTeamManagementPlansQuery = (teamId: string | undefined, filters: TeamManagementPlanFilters = {}) => {
  return useQuery<TeamManagementPlanSummary[], Error>({
    queryKey: teamKeys.teamManagementPlans(teamId!, filters), // Assert teamId! because enabled is based on it
    queryFn: () => fetchTeamManagementPlans(teamId!, filters),
    enabled: !!teamId,
  });
};