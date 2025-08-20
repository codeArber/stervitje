// FILE: src/api/performance/index.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchPlanPerformanceDetails, fetchUserLogbook, fetchUserPlanPerformanceList, fetchUserWorkoutDates, setGoalBaseline } from './endpoint';
import type { LogbookEntry, PlanPerformanceDetails, UserPlanPerformanceData } from './endpoint';
import { queryClient } from '@/lib/query-client';
import { toast } from 'sonner';

// --- Query Keys ---
const performanceKeys = {
  all: ['performance'] as const,
  lists: () => [...performanceKeys.all, 'list'] as const,
  list: (userId: string) => [...performanceKeys.lists(), { userId }] as const,
  dates: () => [...performanceKeys.all, 'dates'] as const, // <-- NEW
  dateList: (userId: string) => [...performanceKeys.dates(), { userId }], // <-- NEW
  logbooks: () => [...performanceKeys.all, 'logbook'] as const, // <-- NEW
  logbook: (userId: string) => [...performanceKeys.logbooks(), { userId }], // <-- NEW
  details: () => [...performanceKeys.all, 'detail'] as const, // <-- NEW
  detail: (id: string) => [...performanceKeys.details(), id], // <-- NEW
};


// --- The Hook ---

/**
 * Hook to fetch the performance summary list for all of a user's plans.
 * @param userId The ID of the user. Hook is disabled if userId is not provided.
 */
export const useUserPlanPerformanceListQuery = (userId: string | undefined) => {
  return useQuery<UserPlanPerformanceData[], Error>({
    queryKey: performanceKeys.list(userId!),
    queryFn: () => fetchUserPlanPerformanceList(userId!),
    enabled: !!userId, // The query will only run if a userId is provided.
  });
};

/**
 * Hook to fetch the list of all workout dates for a user, for use in a heatmap.
 * @param userId The ID of the user.
 */
export const useUserWorkoutDatesQuery = (userId: string | undefined) => {
    return useQuery<{ workout_date: string }[], Error>({
        queryKey: performanceKeys.dateList(userId!),
        queryFn: () => fetchUserWorkoutDates(userId!),
        enabled: !!userId,
    });
};


// --- ADD THIS NEW HOOK ---
export const useUserLogbookQuery = (userId: string | undefined) => {
  return useQuery<LogbookEntry[], Error>({
    queryKey: performanceKeys.logbook(userId!),
    queryFn: () => fetchUserLogbook(userId!),
    enabled: !!userId,
  });
};

/**
 * Hook for the mutation to set a user's baseline for a specific plan goal.
 * @param userId The ID of the user, used for query invalidation.
 */
export const useSetGoalBaselineMutation = (userId: string) => {

  return useMutation({
    mutationFn: (payload: { progressId: string; baselineValue: number }) => setGoalBaseline(payload),
    onSuccess: () => {
      toast.success("Baseline saved! Your goal is now active.");
      // Invalidate the main performance list to refetch the updated goal status
      queryClient.invalidateQueries({ queryKey: performanceKeys.list(userId) });
      // You might also invalidate a more specific query for the plan drill-down page later
    },
    onError: (error) => {
      toast.error(`Failed to save baseline: ${error.message}`);
    }
  });
};

export const usePlanPerformanceDetailsQuery = (userPlanStatusId: string | undefined) => {
  return useQuery<PlanPerformanceDetails | null, Error>({
    queryKey: performanceKeys.detail(userPlanStatusId!),
    queryFn: () => fetchPlanPerformanceDetails(userPlanStatusId!),
    enabled: !!userPlanStatusId,
  });
};