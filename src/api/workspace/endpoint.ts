// src/api/workspace/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
// Removed direct import of TeamDetails to rely on WorkspaceData alias
import { WorkspaceData } from "@/types/workspace"; // Keep WorkspaceData (which is now an alias for TeamDetails)

/**
 * @description Fetches the complete, aggregated data for a specific workspace (team).
 * Now uses `get_team_details_and_members` RPC for a richer dataset.
 * @param teamId - The UUID of the team to fetch data for.
 * @returns A promise that resolves to `WorkspaceData` or `null`.
 */
export const fetchWorkspaceData = async (teamId: string): Promise<WorkspaceData | null> => {
  if (!teamId) return null;

  // Calling `get_team_details_and_members` RPC.
  // The RPC returns jsonb_build_object, which will be a single object or NULL.
  // `.single()` is appropriate here.
  const { data, error } = await supabase
    .rpc('get_team_details_and_members', { p_team_id: teamId })
    .single(); // Ensure .single() is called here for direct object return

  if (error) {
    console.error(`API Error fetchWorkspaceData (Team ID: ${teamId}):`, error);
    throw new Error(error.message);
  }

  // The `data` is now directly typed as `TeamDetails` (because of `get_team_details_and_members` RPC definition in `database.types.ts`
  // when it returns a composite type, or as `Json` if not inferred).
  // Since `WorkspaceData` is an alias for `TeamDetails`, this cast is correct.
  return data as WorkspaceData | null;
};