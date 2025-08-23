// src/types/team/index.ts

import type { Plan } from "..";
import type { Enums, Tables, TablesInsert } from "../database.types";
import { RichPlanCardData } from "../explore";

export type Team = Tables<'teams'>;
export type Profile = Tables<'profiles'>;
export type TeamMemberRole = Enums<'team_member_role'>;
export type TeamInvitation = Tables<'team_invitations'>;
export type NewTeam = TablesInsert<'teams'>;

export type TeamInvitationWithRelations = TeamInvitation & {
  teams: Team;
  profiles: Profile;
};

export type TeamMemberWithProfile = {
  profile: Profile;
  role: TeamMemberRole;
};


// NEW: For the Explore page team cards
export type RichTeamCardData = Team & {
    members_count: number;
    plans_count: number;
};

export interface GetTeamDetailsAndMembersResponse {
  team: Tables<'teams'>;
  members: Array<{
    profile: Tables<'profiles'>;
    role: Enums<'team_member_role'>;
  }> | null; // Can be null if no members
  current_user_role: Enums<'team_member_role'> | null; // Can be null if not a member
}

export type TeamDetails = {
  team: Tables<'teams'>;
  members: TeamMemberWithProfile[] | null;
  plans: RichPlanCardData[] | null;
  
  current_user_role: TeamMemberRole | null; // <-- ADD THIS LINE
};