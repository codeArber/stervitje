// FILE: /src/api/plan/planSessionExerciseSets.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanSet, AddPlanSessionExerciseSetPayload, UpdatePlanSessionExerciseSetPayload, DeletePlanSessionExerciseSetPayload } from "@/types/plan/planSessionExerciseSets";

/**
 * @description Adds a new set to a plan session exercise.
 * Corresponds to the `add_exercise_set` RPC.
 * @param payload The data for the new set. Note: The RPC expects this as a JSONB parameter `p_set_data`.
 * @returns A promise that resolves to the newly created `PlanSet` record.
 */
export const addPlanSessionExerciseSet = async (payload: AddPlanSessionExerciseSetPayload): Promise<PlanSet> => {
  const { data, error } = await supabase.rpc('add_exercise_set', { p_set_data: payload }).single();
  if (error || !data) {
    console.error('API Error addPlanSessionExerciseSet:', error);
    throw new Error(error?.message || "Failed to add plan session exercise set.");
  }
  return data as PlanSet;
};

/**
 * @description Updates an existing set within a plan session exercise.
 * Corresponds to the `update_plan_session_exercise_set` RPC.
 * @param payload The data to update the set.
 * @returns A promise that resolves to the updated `PlanSet` record.
 */
// NOTE: The `update_plan_session_exercise_set` RPC does not seem to be present in your provided SQL.
// I'm assuming its existence and its return type would be `PlanSet` after update.
export const updatePlanSessionExerciseSet = async (payload: UpdatePlanSessionExerciseSetPayload): Promise<PlanSet> => {
  const { data, error } = await supabase.rpc('update_plan_session_exercise_set', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSessionExerciseSet:', error);
    throw new Error(error?.message || "Failed to update plan session exercise set.");
  }
  return data as PlanSet;
};

/**
 * @description Deletes a set from a plan session exercise.
 * Corresponds to the `delete_plan_session_exercise_set` RPC.
 * @param payload The ID of the set to delete.
 */
// NOTE: The `delete_plan_session_exercise_set` RPC does not seem to be present in your provided SQL.
// I'm assuming its existence.
export const deletePlanSessionExerciseSet = async (payload: DeletePlanSessionExerciseSetPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session_exercise_set', payload);
  if (error) {
    console.error('API Error deletePlanSessionExerciseSet:', error);
    throw new Error(error.message || "Failed to delete plan session exercise set.");
  }
};