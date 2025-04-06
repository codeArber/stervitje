// src/api/plans/plan/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import type {
    Plan,
    PlanDetail,
    DiscoverablePlan,
    CreatePlanPayload,
    UpdatePlanPayload // Use Partial<CreatePlanPayload> or define explicitly
} from '@/types/planTypes'; // Adjust path

/**
 * Fetches the complete details of a single plan, including all nested
 * weeks, days, sessions, exercises, and sets.
 */
export const fetchPlanDetails = async (planId: string | null | undefined): Promise<PlanDetail | null> => {
    if (!planId) return null;

    // --- FIX: Removed nested order() and comments from select string ---
    const selectString = `
        *,
        plan_weeks (
            *,
            plan_days (
                *,
                plan_sessions (
                    *,
                    plan_session_exercises (
                        *,
                        exercise:exercises ( id, name, image_url ),
                        plan_session_exercise_sets (*)
                    )
                )
            )
        ),
        team:teams ( id, name )
    `;

    const { data, error } = await supabase
        .from('plans')
        .select(selectString)
        .eq('id', planId)
        .maybeSingle();

    if (error) {
        // Handle 'not found' explicitly returned by maybeSingle() or other errors
        if (error.code !== 'PGRST116' && !error.message.includes('Results contain 0 rows')) {
             console.error(`API Error fetchPlanDetails (ID: ${planId}):`, error);
             throw new Error(error.message);
        } else {
            // This case includes PGRST116 or when maybeSingle finds 0 rows without explicit error code
            console.warn(`API fetchPlanDetails: Plan ${planId} not found or no rows returned.`);
            return null; // Return null on not found
        }
    }

     // Handle case where query succeeds but data is null (maybeSingle found 0 rows)
    if (!data) {
        console.warn(`API fetchPlanDetails: Plan ${planId} not found (data is null).`);
        return null;
    }


    // --- Client-side Sorting (Recommended for guaranteed order) ---
    if (data?.plan_weeks) {
        data.plan_weeks.sort((a, b) => a.week_number - b.week_number);
        data.plan_weeks.forEach(week => {
            if (week.plan_days) {
                week.plan_days.sort((a, b) => a.day_number - b.day_number);
                week.plan_days.forEach(day => {
                    if (day.plan_sessions) {
                        day.plan_sessions.sort((a, b) => a.order_index - b.order_index);
                        day.plan_sessions.forEach(session => {
                             if (session.plan_session_exercises) {
                                session.plan_session_exercises.sort((a, b) => a.order_index - b.order_index);
                                session.plan_session_exercises.forEach(exerciseEntry => {
                                    // Ensure sets array exists before sorting
                                    if (exerciseEntry.plan_session_exercise_sets) {
                                        exerciseEntry.plan_session_exercise_sets.sort((a, b) => a.set_number - b.set_number);
                                    } else {
                                        // Initialize if null/undefined after fetch (defensive)
                                        exerciseEntry.plan_session_exercise_sets = [];
                                    }
                                });
                             } else {
                                 session.plan_session_exercises = []; // Initialize if needed
                             }
                        });
                    } else {
                         day.plan_sessions = []; // Initialize if needed
                    }
                });
            } else {
                 week.plan_days = []; // Initialize if needed
            }
        });
    } else {
        data.plan_weeks = []; // Initialize if needed
    }
    // --- End Sorting ---

    return data as PlanDetail; // Return data which is confirmed not null here
};

/**
 * Fetches plans created by the current authenticated user (basic info).
 */
export const fetchUserCreatedPlans = async (): Promise<Plan[]> => {
     const { data: { user }, error: authError } = await supabase.auth.getUser();
     if (authError || !user) { return []; }

     const selectString = `id, title, description, difficulty_level, duration_weeks, visibility, fork_count, like_count, created_at, updated_at`;
     const { data, error: fetchError } = await supabase
        .from('plans')
        .select(selectString)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) { throw new Error(fetchError.message); }
      return (data as Plan[]) || [];
};
/**
 * Fetches all plans associated with a specific team.
 */
export const fetchTeamPlans = async (teamId: string): Promise<Plan[]> => {
    if (!teamId) {
        throw new Error("Team ID is required to fetch team plans.");
    }

    const selectString = `id, title, description, difficulty_level, duration_weeks, visibility, fork_count, like_count, created_at, updated_at`;

    const { data, error } = await supabase
        .from('plans')
        .select(selectString)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`API Error fetchTeamPlans (Team ID: ${teamId}):`, error);
        throw new Error(error.message);
    }

    return (data as Plan[]) || [];
};


/**
 * Fetches discoverable plans for browsing (uses RPC).
 */
export const fetchDiscoverablePlans = async (page = 1, limit = 20): Promise<DiscoverablePlan[]> => {
    const offset = (page - 1) * limit;
    // Assuming the RPC 'get_discoverable_plans' exists and returns the correct structure
    const { data, error } = await supabase.rpc('get_discoverable_plans', {
        page_limit: limit, page_offset: offset,
    });
    if (error) {
        console.error("API Error fetchDiscoverablePlans:", error);
        throw new Error(error.message);
    }
    return (data as DiscoverablePlan[]) || [];
};


/**
 * Creates a new plan (top level only). Assumes DB trigger handles created_by.
 */
export const createPlan = async (planData: CreatePlanPayload): Promise<Plan> => {
    // Trigger handles created_by
    const { data: newPlan, error: insertError } = await supabase
        .from('plans')
        .insert(planData)
        .select() // Fetch the created record
        .single();

    if (insertError) { throw new Error(insertError.message); }
    if (!newPlan) { throw new Error("Failed to create plan or retrieve the created record."); }
    return newPlan as Plan;
};

/**
 * Updates the top-level details of an existing plan. Assumes RLS handles auth.
 */
export const updatePlan = async ({ planId, updateData }: { planId: string, updateData: UpdatePlanPayload }): Promise<Plan> => {
     // Ensure only updatable fields are included if UpdatePlanPayload is just Partial<CreatePlanPayload>
     const { title, description, difficulty_level, duration_weeks, sport, visibility, allow_public_forking } = updateData;
     const validUpdateData = { title, description, difficulty_level, duration_weeks, sport, visibility, allow_public_forking };
     // DB trigger handles updated_at

     const { data, error } = await supabase.from('plans')
        .update(validUpdateData)
        .eq('id', planId)
        .select() // Select updated basic data
        .single();

     if (error) { throw new Error(error.message); }
     if (!data) { throw new Error("Update failed or plan not found/unauthorized."); }
     return data as Plan;
};

/**
 * Deletes a plan and all its nested data (via CASCADE). Assumes RLS handles auth.
 */
export const deletePlan = async (planId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.from('plans').delete().eq('id', planId);
     if (error) { throw new Error(error.message); }
    return { success: true };
};

/**
 * Forks an existing plan (uses RPC).
 */
export const forkPlan = async (originalPlanId: string): Promise<string> => { // Returns new plan UUID
    // Assuming RPC 'fork_plan' exists and handles the deep copy correctly
    const { data, error } = await supabase.rpc('fork_plan', { original_plan_id: originalPlanId });

    if (error) { throw new Error(error.message); }
    // RPC should return the new UUID as string
    if (typeof data !== 'string' || !data) { throw new Error("Fork plan RPC did not return a valid UUID."); }
    return data;
};