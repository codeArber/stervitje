// FILE: src/types/plan/index.ts

import type { Tables, TablesInsert, Enums } from '@/types/database.types';
import type { Profile, Team, Exercise } from '@/types/index';

// --- Base Types ---
export type Plan = Tables<'plans'>;
export type NewPlan = TablesInsert<'plans'>;
export type UserPlanStatus = Tables<'user_plan_status'>;

// --- Hierarchy Types (for the nested plan structure) ---
export type PlanSetInHierarchy = Tables<'plan_session_exercise_sets'>;

export type PlanExerciseInHierarchy = Tables<'plan_session_exercises'> & {
  exercise_details: Exercise;
  sets: PlanSetInHierarchy[] | null;
};

export type PlanSessionInHierarchy = Tables<'plan_sessions'> & {
  exercises: PlanExerciseInHierarchy[] | null;
};

export type PlanDayInHierarchy = Tables<'plan_days'> & {
  sessions: PlanSessionInHierarchy[] | null;
};

export type PlanWeekInHierarchy = Tables<'plan_weeks'> & {
  days: PlanDayInHierarchy[] | null;
};

export type PlanHierarchy = {
  weeks: PlanWeekInHierarchy[] | null;
};


// --- Performance Stats Types ---
export type PlanPerformanceStat = {
  user_profile: Profile;
  last_completed_date: string;
  unique_workouts_logged: number;
  total_workouts_planned: number;
  completion_percentage: number;
  adherence_percentage: number;
};


// --- Main RPC Response Type ---
// This is the complete shape of the data returned by get_plan_details
export type PlanDetails = {
  plan: Plan;
  creator: Profile;
  team: Team | null;
  hierarchy: PlanHierarchy;
  performance_stats: PlanPerformanceStat[] | null;
};

export type PlanWithStats = Plan & {
  duration_weeks: number;
  active_users_count: number;
  finished_users_count: number;
};


// Payload to add a new session to a day
// We take the Insert type and make the auto-generated fields optional.
export type AddSessionPayload = Omit<TablesInsert<'plan_sessions'>, 'id' | 'created_at' | 'updated_at'>;

// Payload to add a new exercise to a session
export type AddExercisePayload = Omit<TablesInsert<'plan_session_exercises'>, 'id' | 'created_at' | 'updated_at'>;

// Payload to add a new set to an exercise
export type AddSetPayload = Omit<TablesInsert<'plan_session_exercise_sets'>, 'id' | 'created_at' | 'updated_at'>;


// --- Types for UPDATE operations ---
// For updates, we often need the ID and a subset of the fields.
// The `Partial` utility makes all fields optional, which is perfect for updates.

// Payload to update an existing session
export type UpdateSessionPayload = { session_id: string } & Partial<Omit<Tables<'plan_sessions'>, 'id' | 'plan_day_id' | 'created_at' | 'updated_at'>>;

// Payload to update an existing exercise in a session
export type UpdateExercisePayload = { plan_session_exercise_id: string } & Partial<Omit<Tables<'plan_session_exercises'>, 'id' | 'plan_session_id' | 'exercise_id' | 'created_at' | 'updated_at'>>;

// Payload to update an existing set
export type UpdateSetPayload = { set_id: string } & Partial<Omit<Tables<'plan_session_exercise_sets'>, 'id' | 'plan_session_exercise_id' | 'created_at' | 'updated_at'>>;