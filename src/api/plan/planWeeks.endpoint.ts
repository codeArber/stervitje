// FILE: /src/api/plan/planWeeks.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanWeek, AddPlanWeekPayload, UpdatePlanWeekPayload, DeletePlanWeekPayload } from "@/types/plan/planWeeks";

/**
 * @description Adds a new week to a plan.
 * Corresponds to the `add_plan_week` RPC.
 * @param payload The data for the new week.
 * @returns A promise that resolves to the newly created `PlanWeek` record.
 */
export const addPlanWeek = async (payload: AddPlanWeekPayload): Promise<PlanWeek> => {
  const { data, error } = await supabase.rpc('add_plan_week', payload).single();
  if (error || !data) {
    console.error('API Error addPlanWeek:', error);
    throw new Error(error?.message || "Failed to add plan week.");
  }
  return data as PlanWeek;
};

/**
 * @description Updates an existing plan week.
 * Corresponds to the `update_plan_week` RPC.
 * @param payload The data to update the week.
 * @returns A promise that resolves to the updated `PlanWeek` record.
 */
export const updatePlanWeek = async (payload: UpdatePlanWeekPayload): Promise<PlanWeek> => {
  const { data, error } = await supabase.rpc('update_plan_week', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanWeek:', error);
    throw new Error(error?.message || "Failed to update plan week.");
  }
  return data as PlanWeek;
};

/**
 * @description Deletes a plan week and its contents (cascades).
 * Corresponds to the `delete_plan_week` RPC.
 * @param payload The ID of the week to delete.
 */
export const deletePlanWeek = async (payload: DeletePlanWeekPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_week', payload);
  if (error) {
    console.error('API Error deletePlanWeek:', error);
    throw new Error(error.message || "Failed to delete plan week.");
  }
};