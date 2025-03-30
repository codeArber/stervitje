// src/api/plans/week/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanWeek } from '@/types/planTypes'; // Adjust path if needed

// Payload type for creating a week
// (plan_id and week_number often determined programmatically)
export interface CreateWeekPayload {
    plan_id: string;
    week_number: number;
    description?: string | null;
}

// Payload type for updating a week (only description is usually updatable)
export type UpdateWeekPayload = Partial<Pick<CreateWeekPayload, 'description'>>;


/**
 * Creates a new week within a specified plan.
 * Assumes RLS policy on 'plan_weeks' or 'plans' handles authorization.
 */
export const createPlanWeek = async (payload: CreateWeekPayload): Promise<PlanWeek> => {
    const { data: newWeek, error } = await supabase
        .from('plan_weeks')
        .insert(payload)
        .select() // Fetch the newly created week record
        .single();

    if (error) {
        console.error(`API Error createPlanWeek for Plan ID ${payload.plan_id}:`, error);
        throw new Error(error.message);
    }
    if (!newWeek) {
        throw new Error("Failed to create plan week or retrieve the created record.");
    }
    // Add empty days array for consistency if needed by frontend immediately,
    // although fetching PlanDetails is the standard way to get children.
    return { ...newWeek, plan_days: [] } as PlanWeek;
};

/**
 * Updates the description of an existing plan week.
 * Assumes RLS policy handles authorization.
 */
export const updatePlanWeek = async ({ weekId, updateData }: { weekId: string, updateData: UpdateWeekPayload }): Promise<PlanWeek> => {
    // Ensure only valid fields are included (only description here)
    const validUpdateData = { description: updateData.description };
    // DB trigger handles updated_at if applicable to plan_weeks

    const { data: updatedWeek, error } = await supabase
        .from('plan_weeks')
        .update(validUpdateData)
        .eq('id', weekId)
        .select() // Fetch the updated week record
        .single();

    if (error) {
        console.error(`API Error updatePlanWeek (ID: ${weekId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedWeek) {
        throw new Error("Update failed or week not found/unauthorized.");
    }
    // Return updated data; nested days are not fetched here.
    return updatedWeek as PlanWeek;
};

/**
 * Deletes a plan week and its nested days/sessions/etc. (via CASCADE).
 * Assumes RLS policy handles authorization.
 */
export const deletePlanWeek = async (weekId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('plan_weeks')
        .delete()
        .eq('id', weekId);

    if (error) {
        console.error(`API Error deletePlanWeek (ID: ${weekId}):`, error);
        throw new Error(error.message);
    }
    // Returns success: true if no error, even if row didn't exist (standard delete behavior)
    return { success: true };
};