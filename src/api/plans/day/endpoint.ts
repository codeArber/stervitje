// src/api/plans/day/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanDay, PlanDayDetails } from '@/types/planTypes'; // Adjust path if needed

// Payload type for creating a day
// (plan_week_id and day_number often determined programmatically)
export interface CreateDayPayload {
    plan_week_id: string;
    day_number: number; // 1-7
    title?: string | null;
    description?: string | null;
    is_rest_day?: boolean;
}

// Payload type for updating a day
export type UpdateDayPayload = Partial<Omit<CreateDayPayload, 'plan_week_id' | 'day_number'>>; // Cannot change parent or day number usually


/**
 * Creates a new day within a specified plan week.
 * Assumes RLS policy handles authorization.
 */
export const createPlanDay = async (payload: CreateDayPayload): Promise<PlanDay> => {
    const { data: newDay, error } = await supabase
        .from('plan_days')
        .insert(payload)
        .select() // Fetch the newly created day record
        .single();

    if (error) {
        console.error(`API Error createPlanDay for Week ID ${payload.plan_week_id}:`, error);
        throw new Error(error.message);
    }
    if (!newDay) {
        throw new Error("Failed to create plan day or retrieve the created record.");
    }
    // Add empty sessions array for immediate consistency if needed by frontend
    return { ...newDay, plan_sessions: [] } as PlanDay;
};

/**
 * Updates the details of an existing plan day (title, desc, rest status).
 * Assumes RLS policy handles authorization.
 */
export const updatePlanDay = async ({ dayId, updateData }: { dayId: string, updateData: UpdateDayPayload }): Promise<PlanDay> => {
    // DB trigger handles updated_at if applicable to plan_days
    const { data: updatedDay, error } = await supabase
        .from('plan_days')
        .update(updateData) // Pass only the updatable fields
        .eq('id', dayId)
        .select() // Fetch the updated day record
        .single();

    if (error) {
        console.error(`API Error updatePlanDay (ID: ${dayId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedDay) {
        throw new Error("Update failed or day not found/unauthorized.");
    }
    // Return updated data; nested sessions are not fetched here.
    return updatedDay as PlanDay;
};

/**
 * Deletes a plan day and its nested sessions/exercises/etc. (via CASCADE).
 * Assumes RLS policy handles authorization.
 */
export const deletePlanDay = async (dayId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('plan_days')
        .delete()
        .eq('id', dayId);

    if (error) {
        console.error(`API Error deletePlanDay (ID: ${dayId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};


/**
 * Fetches the detailed structure (sessions, exercises, sets) for a specific plan day.
 * Calls the get_plan_day_details RPC function.
 */
export const getPlanDayDetails = async (planDayId: string): Promise<PlanDayDetails | null> => {
    if (!planDayId) {
        console.warn("getPlanDayDetails called without planDayId");
        return null;
    }

    const { data, error } = await supabase.rpc('get_plan_day_details', {
        _plan_day_id: planDayId
    });

    if (error) {
        console.error(`API Error getPlanDayDetails (ID: ${planDayId}):`, error);
        // Decide if specific errors should return null vs throw
        // For example, if RLS prevents access, the RPC might return null or error
        throw new Error(error.message); // Or return null based on expected errors
    }

    // The RPC returns a single JSONB object or NULL if not found/accessible
    return data as PlanDayDetails | null;
};