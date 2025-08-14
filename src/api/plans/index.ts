// src/api/plans/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as plansApi from './endpoint';
import type { Plan, PlansPayload } from '@/types/index';

// --- Query Keys ---
const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
};

// --- Hooks ---

/** Hook for fetching all plans */
export const useFetchPlans = () => {
  return useQuery<Plan[], Error>({
    queryKey: planKeys.lists(),
    queryFn: plansApi.fetchPlans,
  });
};

/** Hook for fetching a single plan by ID */
export const useFetchPlanById = (planId: string | undefined | null) => {
  return useQuery<Plan | null, Error>({
    queryKey: planKeys.detail(planId!),
    queryFn: () => plansApi.fetchPlanById(planId!),
    enabled: !!planId,
  });
};

/** Hook for creating a new plan */
export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, PlansPayload>({
    mutationFn: plansApi.createPlan,
    onSuccess: (newPlan) => {
      console.log('Plan created successfully:', newPlan);
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.setQueryData(planKeys.detail(newPlan.id), newPlan);
    },
  });
};

/** Hook for updating a plan */
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, { planId: string; payload: Partial<PlansPayload> }>({
    mutationFn: ({ planId, payload }) => plansApi.updatePlan(planId, payload),
    onSuccess: (updatedPlan, variables) => {
      console.log(`Plan ${variables.planId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.setQueryData(planKeys.detail(variables.planId), updatedPlan);
    },
  });
};

/** Hook for deleting a plan */
export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: plansApi.deletePlan,
    onSuccess: (data, deletedPlanId) => {
      console.log(`Plan ${deletedPlanId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(deletedPlanId) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
};
