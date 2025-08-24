// FILE: /src/api/plan/planSessions.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanSession, AddPlanSessionPayload, UpdatePlanSessionPayload, DeletePlanSessionPayload } from "@/types/plan/planSessions";

/**
 * @description Adds a new session to a plan day.
 * Corresponds to the `add_plan_session` RPC.
 * @param payload The data for the new session.
 * @returns A promise that resolves to the newly created `PlanSession` record.
 */
export const addPlanSession = async (payload: AddPlanSessionPayload): Promise<PlanSession> => {
  const { data, error } = await supabase.rpc('add_plan_session', payload).single();
  if (error || !data) {
    console.error('API Error addPlanSession:', error);
    throw new Error(error?.message || "Failed to add plan session.");
  }
  return data as PlanSession;
};

/**
 * @description Updates an existing plan session.
 * Corresponds to the `update_plan_session` RPC.
 * @param payload The data to update the session.
 * @returns A promise that resolves to the updated `PlanSession` record.
 */
export const updatePlanSession = async (payload: UpdatePlanSessionPayload): Promise<PlanSession> => {
  const { data, error } = await supabase.rpc('update_plan_session', payload).single();
  if (error || !data) {
    console.error('API Error updatePlanSession:', error);
    throw new Error(error?.message || "Failed to update plan session.");
  }
  return data as PlanSession;
};

/**
 * @description Deletes a plan session and its contents (cascades).
 * Corresponds to the `delete_plan_session` RPC.
 * @param payload The ID of the session to delete.
 */
export const deletePlanSession = async (payload: DeletePlanSessionPayload): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_session', payload);
  if (error) {
    console.error('API Error deletePlanSession:', error);
    throw new Error(error.message || "Failed to delete plan session.");
  }
};