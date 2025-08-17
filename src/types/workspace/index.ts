import type { Plan, Team, Profile } from '@/types/index';
import type { TeamMemberRole } from '@/types/team';
import type { TeamMemberWithProfile } from '@/types/team'; // Import this type

// Type for a single member within the workspace view
// Already exists as TeamMemberWithProfile, so we can reuse or keep this alias if desired.
export type WorkspaceMember = TeamMemberWithProfile;

// This is the main type for the entire JSON object returned by the get_team_details_and_members RPC.
export type WorkspaceData = {
  team: Team;
  members: WorkspaceMember[] | null; // Renamed to 'members' to match RPC
  plans: Plan[] | null;
  current_user_role: TeamMemberRole | null; // Matches RPC output
};