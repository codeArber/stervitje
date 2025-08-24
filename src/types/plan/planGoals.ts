// FILE: /src/types/plan/planGoals.ts

import { Enums, Tables } from "../database.types";
import type {  Exercise } from "../index"; // Use centralized base types
import type { Plan } from "./index"; // Import Plan from core plan types

/**
 * @description Represents a plan goal with optional exercise details.
 * Corresponds to the `plan_goals` table, enriched with `exercise_details` by RPCs like `get_goals_for_plan`.
 */
export type PlanGoal = Tables<'plan_goals'> & {
  // --- FIX: Use the full 'Exercise' type (Tables<'exercises'>) here ---
  exercise_details?: Exercise | null;
};

/**
 * @description Represents a plan goal with exercise details.
 * Alias for `PlanGoal` for consistency with some RPCs.
 */
export type PlanGoalWithExerciseDetails = PlanGoal;


/**
 * @description Payload for `add_plan_goal` and `update_plan_goal` RPCs.
 */
export interface PlanGoalPayload {
  title: string;
  description: string | null;
  metric: Enums<'goal_metric'>;
  direction: Enums<'goal_direction'>;
  target_type: Enums<'goal_target_type'>;
  target_value: number;
  exercise_id?: string | null;
}

/**
 * @description Represents a goal for which the user needs to set a baseline.
 * Corresponds to items returned by `get_pending_baselines_for_session` RPC.
 */
export interface PendingBaselineGoal {
    progress_id: string;
    goal_title: string;
    metric: Enums<'goal_metric'>;
    exercise_name: string | null;
}