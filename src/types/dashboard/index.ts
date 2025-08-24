// src/types/dashboard/index.ts

import type { Plan, Team, TeamMemberRole, Profile } from '@/types/index';
import type { FullPlan } from '@/types/plan';

/**
 * @description Represents a team with the current user's role in it, for dashboard display.
 * Now includes member and plan counts, and a flag indicating if the user has an active plan
 * associated with this specific team.
 * Corresponds to items in `DashboardSummary.my_teams` from `get_user_dashboard_summary` RPC.
 */
export type DashboardMyTeam = Team & {
  role: TeamMemberRole;
  members_count: number;
  plans_count: number;
  has_active_plan_for_user: boolean; // NEW: Flag for active plan associated with this team
};

/**
 * @description The main type for the entire JSON object returned by the `get_user_dashboard_summary` RPC function.
 */
export type DashboardSummary = {
  active_plan_details: FullPlan | null;
  my_teams: DashboardMyTeam[];
  my_created_plans: Plan[];
  pending_invitations_count: number;
  current_workspace_id: string | null;
};