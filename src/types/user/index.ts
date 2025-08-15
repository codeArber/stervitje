// src/types/user/index.ts

import { Enums, Tables } from "../database.types";


// Re-exporting base types for convenience
export type Plan = Tables<'plans'>;
export type Team = Tables<'teams'>;
export type TeamMemberRole = Enums<'team_member_role'>;

export type Profile = Tables<'profiles'>;

// --- Relationship Types ---
// This represents the structure of the 'teams' object within our RPC response
export type UserTeamWithRelations = {
  team: Team;
  role: TeamMemberRole;
};

// This represents the structure of the 'active_plan' object within our RPC response
export type UserActivePlan = {
  plan_details: Plan;
  current_position: {
    week: number;
    day: number;
  };
};

// --- RPC Response Type ---
// This is the main type for the entire JSON object returned by the get_user_profile_details function.
// It combines all the pieces into one comprehensive type.
export type UserProfileDetails = {
  profile: Profile;
  teams: UserTeamWithRelations[] | null;
  active_plan: UserActivePlan | null;
};


export type DiscoverableUser = Profile & {
  roles: TeamMemberRole[] | null;
};

export type UserPlanHistoryItem = Plan & {
  first_logged_date: string;
  last_logged_date: string;
};