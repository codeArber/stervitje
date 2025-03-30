// src/api/plans/set/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
// Import the specific type for the return value and payload
import type { PlanExerciseSet } from '@/types/planTypes'; // Adjust path

// Payload for creating an individual set
// plan_session_exercise_id and set_number usually managed externally
export interface CreateSetPayload {
    plan_session_exercise_id: string;
    set_number: number;
    target_reps?: number | null;
    target_weight?: number | null;
    target_weight_unit?: 'kg' | 'lb' | null;
    target_duration_seconds?: number | null;
    target_distance_meters?: number | null;
    target_rest_seconds?: number | null; // Rest after this set
    notes?: string | null;
}

// Payload for updating an individual set
// Cannot change plan_session_exercise_id or set_number easily
export type UpdateSetPayload = Partial<Omit<CreateSetPayload, 'plan_session_exercise_id' | 'set_number'>>;

/**
 * Creates (adds) an individual set to a plan session exercise entry.
 * Assumes RLS handles authorization.
 */
export const createPlanSet = async (payload: CreateSetPayload): Promise<PlanExerciseSet> => {
    const { data: newSet, error } = await supabase
        .from('plan_session_exercise_sets')
        .insert(payload)
        .select() // Fetch the newly created set record
        .single();

    if (error) {
        console.error(`API Error createPlanSet for Exercise Entry ID ${payload.plan_session_exercise_id}:`, error);
        // Provide more context if possible (e.g., duplicate set_number error code '23505')
        if (error.code === '23505') {
             throw new Error(`Set number ${payload.set_number} already exists for this exercise entry. ${error.message}`);
        }
        throw new Error(error.message);
    }
    if (!newSet) {
        throw new Error("Failed to create plan set or retrieve the created record.");
    }
    return newSet as PlanExerciseSet;
};

/**
 * Updates the details of an existing plan exercise set.
 * Assumes RLS handles authorization.
 */
export const updatePlanSet = async ({ setId, updateData }: { setId: string, updateData: UpdateSetPayload }): Promise<PlanExerciseSet> => {
    // DB trigger handles updated_at if applicable
    const { data: updatedSet, error } = await supabase
        .from('plan_session_exercise_sets')
        .update(updateData) // Pass only the updatable fields
        .eq('id', setId)
        .select() // Fetch the updated set record
        .single();

    if (error) {
        console.error(`API Error updatePlanSet (ID: ${setId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedSet) {
        throw new Error("Update failed or set not found/unauthorized.");
    }
    return updatedSet as PlanExerciseSet;
};

/**
 * Deletes an individual plan exercise set.
 * Assumes RLS handles authorization.
 */
export const deletePlanSet = async (setId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('plan_session_exercise_sets')
        .delete()
        .eq('id', setId);

    if (error) {
        console.error(`API Error deletePlanSet (ID: ${setId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};