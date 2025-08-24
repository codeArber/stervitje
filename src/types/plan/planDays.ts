// FILE: /src/types/plan/planDays.ts

import { Tables } from "../database.types";
import { PlanSession } from "./planSessions";

/**
 * @description Represents a single day within a planned week.
 * Corresponds to the `plan_days` table, extended with nested `sessions` by hierarchy RPCs.
 */
export type PlanDay = Tables<'plan_days'> & {
  sessions: PlanSession[]; // `jsonb_agg` returns [] if empty, not null
};

/**
 * @description Payload for `add_plan_day` RPC.
 */
export interface AddPlanDayPayload {
  p_plan_week_id: string;
  p_day_number: number;
  p_title?: string | null;
  p_description?: string | null;
  p_is_rest_day?: boolean | null;
}

/**
 * @description Payload for `update_plan_day` RPC.
 */
export interface UpdatePlanDayPayload {
  p_day_id: string;
  p_day_number?: number; // Optional for updates
  p_title?: string | null;
  p_description?: string | null;
  p_is_rest_day?: boolean | null;
}

/**
 * @description Payload for `delete_plan_day` RPC.
 */
export interface DeletePlanDayPayload {
  p_day_id: string;
}