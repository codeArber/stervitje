// src/api/team/index.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// src/api/team/index.ts
import {
    createTeam,
    fetchTeamDetails,
    fetchRichTeamCards, 
    type TeamFilters,
    fetchPendingInvitations,
    inviteMember,
    respondToInvitation
} from './endpoint';
import type { NewTeam, RichTeamCardData, Team, TeamDetails, TeamInvitationWithRelations, TeamMemberRole } from '@/types/team';

const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: TeamFilters) => [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'details'] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
};

const teamInvitationKeys = {
    all: ['teamInvitations'] as const,
    lists: () => [...teamInvitationKeys.all, 'list'] as const,
    list: (status: string) => [...teamInvitationKeys.lists(), status] as const,
};

export const useTeamDetailsQuery = (teamId: string | undefined) => {
  return useQuery<TeamDetails | null, Error>({
    queryKey: teamKeys.detail(teamId!),
    queryFn: () => fetchTeamDetails(teamId!),
    enabled: !!teamId,
  });
};

/**
 * NEW & REPLACES OLD HOOK: Fetches rich data for team cards on the Explore page.
 */
export const useRichTeamCardsQuery = (filters: TeamFilters) => {
    return useQuery<RichTeamCardData[], Error>({
      queryKey: teamKeys.list(filters),
      queryFn: () => fetchRichTeamCards(filters),
    });
};

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, Omit<NewTeam, 'id' | 'created_by' | 'created_at' | 'updated_at'>>({
    mutationFn: (newTeamData) => createTeam(newTeamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
};

// ... (Your invitation mutation hooks can remain the same)

export const usePendingInvitationsQuery = () => {
    return useQuery<TeamInvitationWithRelations[], Error>({
        queryKey: teamInvitationKeys.list('pending'),
        queryFn: fetchPendingInvitations,
    });
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, {
    teamId: string;
    role: TeamMemberRole;
    email?: string;
    userId?: string;
  }>({
    mutationFn: (inviteData) => inviteMember(inviteData),
    onSuccess: (_, variables) => {
      // On success, we know the DB record was created, so we can refresh the team details.
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
    },
  });
};

/**
 * **NEW:** Hook for responding to a team invitation.
 */
export const useRespondToInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { invitationId: string, accept: boolean }>({
    mutationFn: (responseData) => respondToInvitation(responseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamInvitationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'details'] });
    },
  });
};