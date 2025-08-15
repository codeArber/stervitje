// src/api/team/index.ts
import { useQuery } from '@tanstack/react-query';
import { fetchDiscoverableTeams, fetchDiscoverableTeamsWithRichDetails, fetchTeamDetails, TeamFilters } from './endpoint';
import type { DiscoverableTeamRichDetails, Team, TeamDetails } from '@/types/team/index';

// --- Query Keys ---
const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const, // For lists of teams later
  details: () => [...teamKeys.all, 'details'] as const,
  // A key for fetching the details of a *specific* team by its ID
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
  list: (filters: TeamFilters) => [...teamKeys.lists(), filters] as const,
};

// --- Hooks ---

/**
 * Hook for fetching the complete, aggregated details for any team.
 * Your components will use this hook to display team pages.
 *
 * @param teamId - The ID of the team to fetch. The hook will be disabled if no ID is provided.
 */
export const useTeamDetailsQuery = (teamId: string | undefined) => {
  return useQuery<TeamDetails | null, Error>({
    // The key is dynamic based on the teamId
    queryKey: teamKeys.detail(teamId!),
    // The query function calls our new endpoint function
    queryFn: () => fetchTeamDetails(teamId!),
    // The query will not run until a teamId is available.
    enabled: !!teamId,
  });
};



/**
 * **UPDATED:** This hook now calls the new endpoint function and returns the richer data type.
 */
export const useDiscoverableTeamsQuery = (filters: TeamFilters) => {
  return useQuery<DiscoverableTeamRichDetails[], Error>({
    queryKey: teamKeys.list(filters),
    queryFn: () => fetchDiscoverableTeamsWithRichDetails(filters),
  });
};