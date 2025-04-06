// src/api/schedule/index.ts
import { useQuery } from '@tanstack/react-query';
import * as scheduleApi from './endpoint';
import type { TodayPlanSummary } from '@/types/scheduleTypes'; // Adjust path
import { useSession } from '@supabase/auth-helpers-react';

// Define query keys for the schedule data
export const scheduleKeys = {
    all: ['schedule'] as const,
    todaySummary: (userId: string | undefined) => [...scheduleKeys.all, 'todaySummary', userId] as const,
};

/**
 * Hook to fetch the summary of plan days scheduled for the current user today.
 * Returns an array of TodayPlanSummary objects or an empty array.
 */
export const useGetTodaysPlanSummary = (userId: string) => {

    return useQuery<TodayPlanSummary[], Error>({
        // Use a query key that includes the user ID to ensure data is specific
        // and refetched if the user changes.
        queryKey: scheduleKeys.todaySummary(userId),

        // The function that will be called to fetch the data
        queryFn: scheduleApi.getTodaysPlanSummary,

        // Only run the query if the session has loaded AND we have a user ID.
        // This prevents unnecessary calls while logging in or if logged out.
        enabled: !!userId,

        // Optional: Configure how often data is considered fresh or refetched
        // staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        // refetchOnWindowFocus: true, // Refetch when browser tab is focused
    });
};