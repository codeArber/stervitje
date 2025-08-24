// FILE: /src/api/plan/planSessionExercises.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanExercise, AddPlanSessionExercisePayload, UpdatePlanSessionExercisePayload, DeletePlanSessionExercisePayload } from "@/types/plan/planSessionExercises";

/**
 * @description Adds a new exercise to a plan session.
 * Corresponds to the `add_plan_session_exercise` RPC.
 * @param payload The data for the new exercise.
 * @returns A promise that resolves to the newly created `PlanExercise` record.
 */
export const addPlanSessionExercise = async (payload: AddPlanSessionExercisePayload): Promise<PlanExercise> => {
  // RPC returns jsonb_build_object for `PlanExercise` including `exercise_details`
  const { data, error } = await supabase.rpc('add_plan_session_exercise', payload).single();
  if (error || !data) {
    console.error('API Error addPlanSessionExercise:', error);
    throw new Error(error?.message || "Failed to add plan session exercise.");
  }
  return data as PlanExercise;
};

/**
 * @description Updates an existing exercise within a plan session.
 * Corresponds to the `update_plan_session_exercise` RPC.
 * @param payload The data to update the exercise.
 * @returns A promise that resolves to the updated `PlanExercise` record.
 */
// NOTE: The `update_plan_session_exercise` RPC does not seem to be present in your provided SQL.
// I'm assuming its existence and its return type would be `PlanExercise` after update.
export const updatePlanSessionExercise = async (payload: UpdatePlanSessionExercisePayload): Promise<PlanExercise> => {
  const { data, error } = await supabase.rpc('update_plan_session_exercise', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSessionExercise:', error);
    throw new Error(error?.message || "Failed to update plan session exercise.");
  }
  return data as PlanExercise;
};

/**
 * @description Deletes an exercise from a plan session and its contents (cascades).
 * Corresponds to the `delete_plan_session_exercise` RPC.
 * @param payload The ID of the exercise to delete.
 */
// NOTE: The `delete_plan_session_exercise` RPC does not seem to be present in your provided SQL.
// I'm assuming its existence.
export const deletePlanSessionExercise = async (payload: DeletePlanSessionExercisePayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session_exercise', payload);
  if (error) {
    console.error('API Error deletePlanSessionExercise:', error);
    throw new Error(error.message || "Failed to delete plan session exercise.");
  }
};