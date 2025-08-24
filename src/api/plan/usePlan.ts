// FILE: /src/api/plan/usePlan.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys, tagKeys } from './queryKeys'; // Import centralized query keys
import {
  fetchPlanDetails,
  fetchRichPlanCards,
  fetchPlanPerformanceList,
  startPlanForUser,
  fetchTagsByType,
  createBasicPlan,
} from './plan.endpoint'; // Import from specific endpoint file
import type {
  FullPlan, PlanFilters, FilteredPlanRich, CreateBasicPlanPayload,
  PlanPerformanceEntry, UserPlanStatus, UserBaseline
} from '@/types/plan';
import type { Tag } from '@/types/index';
import type { Plan } from '@/types/index'; // Import base Plan type
import { startPlanWithBaselines } from './endpoint';

// --- QUERIES ---

/**
 * @description Hook for fetching the complete, aggregated details for a single plan.
 * @param planId The ID of the plan.
 */
export const usePlanDetailsQuery = (planId: string | undefined) => {
  return useQuery<FullPlan | null, Error>({
    queryKey: planKeys.detail(planId!),
    queryFn: () => fetchPlanDetails(planId!),
    enabled: !!planId,
  });
};

/**
 * @description Hook for fetching rich, analytical data for plan cards on the explore page.
 * @param filters Filters for the plan list.
 */
export const useRichPlanCardsQuery = (filters: PlanFilters) => {
  return useQuery<FilteredPlanRich[], Error>({
    queryKey: planKeys.list(filters),
    queryFn: () => fetchRichPlanCards(filters),
    placeholderData: (prev) => prev, // Useful for infinite scrolling/lists
  });
};

/**
 * @description Hook for fetching the performance leaderboard for a specific plan.
 * @param planId The ID of the plan.
 */
export const usePlanPerformanceQuery = (planId: string | undefined) => {
  return useQuery<PlanPerformanceEntry[], Error>({
    queryKey: planKeys.performanceList(planId!),
    queryFn: () => fetchPlanPerformanceList(planId!),
    enabled: !!planId,
  });
};

/**
 * @description Hook for fetching all tags of a specific type (e.g., 'equipment').
 * @param tagType The type of tags to fetch.
 */
export const useTagsQuery = (tagType: string) => {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.list(tagType),
    queryFn: () => fetchTagsByType(tagType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// --- MUTATIONS ---

/**
 * @description Hook for creating an 'active' status record for the user and the given plan.
 */
export const useStartPlanForUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UserPlanStatus, Error, string>({
    mutationFn: (planId) => startPlanForUser(planId),
    onSuccess: (_, planId) => {
      toast.success("Plan started!");
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // To update active plan on dashboard
      queryClient.invalidateQueries({ queryKey: ['user', 'details'] }); // To update user profile with active plan
    },
    onError: (error) => {
      toast.error(`Failed to start plan: ${error.message}`);
    }
  });
};

/**
 * @description Hook for creating a new basic plan.
 */
export const useCreateBasicPlanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, CreateBasicPlanPayload>({
    mutationFn: (planData) => createBasicPlan(planData),
    onSuccess: (newPlan) => {
      toast.success(`Plan "${newPlan.title}" created!`);
      if (newPlan.team_id) {
        queryClient.invalidateQueries({ queryKey: planKeys.teamPlans(newPlan.team_id) });
        queryClient.invalidateQueries({ queryKey: ['teams', 'details', newPlan.team_id] });
      }
      queryClient.invalidateQueries({ queryKey: planKeys.lists() }); // Invalidate filtered plan lists
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] }); // Invalidate current user (for created plans list)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate dashboard
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    }
  });
};

/**
 * @description Hook for starting a plan for a user with initial baseline values for goals.
 */
export const useStartPlanWithBaselinesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<UserPlanStatus, Error, { planId: string; baselines: UserBaseline[] }>({
        mutationFn: (variables) => startPlanWithBaselines(variables.planId, variables.baselines),
        onSuccess: (data, variables) => {
            toast.success("Plan started with baselines!");
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // To update active plan on dashboard
            queryClient.invalidateQueries({ queryKey: ['user', 'details'] }); // To update user profile with active plan
        },
        onError: (error) => {
          toast.error(`Failed to start plan with baselines: ${error.message}`);
        }
    });
};