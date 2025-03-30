// src/api/workouts/index.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, QueryKey } from '@tanstack/react-query';
import * as workoutsApi from './endpoint';
import type { WorkoutLog, WorkoutLogPayload } from '@/types'; // Define these types

// --- Query Keys ---
const workoutKeys = {
    all: ['workouts'] as const,
    history: () => [...workoutKeys.all, 'history'] as const, // Key for the current user's history
    // Add keys for specific logs if needed: details: (logId) => [...]
};

// --- Hooks ---

/** Hook for logging a workout session */
export const useLogWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation<string, Error, WorkoutLogPayload>({ // Return=UUID, Error, Variables=Payload
        mutationFn: workoutsApi.logWorkout,
        onSuccess: (newWorkoutLogId) => {
            console.log('Workout logged successfully, ID:', newWorkoutLogId);
            // Invalidate the workout history list to show the new entry
            // Using invalidate is often sufficient here as new logs usually appear at the top
            queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
        },
        onError: (error) => {
            console.error("Mutation Error useLogWorkout:", error);
             alert(`Log Workout Error: ${error.message}`);
        },
    });
};

/** Hook for fetching workout history (paginated) */
export const useInfiniteWorkoutHistory = (limit = 15) => {
    return useInfiniteQuery<WorkoutLog[], Error>({ // Specify return type
        queryKey: workoutKeys.history(),
        queryFn: ({ pageParam = 1 }) => workoutsApi.fetchWorkoutHistory(pageParam, limit),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === limit ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });
};

/** Hook for deleting a workout log */
export const useDeleteWorkoutLog = () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean }, Error, string>({ // Variable is workoutLogId
        mutationFn: workoutsApi.deleteWorkoutLog,
        onSuccess: (data, deletedWorkoutLogId) => {
             console.log(`Workout log ${deletedWorkoutLogId} deleted.`);
            // Invalidate history to remove the item
            queryClient.invalidateQueries({queryKey: workoutKeys.history() });
            // Optional: Faster UI update by removing manually from cache
            // queryClient.setQueryData<InfiniteData<WorkoutLog[]>>(workoutKeys.history(), (oldData) => {
            //     if (!oldData) return oldData;
            //     return {
            //         ...oldData,
            //         pages: oldData.pages.map(page => page.filter(log => log.id !== deletedWorkoutLogId)),
            //     };
            // });
        },
         onError: (error) => {
            console.error("Mutation Error useDeleteWorkoutLog:", error);
             alert(`Delete Workout Error: ${error.message}`);
        },
    });
}