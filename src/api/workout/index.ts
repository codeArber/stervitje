// src/api/workout/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWorkoutDetails,
  startWorkoutSession,
  logWorkoutSet,
  finishWorkoutSession
} from './endpoint';
import type { WorkoutDetails, SessionLog, SetLog, NewSetLog } from '@/types/workout/index';

// --- Query Keys ---
const workoutKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  details: () => [...workoutKeys.all, 'details'] as const,
  detail: (logId: string) => [...workoutKeys.details(), logId] as const,
};

// --- Queries ---
/** Hook for fetching the complete details for a single historical workout log. */
export const useWorkoutDetailsQuery = (logId: string | undefined) => {
  return useQuery<WorkoutDetails | null, Error>({
    queryKey: workoutKeys.detail(logId!),
    queryFn: () => fetchWorkoutDetails(logId!),
    enabled: !!logId,
  });
};

// --- Mutations ---
/** Hook for starting a new workout session. */
export const useStartWorkoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SessionLog, Error, string | undefined>({
    mutationFn: (planSessionId) => startWorkoutSession(planSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
};

/** Hook for logging a single performed set. */
export const useLogSetMutation = () => {
  return useMutation<SetLog, Error, NewSetLog>({
    mutationFn: (newSet) => logWorkoutSet(newSet),
  });
};

/** Hook for finalizing a workout session. */
export const useFinishWorkoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SessionLog,
    Error,
    { logId: string; updates: { duration_minutes?: number; notes?: string; overall_feeling?: number } }
  >({
    mutationFn: ({ logId, updates }) => finishWorkoutSession(logId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
};