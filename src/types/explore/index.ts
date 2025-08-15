// src/types/explore/index.ts
import type { Plan, Team, Profile } from '@/types/index'; // Correct: Imports the clean base types
import type { TeamMemberRole } from '@/types/team/index'; // Correct: Imports the specific role type

// ... the rest of the file is correct ...
export type DiscoverablePlan = Plan;
export type DiscoverableTeam = Team;

export type DiscoverableUser = Profile & {
  roles: TeamMemberRole[] | null;
};