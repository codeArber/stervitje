// FILE: /src/types/plan/index.ts

import type {  Tag,
  Profile, PlanAnalyticsSummary,
  UserPlanStatus, SessionLog, SetType,
} from "../index"; // Use centralized base types
import { Tables, TablesInsert } from "../database.types";
import { PlanGoal } from "./planGoals";
import { PlanWeek } from "./planWeeks";
import { PlanDay } from "./PlanDays";
import { PlanSession } from "./planSessions";
import { PlanExercise } from "./planSessionExercises";
import { PlanSet } from "./planSessionExerciseSets";
import { Exercise, ExerciseMuscleWithEngagement } from "../exercise";

// Re-export core base types for convenience within the plan module
export type Plan = Tables<'plans'>;
export type { PlanGoal }; // Re-export PlanGoal from its dedicated file
export type { UserPlanStatus }; // Re-export UserPlanStatus from index.ts
export type { PlanWeek }; // Re-export PlanWeek from its dedicated file
export type { PlanDay }; // Re-export PlanDay from its dedicated file
export type { PlanSession }; // Re-export PlanSession from its dedicated file
export type { PlanExercise }; // Re-export PlanExercise from its dedicated file
export type { PlanSet }; // Re-export PlanSet from its dedicated file


// --- Core Hierarchy & Full Plan Types ---

/**
 * @description Represents the full hierarchical structure of a plan (weeks, days, sessions, exercises, sets).
 * Corresponds to the `hierarchy` property within `FullPlan`.
 */
export type PlanHierarchy = {
  weeks: PlanWeek[]; // `jsonb_agg` returns [] if empty, not null
};

/**
 * @description Represents a comprehensive view of a plan, including its creator, team, goals,
 * edit permissions, required equipment, user's status, and full hierarchical structure.
 * Corresponds to the return type of `get_plan_details_for_user` RPC.
 */
export type FullPlan = {
  plan: Tables<'plans'>;
  creator: Profile;
  team: Tables<'teams'> | null;
  goals: PlanGoal[]; // `COALESCE` in RPC makes this an empty array if no goals, not null
  can_edit: boolean;
  required_equipment: Tag[]; // `COALESCE` in RPC makes this an empty array
  user_plan_status: UserPlanStatus | null;
  hierarchy: PlanHierarchy;
  muscle_activation_summary: ExerciseMuscleWithEngagement[]; // `COALESCE` in RPC makes this an empty array
};

/**
 * @description Filters for fetching rich plan cards and other plan lists.
 */
export interface PlanFilters {
  searchTerm?: string | null;
  tagIds?: number[] | null;
  difficultyLevel?: number | null;
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * @description Represents a plan with rich filtering and summary data.
 * Corresponds to items returned by `get_filtered_plans_rich` RPC.
 * This combines data from `plans`, `plan_analytics_summary`, and `plan_content_summary`.
 */

export interface FilteredPlanRich extends Tables<'plans'> {
  analytics: PlanAnalyticsSummary | null;
  creator: Profile; // Assuming this is Profile from index.ts
  total_exercises_count: number | null;
  muscle_activation_summary: ExerciseMuscleWithEngagement[] | null;
  goals: PlanGoal[] | null;
  // --- NEW: Tags property ---
  tags: Tag[]; // Aggregated unique tags from exercises within the plan
}

/**
 * @description Payload for `create_basic_plan` RPC.
 */
export interface CreateBasicPlanPayload {
  p_title: string;
  p_description?: string | null;
  p_difficulty_level?: number | null;
  p_private?: boolean | null;
  p_team_id?: string | null;
}

// --- Mutation Payload Types for Logging Workouts ---

/**
 * @description Represents a performed set to be logged.
 * Used in `LoggedExercise`.
 */
export type LoggedSet = Omit<TablesInsert<'set_logs'>, 'id' | 'session_exercise_log_id' | 'created_at'> & {
  _tempId?: string; // Add temporary ID for client-side list keys
  // Specific fields for logging might include:
  // reps_performed?: number | null;
  // weight_used?: number | null;
  // duration_seconds?: number | null;
  // distance_meters?: number | null;
  // notes?: string | null;
  // performance_metadata?: object | null;
  // set_number: number;
  // set_type?: SetType;
};

/**
 * @description Represents an exercise that was performed and logged in a session.
 * Used in `LogWorkoutPayload` and `ActiveWorkoutStatePayload` (for ad-hoc sessions).
 * Extends `session_exercise_logs` and adds nested `exercise_details` and `sets`.
 */
export type LoggedExercise = Tables<'session_exercise_logs'> & {
  _tempId?: string; // For client-side management
  exercise_details: Exercise; // Full exercise details are included in RPC output
  sets: LoggedSet[]; // `json_agg` returns [] if empty, not null
};

/**
 * @description Payload for the `log_workout` RPC.
 */
export type LogWorkoutPayload = {
  session_log_id: string;
  performed_exercises: LoggedExercise[];
  duration_minutes: number;
  overall_feeling: number;
  notes: string;
};

// --- Plan Performance Related Types ---

/**
 * @description Represents a user's performance entry for a plan.
 * Corresponds to items returned by `get_plan_user_performance_list` RPC.
 */
export type PlanPerformanceEntry = {
    profile: Profile;
    performance: Tables<'user_plan_performance_summary'>; // Direct use of Tables view type
};

/**
 * @description Represents a user's submitted baseline for a goal.
 * Corresponds to CompositeTypes<'user_baseline'>.
 */
export type UserBaseline = {
  goal_id: string;
  baseline_value: number;
};

// --- Plan Mutation Change Sets ---

// Re-export the PlanChangeset type from utils (assuming it's a shared structure)