// FILE: src/types/index.ts
// This file exports the most common, raw table types and enums for easy access across the app.
// It should NOT contain complex, nested, or feature-specific relationship types,
// except for high-level composites like ActiveWorkoutStatePayload.

import type { Tables, Enums, CompositeTypes } from './database.types';
import type { PlanSession, LoggedExercise, FullPlan } from './plan';

// --- Base Table Row Types ---
export type Profile = Tables<'profiles'>;
export type Plan = Tables<'plans'>;
export type Team = Tables<'teams'>;
export type Exercise = Tables<'exercises'>;
export type Tag = Tables<'tags'>;
export type ExerciseReference = Tables<'exercise_reference_global'>;
export type SessionLog = Tables<'session_logs'>;
export type SetLog = Tables<'set_logs'>;
export type PlanSessionExercise = Tables<'plan_session_exercises'>;
export type PlanSessionExerciseSet = Tables<'plan_session_exercise_sets'>;
export type UserPlanStatus = Tables<'user_plan_status'>;
export type UserMeasurement = Tables<'user_measurements'>;

// --- Base ENUM Types (Re-exporting for convenience) ---
export type TeamMemberRole = Enums<'team_member_role'>;
export type MuscleGroup = Enums<'muscle_group_enum'>;
export type EngagementLevel = Enums<'engagement_level'>;
export type GoalMetric = Enums<'goal_metric'>;
export type GoalDirection = Enums<'goal_direction'>;
export type GoalTargetType = Enums<'goal_target_type'>;
export type GoalStatus = Enums<'goal_status'>;
export type WorkoutStatus = Enums<'workout_status_enum'>;
export type SetType = Enums<'set_type'>;
export type InvitationStatus = Enums<'invitation_status'>;
export type MeasureUnit = Enums<'measure_unit'>;

// --- Common Composite/View Types ---
export type PlanAnalyticsSummary = Tables<'plan_analytics_summary'>;
export type CoachAnalyticsSummary = Tables<'coach_analytics_summary'>;
export type UserPlanPerformanceSummary = Tables<'user_plan_performance_summary'>;

// --- Composite Types from Database.types (if needed) ---
export type UserBaselineComposite = CompositeTypes<'user_baseline'>;

/**
 * @description Represents the full state of a user's active workout session,
 * whether it's planned or ad-hoc.
 * Corresponds to the return type of `get_active_user_workout_state` RPC.
 */
export interface ActiveWorkoutStatePayload {
  activeSessionLog: SessionLog;
  plannedSession: PlanSession | null;
  loggedExercises: LoggedExercise[];
}