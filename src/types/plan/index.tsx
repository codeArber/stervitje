// FILE: /src/types/plan/index.ts

import type { Enums, Tables, TablesInsert } from "../database.types";
import type { Exercise, Tag } from "../exercise";
import type { Profile } from "../user";
import type { PlanAnalyticsSummary } from "../analytics";

// --- Base Types ---
export type Plan = Tables<'plans'>;
export type PlanGoal = Tables<'plan_goals'> & {
  exercise_details?: Pick<Exercise, 'id' | 'name'> | null; // Add this line
};
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

export type PlanSessionStore = Tables<'plan_sessions'> & {
  is_completed_by_user: boolean; // This might be a computed value
  exercises: (PlanExercise & {
    exercise_details: Pick<Tables<'exercises'>, 'id' | 'name' | 'image_url'>; // Use a more specific type for details
    sets: PlanSet[] | null; // Ensure sets can be null
  })[] | null; // Ensure exercises array can be null
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
export type LoggedSet = Omit<TablesInsert<'set_logs'>, 'id' | 'session_exercise_log_id' | 'created_at'>& {
  _tempId?: string; // Add temporary ID for client-side list keys
};


export type LoggedExercise = {
  _tempId?: string; // Add temporary ID for client-side list keys
  plan_session_exercise_id: string | null;
  exercise_id: string;
  exercise_details?: Exercise; // Add exercise details for easier UI rendering
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

export interface AddPlanWeekPayload {
  p_plan_id: string;
  p_week_number: number;
  p_description?: string | null;
}

export interface UpdatePlanWeekPayload {
  p_week_id: string;
  p_week_number: number;
  p_description?: string | null;
}

export interface DeletePlanWeekPayload {
  p_week_id: string;
}

export interface AddPlanDayPayload {
  p_plan_week_id: string;
  p_day_number: number;
  p_title?: string | null;
  p_description?: string | null;
  p_is_rest_day?: boolean | null;
}
export interface AddPlanSessionPayload {
  p_plan_day_id: string;
  p_order_index: number;
  p_title?: string | null;
  p_notes?: string | null;
}

export interface UpdatePlanSessionPayload { // <--- NEW
  p_session_id: string;
  p_order_index: number;
  p_title?: string | null;
  p_notes?: string | null;
}

export interface DeletePlanSessionPayload { // <--- NEW
  p_session_id: string;
}

export interface UpdatePlanDayPayload { // <--- ADD THIS
  p_day_id: string;
  p_day_number: number;
  p_title?: string | null;
  p_description?: string | null;
  p_is_rest_day?: boolean | null;
}

export interface DeletePlanDayPayload { // <--- ADD THIS
  p_day_id: string;
}


export interface AddPlanSessionExercisePayload {
  p_plan_session_id: string;
  p_exercise_id: string;
  p_order_within_session: number;
  p_notes?: string | null;
  p_execution_group?: number | null;
  p_post_exercise_rest_seconds?: number | null;
  p_post_group_rest_seconds?: number | null;
}

export interface DeletePlanSessionExercisePayload {
  p_plan_session_exercise_id: string;
}

// --- NEW: Plan Session Exercise Set Mutation Payloads ---
export interface AddPlanSessionExerciseSetPayload {
  p_plan_session_exercise_id: string;
  p_set_number: number;
  p_target_reps?: number | null;
  p_target_weight?: number | null;
  p_target_duration_seconds?: number | null;
  p_target_distance_meters?: number | null;
  p_target_rest_seconds?: number | null;
  p_notes?: string | null;
  p_set_type?: Tables<'plan_session_exercise_sets'>['set_type']; // Use DB type for enum
  p_metadata?: object | null; // jsonb
}

export interface UpdatePlanSessionExerciseSetPayload {
  p_set_id: string;
  p_set_number: number;
  p_target_reps?: number | null;
  p_target_weight?: number | null;
  p_target_duration_seconds?: number | null;
  p_target_distance_meters?: number | null;
  p_target_rest_seconds?: number | null;
  p_notes?: string | null;
  p_set_type?: Tables<'plan_session_exercise_sets'>['set_type'];
  p_metadata?: object | null;
}


export interface DeletePlanSessionExerciseSetPayload {
  p_set_id: string;
}

export interface UpdatePlanSessionExercisePayload {
  p_plan_session_exercise_id: string;
  p_exercise_id: string; // Allow changing exercise, or make non-editable based on UI
  p_order_within_session: number;
  p_notes?: string | null;
  p_execution_group?: number | null;
  p_post_exercise_rest_seconds?: number | null;
  p_post_group_rest_seconds?: number | null;
}

export interface GoalProgressData {
    progress_id: string; // This is the ID from the user_plan_goal_progress table
    start_value: number | null;
    current_value: number | null;
    target_value: number | null; // This is the personalized target
    status: Enums<'goal_status'>;
    // This object contains the original goal definition from the plan_goals table
    goal_definition: PlanGoal; 
}

export interface PlanPerformanceDetails {
    plan: Plan;
    goal_progress: GoalProgressData[] | null;
    // We can add the list of logged workouts here later
}