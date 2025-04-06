// src/api/plans/session/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanSession } from '@/types/planTypes'; // Adjust path if needed

// Payload type for creating a session
// (plan_day_id and order_index often determined programmatically)
export interface CreateSessionPayload {
    plan_day_id: string;
    order_index: number;
    title?: string | null;
    notes?: string | null;
}

// Payload type for updating a session
// Cannot change plan_day_id
export type UpdateSessionPayload = Partial<Omit<CreateSessionPayload, 'plan_day_id'>>;


/**
 * Fetches a plan session by its ID.
 * Assumes RLS policy handles authorization.
 */
export const fetchPlanSession = async (sessionId: string): Promise<PlanSession> => {
    const { data: session, error } = await supabase
        .from('plan_sessions')
        .select('*, plan_session_exercises(*, exercises(*), plan_session_exercise_sets(*))') // Fetch the session record
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error(`API Error fetchPlanSession (ID: ${sessionId}):`, error);
        throw new Error(error.message);
    }
    if (!session) {
        throw new Error("Plan session not found or unauthorized.");
    }
    return session as PlanSession;
};

/**
 * Creates a new session within a specified plan day.
 * Assumes RLS policy handles authorization.
 */
export const createPlanSession = async (payload: CreateSessionPayload): Promise<PlanSession> => {
    const { data: newSession, error } = await supabase
        .from('plan_sessions')
        .insert(payload)
        .select() // Fetch the newly created session record
        .single();

    if (error) {
        console.error(`API Error createPlanSession for Day ID ${payload.plan_day_id}:`, error);
        throw new Error(error.message);
    }
    if (!newSession) {
        throw new Error("Failed to create plan session or retrieve the created record.");
    }
    // Add empty exercises array for immediate consistency if needed by frontend
    return { ...newSession, plan_session_exercises: [] } as PlanSession;
};

/**
 * Updates the details (title, notes, order) of an existing plan session.
 * Assumes RLS policy handles authorization.
 */
export const updatePlanSession = async ({ sessionId, updateData }: { sessionId: string, updateData: UpdateSessionPayload }): Promise<PlanSession> => {
    // DB trigger handles updated_at
    const { data: updatedSession, error } = await supabase
        .from('plan_sessions')
        .update(updateData) // Pass only the updatable fields
        .eq('id', sessionId)
        .select() // Fetch the updated session record
        .single();

    if (error) {
        console.error(`API Error updatePlanSession (ID: ${sessionId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedSession) {
        throw new Error("Update failed or session not found/unauthorized.");
    }
    // Return updated data; nested exercises are not fetched here.
    return updatedSession as PlanSession;
};

/**
 * Deletes a plan session and its nested exercises/sets (via CASCADE).
 * Assumes RLS policy handles authorization.
 */
export const deletePlanSession = async (sessionId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('plan_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error(`API Error deletePlanSession (ID: ${sessionId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};