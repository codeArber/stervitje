// FILE: /src/api/plan/index.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPlanDetails,
    fetchRichPlanCards,
    fetchPlanPerformanceList,
    startPlanForUser,
    startWorkout,
    fetchTagsByType,
    fetchSessionLog, // RESTORED
    type PlanFilters,
} from './endpoint';
import type {
    FullPlan,
    PlanPerformanceEntry,
    RichPlanCardData,
    UserPlanStatus,
} from '@/types/plan';
import type { Tag } from '@/types/exercise';
import type { Tables } from '@/types/database.types';

const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'details'] as const,
  detail: (planId: string) => [...planKeys.details(), planId] as const,
  performanceLists: () => [...planKeys.all, 'performance', 'list'] as const,
  performanceList: (planId: string) => [...planKeys.performanceLists(), planId] as const,
  sessionLogs: () => [...planKeys.all, 'sessionLog'] as const, // RESTORED
  sessionLog: (sessionId: string) => [...planKeys.sessionLogs(), sessionId] as const, // RESTORED
};

const tagKeys = {
    all: ['tags'] as const,
    lists: () => [...tagKeys.all, 'list'] as const,
    list: (type: string) => [...tagKeys.lists(), { type }] as const,
};

// --- QUERIES ---

export const usePlanDetailsQuery = (planId: string | undefined) => {
  return useQuery<FullPlan | null, Error>({
    queryKey: planKeys.detail(planId!),
    queryFn: () => fetchPlanDetails(planId!),
    enabled: !!planId,
  });
};

export const useRichPlanCardsQuery = (filters: PlanFilters) => {
    return useQuery<RichPlanCardData[], Error>({
      queryKey: planKeys.list(filters),
      queryFn: () => fetchRichPlanCards(filters),
      placeholderData: (prev) => prev,
    });
};

export const usePlanPerformanceQuery = (planId: string | undefined) => {
    return useQuery<PlanPerformanceEntry[], Error>({
        queryKey: planKeys.performanceList(planId!),
        queryFn: () => fetchPlanPerformanceList(planId!),
        enabled: !!planId,
    });
};


/**
 * RESTORED: Hook for fetching a single session_log record.
 */
export const useSessionLogQuery = (sessionId: string | undefined) => {
    return useQuery<Tables<'session_logs'> | null, Error>({
        queryKey: planKeys.sessionLog(sessionId!),
        queryFn: () => fetchSessionLog(sessionId!),
        enabled: !!sessionId,
    });
};

// --- MUTATIONS ---

export const useStartPlanForUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UserPlanStatus, Error, string>({
    mutationFn: (planId) => startPlanForUser(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
  });
};

// Replace ONLY this hook in /src/api/plan/index.ts

/**
 * Hook for the mutation to start a workout session.
 */
export const useStartWorkoutMutation = () => {
  const queryClient = useQueryClient(); // We need the query client
  
  return useMutation<Tables<'session_logs'>, Error, string>({
    mutationFn: (planSessionId) => startWorkout(planSessionId),
    // THE FIX IS HERE: We need to define the mutation's behavior.
    onSuccess: () => {
      // After a workout is started, we should invalidate queries that
      // might show a list of workouts or the global active session.
      // A broad invalidation is safest here.
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate dashboard to be safe
    },
    onError: (error) => {
      // Log the error for debugging
      console.error("Error starting workout:", error);
    }
  });
};

export const useTagsQuery = (tagType: string) => {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.list(tagType),
    queryFn: () => fetchTagsByType(tagType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};