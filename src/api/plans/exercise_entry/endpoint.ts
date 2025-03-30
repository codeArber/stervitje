// src/api/plans/exerciseEntry/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
// Import the specific type for the return value, and maybe payload
import type { PlanSessionExercise } from '@/types/planTypes'; // Adjust path

// Payload for creating an exercise entry within a session
export interface CreateExerciseEntryPayload {
    plan_session_id: string;
    exercise_id: string; // ID of the exercise from the main library
    order_index: number;
    notes?: string | null; // Overall notes for this block
    target_rest_seconds?: number | null; // Rest AFTER this block
}

// Payload for updating an exercise entry (notes, rest, order)
// Usually, you don't change the exercise_id itself here, but delete/re-add
export type UpdateExerciseEntryPayload = Partial<Pick<CreateExerciseEntryPayload, 'notes' | 'target_rest_seconds' | 'order_index'>>;


/**
 * Creates (adds) an exercise entry to a plan session.
 * Assumes RLS handles authorization.
 */
export const createPlanSessionExercise = async (payload: CreateExerciseEntryPayload): Promise<PlanSessionExercise> => {
    const { data: newEntry, error } = await supabase
        .from('plan_session_exercises')
        .insert(payload)
        // Select the new entry PLUS the basic linked exercise info for immediate display
        .select(`
            *,
            exercise:exercises ( id, name, image_url )
        `)
        .single();

    if (error) {
        console.error(`API Error createPlanSessionExercise for Session ID ${payload.plan_session_id}:`, error);
        throw new Error(error.message);
    }
    if (!newEntry) {
        throw new Error("Failed to create plan session exercise entry or retrieve the created record.");
    }
    // Initialize with empty sets array
    return { ...newEntry, plan_session_exercise_sets: [] } as PlanSessionExercise;
};

/**
 * Updates the details (notes, rest, order) of an existing plan session exercise entry.
 * Assumes RLS handles authorization.
 */
export const updatePlanSessionExercise = async ({ exerciseEntryId, updateData }: { exerciseEntryId: string, updateData: UpdateExerciseEntryPayload }): Promise<PlanSessionExercise> => {
    // DB trigger handles updated_at

    const { data: updatedEntry, error } = await supabase
        .from('plan_session_exercises')
        .update(updateData)
        .eq('id', exerciseEntryId)
        // Select updated entry PLUS linked exercise info and EXISTING sets (ordered)
        // Need the sets here if optimistically updating cache in the hook
        .select(`
            *,
            exercise:exercises ( id, name, image_url ),
            plan_session_exercise_sets (*) order(set_number)
        `)
        .single();

    if (error) {
        console.error(`API Error updatePlanSessionExercise (ID: ${exerciseEntryId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedEntry) {
        throw new Error("Update failed or exercise entry not found/unauthorized.");
    }
    // Sort sets client-side just in case DB order isn't guaranteed across relations
     if (updatedEntry.plan_session_exercise_sets) {
         updatedEntry.plan_session_exercise_sets.sort((a, b) => a.set_number - b.set_number);
     }
    return updatedEntry as PlanSessionExercise;
};

/**
 * Deletes a plan session exercise entry and its nested sets (via CASCADE).
 * Assumes RLS handles authorization.
 */
export const deletePlanSessionExercise = async (exerciseEntryId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('plan_session_exercises')
        .delete()
        .eq('id', exerciseEntryId);

    if (error) {
        console.error(`API Error deletePlanSessionExercise (ID: ${exerciseEntryId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};