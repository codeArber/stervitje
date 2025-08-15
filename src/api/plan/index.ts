// FILE: /api/plan/index.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as planApi from './endpoint';
import type { Plan } from '@/types/index';
import type {
  PlanDetails,
  NewPlan,
  PlanWithStats,
  AddSessionPayload,
  AddExercisePayload,
  AddSetPayload
} from '@/types/plan/index';
import { startUserPlan } from './endpoint';

const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: any) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'details'] as const,
  detail: (planId: string) => [...planKeys.details(), planId] as const,
};

// --- Read Hooks (Queries) ---

export const useFilteredPlansQuery = (filters: any) => {
  return useQuery<PlanWithStats[], Error>({
    queryKey: planKeys.list(filters),
    queryFn: () => planApi.fetchFilteredPlans(filters),
  });
};

export const usePlanDetailsQuery = (planId: string | undefined) => {
  return useQuery<PlanDetails | null, Error>({
    queryKey: planKeys.detail(planId!),
    queryFn: () => planApi.fetchPlanDetails(planId!),
    enabled: !!planId,
  });
};


/**
 * **NEW:** Hook for starting a plan for the current user.
 */
export const useStartUserPlanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { planId: string }>({
    mutationFn: ({ planId }) => startUserPlan(planId),
    onSuccess: (_, variables) => {
      // After starting a plan, we must refetch the user's own profile
      // details, as their "active_plan" has now changed.
      queryClient.invalidateQueries({ queryKey: ['user', 'details'] });
      // Also refetch this plan's details to update performance stats.
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
    },
  });
};

// --- Write Hooks (Mutations) ---

export const useCreatePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<Plan, Error, Pick<NewPlan, 'title' | 'description'>>({
        mutationFn: (newPlanData) => planApi.createPlan(newPlanData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
};

// --- Plan Editing Mutation Hooks ---

// A helper function to manage invalidating the plan detail query after any edit
const usePlanEditMutation = (mutationFn: (payload: any) => Promise<any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      if (variables.planId) {
        queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
      }
    },
    onError: (error) => {
      console.error("Plan editing error:", error.message);
    },
  });
};

// ADD Hooks
export const useAddSessionMutation = () => usePlanEditMutation((payload: { planId: string } & AddSessionPayload) => planApi.addSession(payload));
export const useAddExerciseMutation = () => usePlanEditMutation((payload: { planId: string } & AddExercisePayload) => planApi.addExerciseToSession(payload));
export const useAddSetMutation = () => usePlanEditMutation((payload: { planId: string } & AddSetPayload) => planApi.addSetToExercise(payload));

// DELETE Hooks
export const useDeleteSessionMutation = () => usePlanEditMutation((payload: { planId: string, sessionId: string }) => planApi.deleteSession(payload.sessionId));
export const useDeleteExerciseMutation = () => usePlanEditMutation((payload: { planId: string, planSessionExerciseId: string }) => planApi.deleteExerciseFromSession(payload.planSessionExerciseId));
export const useDeleteSetMutation = () => usePlanEditMutation((payload: { planId: string, setId: string }) => planApi.deleteSetFromExercise(payload.setId));

