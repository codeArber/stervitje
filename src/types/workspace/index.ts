// src/types/workspace/index.ts

// Import the rich team details type from the team module
import type { TeamDetails, TeamMemberWithProfile } from '@/types/team';

// No need for explicit 'team', 'members', 'plans', 'current_user_role' properties here anymore
// as they are all part of the aliased TeamDetails.
export type WorkspaceData = TeamDetails;

/**
 * @description Represents a single member within the workspace view.
 * This is an alias for `TeamMemberWithProfile`.
 */
export type WorkspaceMember = TeamMemberWithProfile;