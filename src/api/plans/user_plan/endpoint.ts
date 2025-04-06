// src/api/user_plans/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { UserPlan } from '@/types/planTypes';
import { UserPlanWithPlanDetails } from '.';

// Assumed basic UserPlan type (adjust based on your actual type)

// Payload for creating a user plan assignment (user self-assigning)
// user_id will likely be implicitly set by RLS or defaulted via DB trigger/function to auth.uid()
// but sending it might be needed depending on exact RLS setup.
export interface CreateUserPlanPayload {
    user_id: string; // The user ID for the assignment
    plan_id: string; // The plan being assigned
    start_date?: string | null; // ISO Date string
    status?: 'active' | 'completed' | 'paused' | 'abandoned'; // Default usually 'active'
    privacy_level?: 'private' | 'team' | 'public'; // Default usually 'private'
}

// Payload for updating a user plan assignment
export type UpdateUserPlanPayload = Partial<Omit<CreateUserPlanPayload, 'user_id' | 'plan_id'>>;

/**
 * Creates a new user plan assignment (e.g., user starts a plan).
 * Assumes RLS policy handles authorization (e.g., user can only insert for their own user_id).
 */
export const createUserPlan = async (payload: CreateUserPlanPayload): Promise<UserPlan> => {
    const { data: newUserPlan, error } = await supabase
        .from('user_plans')
        .insert(payload)
        .select() // Fetch the newly created record
        .single();

    if (error) {
        console.error(`API Error createUserPlan for User ${payload.user_id}, Plan ${payload.plan_id}:`, error);
        throw new Error(error.message);
    }
    if (!newUserPlan) {
        throw new Error("Failed to create user plan assignment or retrieve the created record.");
    }
    return newUserPlan as UserPlan;
};

export const getUserPlans = async (userId: string): Promise<UserPlanWithPlanDetails[]> => {
    if (!userId) {
        console.warn("getUserPlans called without a userId.");
        return []; // Return empty if no user ID is provided
    }

    const { data, error } = await supabase
        .from('user_plans')
        .select(`
            *,
            plans (
                id,
                title,
                description,
                difficulty_level,
                duration_weeks,
                visibility
            )
        `) // Select all from user_plans and specific columns from related plans
        .eq('user_id', userId); // Filter by the user ID

    if (error) {
        console.error(`API Error getUserPlans for User ${userId}:`, error);
        throw new Error(error.message);
    }

    // Ensure data is not null and is an array before returning
    return data;
};

/**
 * Updates the details of an existing user plan assignment (status, dates, privacy).
 * Assumes RLS policy handles authorization (user can update their own assignment).
 */
export const updateUserPlan = async ({ userPlanId, updateData }: { userPlanId: string, updateData: UpdateUserPlanPayload }): Promise<UserPlan> => {
    // DB trigger likely handles updated_at if user_plans has one
    const { data: updatedUserPlan, error } = await supabase
        .from('user_plans')
        .update(updateData)
        .eq('id', userPlanId)
        .select() // Fetch the updated record
        .single();

    if (error) {
        console.error(`API Error updateUserPlan (ID: ${userPlanId}):`, error);
        throw new Error(error.message);
    }
    if (!updatedUserPlan) {
        throw new Error("Update failed or user plan assignment not found/unauthorized.");
    }
    return updatedUserPlan as UserPlan;
};

/**
 * Deletes a user plan assignment (e.g., user abandons a plan).
 * Assumes RLS policy handles authorization.
 */
export const deleteUserPlan = async (userPlanId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('user_plans')
        .delete()
        .eq('id', userPlanId);

    if (error) {
        console.error(`API Error deleteUserPlan (ID: ${userPlanId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};