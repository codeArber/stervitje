// src/types/dashboard/index.ts

import type { Plan, Team } from '@/types/index';
import type { FullPlan } from '@/types/plan';
import type { TeamMemberRole } from '@/types/team';

// Type for a single team in the "My Teams" list
export type MyTeam = Team & {
  role: TeamMemberRole;
};

// This is the main type for the entire JSON object returned by the refactored RPC function.
export type DashboardSummary = {
  active_plan_details: FullPlan | null;
  my_teams: MyTeam[] | null;
  my_created_plans: Plan[] | null;
  pending_invitations_count: number;
  current_workspace_id: string | null; // <--- NEW FIELD
};