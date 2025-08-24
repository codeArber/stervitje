// FILE: src/api/performance/index.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchPlanPerformanceDetails, fetchUserLogbook, fetchUserPlanPerformanceList, fetchUserWorkoutDates, setGoalBaseline } from './endpoint';
import type { LogbookEntry, PlanPerformanceDetails, UserPlanPerformanceData, UserWorkoutDate } from '@/types/performance'; // Import from new performance types file
import { queryClient } from '@/lib/query-client';
import { toast } from 'sonner';

// --- Query Keys ---
const performanceKeys = {
  all: ['performance'] as const,
  lists: () => [...performanceKeys.all, 'list'] as const,
  list: (userId: string) => [...performanceKeys.lists(), { userId }] as const,
  dates: () => [...performanceKeys.all, 'dates'] as const,
  dateList: (userId: string) => [...performanceKeys.dates(), { userId }] as const, // Consistent key structure
  logbooks: () => [...performanceKeys.all, 'logbook'] as const,
  logbook: (userId: string) => [...performanceKeys.logbooks(), { userId }] as const, // Consistent key structure
  details: () => [...performanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...performanceKeys.details(), id] as const, // Consistent key structure
};


// --- Hooks ---

/**
 * @description Hook to fetch the performance summary list for all of a user's plans.
 * @param userId The ID of the user. Hook is disabled if userId is not provided.
 */
export const useUserPlanPerformanceListQuery = (userId: string | undefined) => {
  return useQuery<UserPlanPerformanceData[], Error>({
    queryKey: performanceKeys.list(userId!),
    queryFn: () => fetchUserPlanPerformanceList(userId!),
    enabled: !!userId,
  });
};

/**
 * @description Hook to fetch the list of all workout dates for a user, for use in a heatmap.
 * @param userId The ID of the user.
 */
export const useUserWorkoutDatesQuery = (userId: string | undefined) => {
    return useQuery<UserWorkoutDate[], Error>({ // Use UserWorkoutDate[] here
        queryKey: performanceKeys.dateList(userId!),
        queryFn: () => fetchUserWorkoutDates(userId!),
        enabled: !!userId,
    });
};

/**
 * @description Hook to fetch a user's workout logbook.
 * @param userId The ID of the user.
 */
export const useUserLogbookQuery = (userId: string | undefined) => {
  return useQuery<LogbookEntry[], Error>({
    queryKey: performanceKeys.logbook(userId!),
    queryFn: () => fetchUserLogbook(userId!),
    enabled: !!userId,
  });
};

/**
 * @description Hook for the mutation to set a user's baseline for a specific plan goal.
 * @param userId The ID of the user, used for query invalidation.
 */
export const useSetGoalBaselineMutation = (userId: string | undefined) => { // userId can be undefined if component unmounts
  return useMutation<void, Error, { progressId: string; baselineValue: number }>({
    mutationFn: (payload) => setGoalBaseline(payload),
    onSuccess: () => {
      toast.success("Baseline saved! Your goal is now active.");
      // Invalidate the main performance list to refetch the updated goal status
      if (userId) { // Only invalidate if userId is defined
        queryClient.invalidateQueries({ queryKey: performanceKeys.list(userId) });
        queryClient.invalidateQueries({ queryKey: performanceKeys.detail('*') }); // Invalidate all plan performance details
      }
    },
    onError: (error) => {
      toast.error(`Failed to save baseline: ${error.message}`);
    }
  });
};

/**
 * @description Hook to fetch detailed performance data for a specific user plan status, including goal progress.
 * @param userPlanStatusId The ID of the `user_plan_status` record.
 */
export const usePlanPerformanceDetailsQuery = (userPlanStatusId: string | undefined) => {
  return useQuery<PlanPerformanceDetails | null, Error>({
    queryKey: performanceKeys.detail(userPlanStatusId!),
    queryFn: () => fetchPlanPerformanceDetails(userPlanStatusId!),
    enabled: !!userPlanStatusId,
  });
};