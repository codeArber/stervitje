// src/types/team/index.ts

import { Plan } from "..";
import { Enums, Tables } from "../database.types";

// Re-exporting base types for convenience
export type Team = Tables<'teams'>;
export type Profile = Tables<'profiles'>;
export type TeamMemberRole = Enums<'team_member_role'>;

export type KeyMember = {
  profile: Profile;
  role: TeamMemberRole;
};


// --- Relationship Types ---
// This represents a single member object within the 'members' array of our RPC response
export type TeamMemberWithProfile = {
  profile: Profile;
  role: TeamMemberRole;
};

// --- RPC Response Type ---
// This is the main type for the entire JSON object returned by the get_team_details_and_members function.
export type TeamDetails = {
  team: Tables<'teams'>;
  members: TeamMemberWithProfile[] | null;
  plans: Plan[] | null; // The new addition!
};

export type DiscoverableTeamRichDetails = Team & {
  members_count: number;
  plans_count: number;
  key_members: KeyMember[] | null;
  member_names_preview: string[] | null;
};