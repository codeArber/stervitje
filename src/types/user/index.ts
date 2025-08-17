import type { Enums, Tables } from "../database.types";
import type { FullPlan } from "../plan";
import type { CoachAnalyticsSummary } from "../analytics";

export type Plan = Tables<'plans'>;
export type Team = Tables<'teams'>;
export type TeamMemberRole = Enums<'team_member_role'>;
export type Profile = Tables<'profiles'>;

export type UserTeamWithRelations = {
  team: Team;
  role: TeamMemberRole;
};

export type UserProfileDetails = {
  profile: Profile;
  teams: UserTeamWithRelations[] | null;
  active_plan_details: FullPlan | null;
};

// NEW: For the Explore page user/coach cards
export type RichUserCardData = Profile & {
    analytics: CoachAnalyticsSummary | null;
    // specializations: string[] | null; // REMOVED
};

export type UserPlanHistoryItem = Plan & {
  first_logged_date: string;
  last_logged_date: string;
};