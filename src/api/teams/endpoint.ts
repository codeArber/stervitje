// src/api/teams/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { Team, TeamsPayload, TeamDetail } from '@/types/index';

/** Fetches all teams with member and plan counts */
export const fetchTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      members:team_members(count),
      plans:plans(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchTeams:', error);
    throw new Error(error.message);
  }

  // Transform count response into flat properties
  return (data || []).map(team => ({
    ...team,
    members_count: team.members[0]?.count ?? 0,
    plans_count: team.plans[0]?.count ?? 0,
  }));
};


/** Fetches a single team by its ID */
export const fetchTeamById = async (teamId: string): Promise<Team | null> => {
  if (!teamId) return null;

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchTeamById: Team ${teamId} not found.`);
      return null;
    }
    console.error(`API Error fetchTeamById (ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Fetches a team with its members and plans */
export const fetchTeamDetail = async (teamId: string): Promise<TeamDetail> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        *,
        profiles (
          username
        )
      ),
      plans (
        id,
        title,
        description,
        created_at
      )
    `)
    .eq('id', teamId)
    .single();

  if (error) {
    console.error(`API Error fetchTeamDetail (ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates a new team */
export const createTeam = async (payload: TeamsPayload): Promise<Team> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('teams')
    .insert({
      ...payload,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("API Error createTeam:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates an existing team */
export const updateTeam = async (
  teamId: string,
  payload: Partial<TeamsPayload>
): Promise<Team> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('teams')
    .update(payload)
    .eq('id', teamId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateTeam (ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a team */
export const deleteTeam = async (teamId: string): Promise<{ success: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error(`API Error deleteTeam (ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
