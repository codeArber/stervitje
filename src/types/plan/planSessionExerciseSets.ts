// FILE: /src/types/plan/planSessionExerciseSets.ts

import { Enums, Tables } from "../database.types";


/**
 * @description Represents a single set within a planned exercise.
 * Corresponds to the `plan_session_exercise_sets` table.
 */
export type PlanSet = Tables<'plan_session_exercise_sets'>;

/**
 * @description Payload for `add_exercise_set` RPC.
 */
export interface AddPlanSessionExerciseSetPayload {
  p_plan_session_exercise_id: string;
  p_set_number: number;
  p_target_reps?: number | null;
  p_target_weight?: number | null;
  p_target_duration_seconds?: number | null;
  p_target_distance_meters?: number | null;
  p_target_rest_seconds?: number | null;
  p_notes?: string | null;
  p_set_type?: Enums<'set_type'>; // Use centralized enum type
  p_metadata?: object | null; // jsonb
}

/**
 * @description Payload for `update_plan_session_exercise_set` RPC.
 */
export interface UpdatePlanSessionExerciseSetPayload {
  p_set_id: string;
  p_set_number?: number;
  p_target_reps?: number | null;
  p_target_weight?: number | null;
  p_target_duration_seconds?: number | null;
  p_target_distance_meters?: number | null;
  p_target_rest_seconds?: number | null;
  p_notes?: string | null;
  p_set_type?: Enums<'set_type'>;
  p_metadata?: object | null;
}

/**
 * @description Payload for `delete_plan_session_exercise_set` RPC.
 */
export interface DeletePlanSessionExerciseSetPayload {
  p_set_id: string;
}