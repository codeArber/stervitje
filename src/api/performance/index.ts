// FILE: src/api/performance/index.ts

import { useQuery } from '@tanstack/react-query';
import { fetchUserLogbook, fetchUserPlanPerformanceList, fetchUserWorkoutDates } from './endpoint';
import type { LogbookEntry, UserPlanPerformanceData } from './endpoint';

// --- Query Keys ---
const performanceKeys = {
  all: ['performance'] as const,
  lists: () => [...performanceKeys.all, 'list'] as const,
  list: (userId: string) => [...performanceKeys.lists(), { userId }] as const,
  dates: () => [...performanceKeys.all, 'dates'] as const, // <-- NEW
  dateList: (userId: string) => [...performanceKeys.dates(), { userId }], // <-- NEW
  logbooks: () => [...performanceKeys.all, 'logbook'] as const, // <-- NEW
  logbook: (userId: string) => [...performanceKeys.logbooks(), { userId }], // <-- NEW
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