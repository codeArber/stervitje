// FILE: /src/types/plan/planSessionExercises.ts

import { Tables } from "../database.types";
import type {  Exercise } from "../index"; // Use centralized base types
import type { PlanSet } from "./planSessionExerciseSets"; // Import from new file

/**
 * @description Represents a single exercise within a planned session.
 * It includes the full details of the base exercise (name, image_url, etc.)
 * and an array of all its prescribed sets.
 * Corresponds to the `plan_session_exercises` table, extended with `exercise_details` and `sets`.
 */
export interface PlanExercise extends Tables<'plan_session_exercises'> {
  exercise_details: Exercise; // The full details of the exercise
  sets: PlanSet[]; // An array of all prescribed sets for this exercise (`json_agg` returns [])
}

/**
 * @description Payload for `add_plan_session_exercise` RPC.
 */
export interface AddPlanSessionExercisePayload {
  p_plan_session_id: string;
  p_exercise_id: string;
  p_order_within_session: number;
  p_notes?: string | null;
  p_execution_group?: number | null;
  p_post_exercise_rest_seconds?: number | null;
  p_post_group_rest_seconds?: number | null;
}

/**
 * @description Payload for `update_plan_session_exercise` RPC.
 */
export interface UpdatePlanSessionExercisePayload {
  p_plan_session_exercise_id: string;
  p_exercise_id?: string; // Allow changing exercise, or make non-editable based on UI
  p_order_within_session?: number;
  p_notes?: string | null;
  p_execution_group?: number | null;
  p_post_exercise_rest_seconds?: number | null;
  p_post_group_rest_seconds?: number | null;
}

/**
 * @description Payload for `delete_plan_session_exercise` RPC.
 */
export interface DeletePlanSessionExercisePayload {
  p_plan_session_exercise_id: string;
}