import type { PlanAnalyticsSummary, CoachAnalyticsSummary } from "../analytics";
import { ExerciseMuscleWithEngagement } from "../exercise";
import type { Plan, Profile, Team } from "../index"; // Ensure Profile is imported from correct path

// This is the data structure for one plan card on the Explore Plans page
export type RichPlanCardData = Plan & {
  analytics: PlanAnalyticsSummary | null;
  creator: Profile;
};

// This is the data structure for one team card on the Explore Teams page
// (For now, we can build it from existing types, but can add analytics later)
export type RichTeamCardData = Team & {
  members_count: number;
  plans_count: number;
  // We can add team-level analytics here in the future
};

// This is the data structure for one user/coach card on the Explore Users page
// REMOVED: specializations as it's not returned by get_filtered_users_rich RPC
export type RichUserCardData = Profile & {
  analytics: CoachAnalyticsSummary | null;
  // specializations: string[] | null; // REMOVED
};


/**
 * @description Data structure for a single plan card on the Explore Plans page.
 * Corresponds to items returned by `get_filtered_plans_rich` RPC.
 */
export type ExplorePlanCard = Plan & {
  analytics: PlanAnalyticsSummary | null;
  creator: Profile;
  total_exercises_count: number | null;
  muscle_activation_summary: ExerciseMuscleWithEngagement[] | null;
  goals: PlanGoal[] | null;
};