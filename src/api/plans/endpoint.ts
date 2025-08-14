// src/api/plans/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { Plan } from '@/lib/supabase/types';
import { PlansPayload } from '@/types/index';

/** Fetches all plans */
export const fetchPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetchPlans:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Fetches a single plan by its ID */
export const fetchPlanById = async (planId: string): Promise<Plan | null> => {
  if (!planId) return null;

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Handle "not found" gracefully
      console.warn(`API Warning fetchPlanById: Plan ${planId} not found.`);
      return null;
    }
    console.error(`API Error fetchPlanById (ID: ${planId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Creates a new plan */
export const createPlan = async (payload: PlansPayload): Promise<Plan> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('plans')
    .insert({
      ...payload,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("API Error createPlan:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates an existing plan */
export const updatePlan = async (
  planId: string,
  payload: Partial<PlansPayload>
): Promise<Plan> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('plans')
    .update(payload)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updatePlan (ID: ${planId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a plan */
export const deletePlan = async (planId: string): Promise<{ success: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error(`API Error deletePlan (ID: ${planId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
