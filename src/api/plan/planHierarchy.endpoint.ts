// FILE: /src/api/plan/planHierarchy.endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { PlanHierarchy } from "@/types/plan";
import { PlanChangeset } from "@/types/plan/planMutations";

/**
 * @description Saves a complete set of changes (additions, deletions, updates) to a plan's hierarchy.
 * Corresponds to the `save_plan_changes` RPC.
 * @param changeset The object containing all changes to apply.
 * @returns A promise that resolves to a map of temporary IDs to real IDs for new elements.
 */
export const savePlanChanges = async (changeset: PlanChangeset): Promise<Record<string, string>> => {
  const { data, error } = await supabase.rpc('save_plan_changes', {
    p_changeset: changeset,
  });

  if (error) {
    console.error('API Error savePlanChanges:', error);
    throw new Error(error.message);
  }
  // The RPC returns a JSONB object mapping temp IDs to real IDs.
  return data as Record<string, string>;
};

/**
 * @description Overwrites a plan's entire hierarchy with a new structure.
 * Corresponds to the `save_plan_hierarchy` RPC.
 * @param payload - Object containing `planId` and the new `hierarchy` JSONB.
 */
export const savePlanHierarchy = async (payload: { planId: string; hierarchy: PlanHierarchy }): Promise<void> => {
  const { error } = await supabase.rpc('save_plan_hierarchy', {
    p_plan_id: payload.planId,
    p_hierarchy: payload.hierarchy,
  });

  if (error) {
    console.error('API Error savePlanHierarchy:', error);
    throw new Error(error.message);
  }
};