// FILE: /src/types/plan/planSessions.ts
import { Tables } from "../database.types";
import { PlanExercise } from "./planSessionExercises";


/**
 * @description Represents the complete, detailed structure of a single workout session from a plan.
 * Corresponds to the `plan_sessions` table, extended with nested `exercises` by hierarchy RPCs.
 */
export type PlanSession = Tables<'plan_sessions'> & {
  exercises: PlanExercise[]; // `json_agg` returns [] if empty, not null
};

/**
 * @description Payload for `add_plan_session` RPC.
 */
export interface AddPlanSessionPayload {
  p_plan_day_id: string;
  p_order_index: number;
  p_title?: string | null;
  p_notes?: string | null;
}

/**
 * @description Payload for `update_plan_session` RPC.
 */
export interface UpdatePlanSessionPayload {
  p_session_id: string;
  p_order_index?: number; // Optional for updates
  p_title?: string | null;
  p_notes?: string | null;
}

/**
 * @description Payload for `delete_plan_session` RPC.
 */
export interface DeletePlanSessionPayload {
  p_session_id: string;
}