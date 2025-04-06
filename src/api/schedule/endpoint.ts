// src/api/schedule/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { TodayPlanSummary } from '@/types/scheduleTypes'; // Adjust path if needed

/**
 * Calls the RPC function to get a summary of non-rest plan days
 * scheduled for the current user today.
 */
export const getTodaysPlanSummary = async (): Promise<TodayPlanSummary[]> => {
    const { data, error } = await supabase.rpc('get_todays_plan_summary');

    if (error) {
        console.error('API Error getTodaysPlanSummary:', error);
        // Don't throw an error for common cases like "user not found" if the function handles it,
        // but do throw for unexpected DB errors. Adjust based on expected RPC behavior.
        if (error.code && error.code.startsWith('PGRST')) { // Example: Check for PostgREST errors
             // Potentially handle specific known errors silently if needed
        } else {
            throw new Error(error.message); // Throw for other errors
        }
        // If handling errors silently, return empty array:
        return [];
    }

    // The RPC returns JSONB, which Supabase client should parse.
    // Ensure it's an array, default to empty array if not.
    if (!Array.isArray(data)) {
        console.warn('getTodaysPlanSummary RPC returned non-array data:', data);
        return [];
    }

    return data as TodayPlanSummary[];
};