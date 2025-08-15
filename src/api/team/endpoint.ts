// src/api/team/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { DiscoverableTeamRichDetails, Team, TeamDetails } from '@/types/team/index';

export interface TeamFilters {
  searchTerm?: string;
}

/**
 * Fetches the complete, aggregated details for a specific team, including its members.
 * This is the function that calls our RPC.
 *
 * @param teamId - The UUID of the team we want to fetch.
 */
export const fetchTeamDetails = async (teamId: string): Promise<TeamDetails | null> => {
  if (!teamId) {
    console.warn("API Warning fetchTeamDetails: No teamId provided.");
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_team_details_and_members', { p_team_id: teamId });

  if (error) {
    console.error(`API Error fetchTeamDetails (Team ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * **MOVED HERE:** Fetches all public teams for the explore page.
 */
export const fetchDiscoverableTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .rpc('get_discoverable_teams');

  if (error) {
    console.error('API Error fetchDiscoverableTeams:', error);
    throw new Error(error.message);
  }
  return data || [];
};

export const fetchDiscoverableTeamsWithRichDetails = async (filters: TeamFilters): Promise<DiscoverableTeamRichDetails[]> => {
  const { data, error } = await supabase
    .rpc('get_discoverable_teams_rich', {
      p_search_term: filters.searchTerm,
    });

  if (error) {
    console.error('API Error fetchDiscoverableTeamsWithRichDetails:', error);
    throw new Error(error.message);
  }
  return (data as DiscoverableTeamRichDetails[]) || [];
};