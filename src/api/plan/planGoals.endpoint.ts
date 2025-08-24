// FILE: /src/api/plan/planGoals.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanGoal, PlanGoalPayload, PendingBaselineGoal,  PlanGoalWithExerciseDetails } from "@/types/plan/planGoals";
import type { UserPlanStatus } from "@/types/index"; // Import UserPlanStatus
import { UserBaseline } from "./endpoint";

/**
 * @description Adds a new goal to a plan.
 * Corresponds to the `add_plan_goal` RPC.
 * @param planId The ID of the plan to add the goal to.
 * @param payload The data for the new goal.
 * @returns A promise that resolves to the newly created `PlanGoal` record.
 */
export const addPlanGoal = async (planId: string, payload: PlanGoalPayload): Promise<PlanGoal> => {
  const rpcPayload = {
    p_plan_id: planId,
    p_title: payload.title,
    p_description: payload.description,
    p_metric: payload.metric,
    p_direction: payload.direction,
    p_target_type: payload.target_type,
    p_target_value: payload.target_value,
    p_exercise_id: payload.exercise_id
  };
  const { data, error } = await supabase.rpc('add_plan_goal', rpcPayload).single(); // Add .single()
  if (error || !data) {
    console.error('API Error addPlanGoal:', error);
    throw new Error(error?.message || "Failed to add plan goal.");
  }
  return data as PlanGoal;
};

/**
 * @description Updates an existing plan goal.
 * Corresponds to the `update_plan_goal` RPC.
 * @param goalId The ID of the goal to update.
 * @param payload The data to update the goal.
 * @returns A promise that resolves to the updated `PlanGoal` record.
 */
export const updatePlanGoal = async (goalId: string, payload: PlanGoalPayload): Promise<PlanGoal> => {
  const rpcPayload = {
    p_goal_id: goalId,
    p_title: payload.title,
    p_description: payload.description,
    p_metric: payload.metric,
    p_direction: payload.direction, // Ensure direction and target_type are passed for update
    p_target_type: payload.target_type,
    p_target_value: payload.target_value,
    p_exercise_id: payload.exercise_id
  };
  const { data, error } = await supabase.rpc('update_plan_goal', rpcPayload).single(); // Add .single()
  if (error || !data) {
    console.error('API Error updatePlanGoal:', error);
    throw new Error(error?.message || "Failed to update plan goal.");
  }
  return data as PlanGoal;
};

/**
 * @description Deletes a plan goal.
 * Corresponds to the `delete_plan_goal` RPC.
 * @param goalId The ID of the goal to delete.
 */
export const deletePlanGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_plan_goal', { p_goal_id: goalId });
  if (error) {
    console.error('API Error deletePlanGoal:', error);
    throw new Error(error.message);
  }
};

/**
 * @description Fetches goals that require a baseline from the user for a specific session.
 * Corresponds to the `get_pending_baselines_for_session` RPC.
 * @param planSessionId The UUID of the plan session.
 * @returns A promise that resolves to an array of `PendingBaselineGoal`.
 */
export const fetchPendingBaselinesForSession = async (planSessionId: string): Promise<PendingBaselineGoal[]> => {
    const { data, error } = await supabase.rpc('get_pending_baselines_for_session', {
        p_plan_session_id: planSessionId
    });
    if (error) {
      console.error(`API Error fetchPendingBaselinesForSession (Session ID: ${planSessionId}):`, error);
      throw new Error(error.message);
    }
    return (data as PendingBaselineGoal[]) || [];
};

/**
 * @description Fetches all goals for a specific plan, including exercise details.
 * Corresponds to the `get_goals_for_plan` RPC.
 * @param planId The UUID of the plan.
 * @returns A promise that resolves to an array of `PlanGoalWithExerciseDetails`.
 */
export const fetchPlanGoals = async (planId: string): Promise<PlanGoalWithExerciseDetails[]> => {
    if (!planId) return [];

    const { data, error } = await supabase
        .rpc('get_goals_for_plan', { p_plan_id: planId });

    if (error) {
        console.error(`API Error fetchPlanGoals (Plan ID: ${planId}):`, error);
        throw new Error(error.message);
    }
    // The RPC returns a single JSONB array. If it's null (no goals found), return an empty array.
    return (data as PlanGoalWithExerciseDetails[]) || [];
};

/**
 * @description Starts a plan for a user with initial baseline values for goals.
 * Corresponds to the `start_plan_with_baselines` RPC.
 * @param planId The UUID of the plan to start.
 * @param baselines An array of `UserBaseline` objects.
 * @returns A promise that resolves to the `UserPlanStatus` record.
 */
export const startPlanWithBaselines = async (planId: string, baselines: UserBaseline[]): Promise<UserPlanStatus> => {
  const { data, error } = await supabase.rpc('start_plan_with_baselines', {
    p_payload: { plan_id: planId, baselines: baselines }
  }).single();
  if (error || !data) {
    console.error('API Error startPlanWithBaselines:', error);
    throw new Error(error?.message || "Failed to start plan with baselines.");
  }
  return data as UserPlanStatus;
};