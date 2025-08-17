// FILE: /src/types/plan/index.ts

import type { Enums, Tables, TablesInsert } from "../database.types";
import type { Exercise, Tag } from "../exercise";
import type { Profile } from "../user";
import type { PlanAnalyticsSummary } from "../analytics";

// --- Base Types ---
export type Plan = Tables<'plans'>;
export type PlanGoal = Tables<'plan_goals'>;
export type UserPlanStatus = Tables<'user_plan_status'>;

// --- Hierarchy Types ---
export type PlanSet = Tables<'plan_session_exercise_sets'> & {
    intent: Enums<'exercise_physical_intent'> | null;
};
export type PlanExercise = Tables<'plan_session_exercises'> & {
  exercise_details: Exercise;
  sets: PlanSet[];
};
export type PlanSession = Tables<'plan_sessions'> & {
  is_completed_by_user: boolean;
  exercises: PlanExercise[];
};
export type PlanDay = Tables<'plan_days'> & {
  sessions: PlanSession[];
};
export type PlanWeek = Tables<'plan_weeks'> & {
  days: PlanDay[];
};
export type PlanHierarchy = {
  weeks: PlanWeek[];
};

// --- RPC Response Types ---
export type FullPlan = {
  plan: Plan;
  creator: Profile;
  team: Tables<'teams'> | null;
  goals: PlanGoal[] | null;
  can_edit: boolean;
  required_equipment: Tag[] | null;
  user_plan_status: UserPlanStatus | null;
  hierarchy: PlanHierarchy;
};
export type UserPlanPerformance = Tables<'user_plan_performance_summary'>;
export type PlanPerformanceEntry = {
    profile: Profile;
    performance: UserPlanPerformance;
};
export type RichPlanCardData = Plan & {
  analytics: PlanAnalyticsSummary | null;
  creator: Profile;
};

// --- Mutation Payload Types ---
export type LoggedSet = Omit<TablesInsert<'set_logs'>, 'id' | 'session_exercise_log_id' | 'created_at'>;
export type LoggedExercise = {
  plan_session_exercise_id: string | null;
  exercise_id: string;
  notes?: string;
  sets: LoggedSet[];
};
export type LogWorkoutPayload = {
  session_log_id: string;
  performed_exercises: LoggedExercise[];
  duration_minutes: number;
  overall_feeling: number;
  notes: string;
};