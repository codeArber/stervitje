// src/api/workouts/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type { WorkoutLog, WorkoutLogPayload } from '@/types'; // Define these types

/** Logs a workout session using RPC */
export const logWorkout = async (workoutPayload: WorkoutLogPayload): Promise<string> => { // Returns new workout_log UUID
    const { data, error } = await supabase.rpc('log_workout', {
        workout_payload: workoutPayload // Ensure payload matches RPC expected JSON structure
    });
    if (error) {
        console.error("API Error logWorkout:", error);
        throw new Error(error.message);
    }
    // RPC returns the UUID directly
    if (typeof data !== 'string' || !data) {
         throw new Error("Log workout RPC did not return a valid UUID.");
    }
    return data;
};

/** Fetches workout history for the current user (includes nested exercise/set logs) */
export const fetchWorkoutHistory = async (page = 1, limit = 15): Promise<WorkoutLog[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const offset = (page - 1) * limit;

    // This query can return a lot of nested data, ensure performance/indexing
    const { data, error } = await supabase
        .from('workout_logs')
        .select(`
            id,
            date,
            title,
            notes,
            duration_minutes,
            overall_feeling,
            created_at,
            privacy_level,
            exercise_logs (
                id,
                notes,
                order_index,
                exercises ( id, name ),
                set_logs ( * ) order(set_number)
            ) order(order_index)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

     if (error) {
        console.error("API Error fetchWorkoutHistory:", error);
        throw new Error(error.message);
    }
    return (data as WorkoutLog[]) || [];
}

/** Deletes a workout log and its associated exercise/set logs (due to CASCADE) */
export const deleteWorkoutLog = async (workoutLogId: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', workoutLogId)
        .eq('user_id', user.id); // Ensure user can only delete their own logs (RLS should also enforce this)

    if (error) {
        console.error(`API Error deleteWorkoutLog (ID: ${workoutLogId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
}