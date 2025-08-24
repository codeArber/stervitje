// FILE: /src/types/plan/planWeeks.ts

import { Tables } from "../database.types";
import { PlanDay } from "./PlanDays";

/**
 * @description Represents a single week within a plan.
 * Corresponds to the `plan_weeks` table, extended with nested `days` by hierarchy RPCs.
 */
export type PlanWeek = Tables<'plan_weeks'> & {
  days: PlanDay[]; // `jsonb_agg` returns [] if empty, not null
};

/**
 * @description Payload for `add_plan_week` RPC.
 */
export interface AddPlanWeekPayload {
  p_plan_id: string;
  p_week_number: number;
  p_description?: string | null;
}

/**
 * @description Payload for `update_plan_week` RPC.
 */
export interface UpdatePlanWeekPayload {
  p_week_id: string;
  p_week_number?: number; // Optional for updates
  p_description?: string | null;
}

/**
 * @description Payload for `delete_plan_week` RPC.
 */
export interface DeletePlanWeekPayload {
  p_week_id: string;
}