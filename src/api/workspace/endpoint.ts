import { supabase } from "@/lib/supabase/supabaseClient";
import { TeamDetails } from "@/types/team"; // Import TeamDetails
import { WorkspaceData } from "@/types/workspace"; // Keep WorkspaceData

/**
 * Fetches the complete, aggregated data for a specific workspace (team).
 * Now uses get_team_details_and_members RPC for a richer dataset.
 * @param teamId - The UUID of the team to fetch data for.
 */
export const fetchWorkspaceData = async (teamId: string): Promise<WorkspaceData | null> => {
  if (!teamId) return null;

  // CHANGED: Calling get_team_details_and_members instead of get_workspace_data
  const { data, error } = await supabase
    .rpc('get_team_details_and_members', { p_team_id: teamId })
    .single();

  if (error) {
    console.error(`API Error fetchWorkspaceData (Team ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  // Cast the data to TeamDetails which matches the RPC output
  // Then, transform it to WorkspaceData if there are any subtle differences,
  // or simply use TeamDetails as your WorkspaceData if they are identical now.
  // Given your current type definitions, they are effectively the same.
  return data as WorkspaceData | null; // Type cast directly as they are now aligned
};