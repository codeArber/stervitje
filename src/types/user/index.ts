import type {
  Profile as BaseProfile,
  Team as BaseTeam,
  Plan as BasePlan,
  TeamMemberRole,
  CoachAnalyticsSummary,
} from "../index";
import type { TeamDetails } from "../team"; // For full team details (if needed)
import type { PlanPerformanceDetails, PlanGoal, FullPlan } from "../plan"; // For plan history details
import { Enums } from "../database.types";

// Re-exporting base types for convenience if this file is the primary entry for user-related types
export type Profile = BaseProfile;
export type Plan = BasePlan;
export type Team = BaseTeam;

/**
 * @description Represents a user's team membership with the team details and their role.
 * Corresponds to items in `UserProfileDetails.teams` and `DashboardSummary.my_teams`.
 */
export type UserProfileTeam = {
  team: Team;
  role: TeamMemberRole;
};

/**
 * @description Represents the full profile details for a user, including their teams and active plan.
 * Corresponds to the return type of `get_user_profile_details` RPC.
 */
export type UserProfileDetails = {
  profile: Profile;
  teams: UserProfileTeam[]; // `jsonb_agg` returns `[]` if empty, not `null`
  active_plan_details: FullPlan | null; // `get_plan_details_for_user` can return `null`
};

/**
 * @description Represents a user/coach card for explore pages, including analytics.
 * Corresponds to items returned by `get_filtered_users_rich` RPC.
 */
export type RichUserCardData = Profile & {
    analytics: CoachAnalyticsSummary | null;
};

/**
 * @description Represents a plan from a user's history, with first and last logged dates.
 * Corresponds to items returned by `get_my_plan_history` and `get_user_plan_history` RPCs.
 */
export type UserPlanHistoryItem = Plan & {
  first_logged_date: string | null; // MIN/MAX can return null if no logs exist
  last_logged_date: string | null; // MIN/MAX can return null if no logs exist
};

/**
 * @description Represents a discoverable user with their roles across public teams.
 * Corresponds to items returned by `get_discoverable_users` RPC.
 */
export type DiscoverableUser = Profile & {
  roles: TeamMemberRole[]; // `jsonb_agg` returns `[]` if empty, not `null`
};

/**
 * @description Defines the filters (arguments) for the `get_discoverable_users` RPC.
 */
export interface DiscoverableUserFilters {
  searchTerm?: string | null;
  roleFilter?: string | null;
  excludeTeamId?: string | null;
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * @description Filters for fetching rich user cards. Currently only supports searchTerm.
 */
export interface RichUserCardFilters {
  searchTerm?: string | null;
  // pageLimit and pageOffset are not explicitly handled by `get_filtered_users_rich`
  // as defined in database.types.ts, but can be added if the RPC is updated.
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * @description Represents the payload for updating a user's profile.
 * Corresponds to the arguments of the `update_user_profile` RPC.
 */
export interface UserProfileUpdatePayload {
  p_full_name: string | null; // Assuming these can be null or empty string
  p_username: string;
  p_bio: string | null;
  p_unit: Enums<'measure_unit'>;
}

/**
 * @description Represents a single date on which a user had a completed workout.
 * Corresponds to items returned by `get_user_workout_dates` RPC.
 */
export type UserWorkoutDate = string;

export interface UserProfileUpdatePayload {
  p_full_name: string | null;
  p_username: string; // The RPC mandates a username, and it's unique
  p_bio: string | null;
  p_unit: Enums<'measure_unit'>;
}