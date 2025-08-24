import { Enums } from "../database.types";
import { Plan, PlanGoal } from "../plan";

export interface PlanPerformanceSummary {
  total_sessions_in_plan: number;
  logged_sessions_count: number;
  total_volume_kg: number | null;
  first_workout_date: string | null;
  last_workout_date: string | null;
}

/**
 * @description This is the type for a single item in the array returned by the
 * `get_user_plan_performance_summary_list` RPC.
 */
export interface UserPlanPerformanceData {
  plan_details: Pick<Plan, 'id' | 'title' | 'description' | 'difficulty_level'>;
  performance_summary: PlanPerformanceSummary;
  user_plan_status_id: string;
  user_status_on_plan: Enums<'plan_status'>;
}

/**
 * @description Represents a single entry in a user's logbook.
 * Corresponds to items returned by `get_user_logbook` RPC.
 */
export interface LogbookEntry {
  log_id: string;
  workout_date: string;
  session_title: string | null;
  plan_title: string | null;
  duration_minutes: number | null;
  overall_feeling: number | null;
  plan_id: string | null;
}

/**
 * @description Represents a user's progress on a specific plan goal within `PlanPerformanceDetails`.
 * Corresponds to the `goal_progress` array items returned by `get_user_plan_performance_details` RPC.
 */
export interface GoalProgressData {
    progress_id: string; // This is the ID from the user_plan_goal_progress table
    start_value: number | null;
    current_value: number | null;
    target_value: number | null; // This is the personalized target
    status: Enums<'goal_status'>;
    achieved_at: string | null;
    goal_definition: PlanGoal; // The original goal definition from the plan_goals table
}

/**
 * @description Represents the detailed performance of a user on a plan, including goal progress.
 * Corresponds to the return type of `get_user_plan_performance_details` RPC.
 */
export interface PlanPerformanceDetails {
    plan: Plan;
    goal_progress: GoalProgressData[]; // `jsonb_agg` returns [] if empty, not null
}

/**
 * @description Represents a single date on which a user logged a workout.
 * Corresponds to items returned by `get_user_workout_dates` RPC.
 */
export type UserWorkoutDate = string;