// src/api/teams/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamsApi from './endpoint';
import type { Team, TeamsPayload, TeamDetail } from '@/types/index';

// --- Query Keys ---
const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// --- Hooks ---

/** Hook for fetching all teams */
export const useFetchTeams = () => {
  return useQuery<Team[], Error>({
    queryKey: teamKeys.lists(),
    queryFn: teamsApi.fetchTeams,
  });
};

/** Hook for fetching a single team by ID */
export const useFetchTeamById = (teamId: string | undefined | null) => {
  return useQuery<Team | null, Error>({
    queryKey: teamKeys.detail(teamId!),
    queryFn: () => teamsApi.fetchTeamById(teamId!),
    enabled: !!teamId,
  });
};

/** Hook for fetching team details with members and plans */
export const useFetchTeamDetail = (teamId: string | undefined | null) => {
  return useQuery<TeamDetail, Error>({
    queryKey: teamKeys.detail(teamId!),
    queryFn: () => teamsApi.fetchTeamDetail(teamId!),
    enabled: !!teamId,
  });
};

/** Hook for creating a new team */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, TeamsPayload>({
    mutationFn: teamsApi.createTeam,
    onSuccess: (newTeam) => {
      console.log('Team created successfully:', newTeam);
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.setQueryData(teamKeys.detail(newTeam.id), newTeam);
    },
  });
};

/** Hook for updating a team */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, { teamId: string; payload: Partial<TeamsPayload> }>({
    mutationFn: ({ teamId, payload }) => teamsApi.updateTeam(teamId, payload),
    onSuccess: (updatedTeam, variables) => {
      console.log(`Team ${variables.teamId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.setQueryData(teamKeys.detail(variables.teamId), updatedTeam);
    },
  });
};

/** Hook for deleting a team */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: teamsApi.deleteTeam,
    onSuccess: (data, deletedTeamId) => {
      console.log(`Team ${deletedTeamId} deleted.`);
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(deletedTeamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};
