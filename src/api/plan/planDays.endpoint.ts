// FILE: /src/api/plan/planDays.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import { AddPlanDayPayload, DeletePlanDayPayload, PlanDay, UpdatePlanDayPayload } from "@/types/plan/PlanDays";

/**
 * @description Adds a new day to a plan week.
 * Corresponds to the `add_plan_day` RPC.
 * @param payload The data for the new day.
 * @returns A promise that resolves to the newly created `PlanDay` record.
 */
export const addPlanDay = async (payload: AddPlanDayPayload): Promise<PlanDay> => {
  const { data, error } = await supabase.rpc('add_plan_day', payload).single();
  if (error || !data) {
    console.error('API Error addPlanDay:', error);
    throw new Error(error?.message || "Failed to add plan day.");
  }
  return data as PlanDay;
};

/**
 * @description Updates an existing plan day.
 * Corresponds to the `update_plan_day` RPC.
 * @param payload The data to update the day.
 * @returns A promise that resolves to the updated `PlanDay` record.
 */
export const updatePlanDay = async (payload: UpdatePlanDayPayload): Promise<PlanDay> => {
  const { data, error } = await supabase.rpc('update_plan_day', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanDay:', error);
    throw new Error(error?.message || "Failed to update plan day.");
  }
  return data as PlanDay;
};

/**
 * @description Deletes a plan day and its contents (cascades).
 * Corresponds to the `delete_plan_day` RPC.
 * @param payload The ID of the day to delete.
 */
export const deletePlanDay = async (payload: DeletePlanDayPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_day', payload);
  if (error) {
    console.error('API Error deletePlanDay:', error);
    throw new Error(error.message || "Failed to delete plan day.");
  }
};