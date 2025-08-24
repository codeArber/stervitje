// src/types/team/index.ts

import { Tables, TablesInsert } from "../database.types";
import { ExerciseMuscleWithEngagement } from "../exercise";
import { ExplorePlanCard } from "../explore";
import type { Profile, Team as BaseTeam, TeamMemberRole, InvitationStatus, Tag, UserPlanStatus } from "../index";
import { Plan, PlanGoal } from "../plan";

// Re-exporting base types for convenience if this file is the primary entry for team-related types
export type Team = BaseTeam;
export type TeamInvitation = Tables<'team_invitations'>;
export type NewTeamInsert = TablesInsert<'teams'>; // Renamed to clarify it's for INSERT


/**
 * @description Represents a team invitation with details of the team and the inviter's profile.
 * Corresponds to items returned by `get_my_pending_invitations` RPC.
 */
export type TeamInvitationWithRelations = Tables<'team_invitations'> & {
  teams: Team; // Joined team details
  profiles: Profile; // The profile of the 'invited_by' user
};

/**
 * @description Represents a team member with their profile details and role.
 * Corresponds to items in `TeamDetails.members` and used elsewhere.
 */
export type TeamMemberWithProfile = {
  profile: Profile;
  role: TeamMemberRole;
};

/**
 * @description Filters for fetching rich team cards.
 */
export interface TeamFilters {
  searchTerm?: string | null;
  // p_page_limit and p_page_offset could be added here if the RPC supported them
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * @description Represents a team card on explore pages (e.g., from `get_filtered_teams_rich` RPC).
 * This is already defined as `ExploreTeamCard` in `explore/index.ts`.
 */
export type RichTeamCardData = Tables<'teams'> & {
    members_count: number;
    plans_count: number;
};


/**
 * @description Payload for the `invite_member_to_team` RPC.
 */
export interface InviteMemberToTeamPayload {
  teamId: string;
  role: TeamMemberRole;
  email?: string | null;
  userId?: string | null;
}

/**
 * @description Response from the `invite_member_to_team` RPC.
 * The RPC returns `jsonb_build_object('id', v_new_invitation_id)`.
 */
export interface InviteMemberToTeamResponse {
  id: string; // The ID of the newly created team_invitations record
}

/**
 * @description Payload for responding to a team invitation.
 */
export interface RespondToInvitationPayload {
  invitationId: string;
  accept: boolean;
}
export interface TeamAggregatedMetrics {
  total_forks_across_team_plans: number;
  total_likes_across_team_plans: number;
  total_active_users_on_team_plans: number;
  total_completed_sessions_on_team_plans: number;
}

/**
 * @description Represents the core `Team` table data extended with aggregated metrics.
 */
export type TeamWithAggregatedMetrics = Team & TeamAggregatedMetrics;


/**
 * @description Represents a summarized plan suitable for display within a team's details.
 * This structure comes from the `plans` array within `get_team_details_and_members` RPC.
 */
export interface TeamPlanSummary extends Plan { // Extends base Plan table type
  creator: Profile; // --- NEW: Creator's full profile embedded ---
  total_exercises_count: number | null;
  muscle_activation_summary: ExerciseMuscleWithEngagement[] | null;
  goals: PlanGoal[];
  tags: Tag[];
  current_user_plan_status: UserPlanStatus | null;
  plan_active_users_count: number | null;
}


/**
 * @description Represents the full details of a team, including its members and associated plans.
 * Corresponds to the return type of `get_team_details_and_members` RPC.
 */
export interface TeamDetails {
  team: TeamWithAggregatedMetrics;
  members: TeamMemberWithProfile[];
  plans: TeamPlanSummary[];
  current_user_role: TeamMemberRole | null;
}

export interface RecentTeamMemberActivity {
  user_id: string;
  username: string;
  full_name: string | null;
  profile_image_url: string | null;
  date: string; // The date of the session log
  status: string; // The status of the session log (e.g., 'completed')
}

export interface TeamManagementPlanSummary extends Plan {
  creator: Profile; // Full creator profile
  total_exercises_count: number | null;
  muscle_activation_summary: ExerciseMuscleWithEngagement[] | null;
  goals: PlanGoal[]; // Basic goal details
  tags: Tag[]; // Aggregated unique tags
  my_status_on_plan: UserPlanStatus | null; // Current authenticated user's status on THIS plan
  team_active_users_count: number | null; // Number of unique ACTIVE team members on THIS plan
  team_completed_users_count: number | null; // Number of unique team members who have COMPLETED THIS plan
  recent_team_member_activity: RecentTeamMemberActivity[]; // Recent completed sessions by team members
}

/**
 * @description Defines filters for fetching team management plans.
 */
export interface TeamManagementPlanFilters {
  searchTerm?: string | null;
  // Add other filters as needed, e.g., difficulty, tags, etc.
  pageLimit?: number;
  pageOffset?: number;
}
