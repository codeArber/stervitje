// FILE: /src/api/plan/useWorkoutLogging.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys';
import { startWorkout, finishWorkoutSession, logWorkout, fetchSessionLog } from './plan.endpoint'; // From general plan.endpoint
import type { LogWorkoutPayload } from '@/types/plan';
import type { SessionLog } from '@/types/index';

// --- QUERIES ---

/**
 * @description Hook for fetching a single session_log record.
 * @param sessionId The ID of the session_log.
 */
export const useSessionLogQuery = (sessionId: string | undefined) => {
  return useQuery<SessionLog | null, Error>({
    queryKey: planKeys.sessionLog(sessionId!),
    queryFn: () => fetchSessionLog(sessionId!),
    enabled: !!sessionId,
  });
};

// --- MUTATIONS ---

/**
 * @description Hook for the mutation to start a workout session.
 */
export const useStartWorkoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SessionLog, Error, string>({ // Returns SessionLog
    mutationFn: (planSessionId) => startWorkout(planSessionId),
    onSuccess: (newSessionLog) => {
      toast.success("Workout started!");
      queryClient.invalidateQueries({ queryKey: planKeys.sessionLog(newSessionLog.id) }); // Invalidate the specific new log
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate dashboard for active session status
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] }); // Invalidate current user profile if it shows active session
      // You might also want to invalidate related `planKeys.detail(planId)` if plan completion status is shown.
    },
    onError: (error) => {
      console.error("Error starting workout:", error);
      toast.error(`Failed to start workout: ${error.message}`);
    }
  });
};

/**
 * @description Hook for the mutation to finish a workout session.
 * Corresponds to the `finish_workout_session` RPC.
 */
export const useFinishWorkoutSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SessionLog, Error, string>({ // Returns the updated SessionLog
    mutationFn: (sessionLogId) => finishWorkoutSession(sessionLogId),
    onSuccess: (finishedSessionLog) => {
      toast.success("Workout completed!");
      // Invalidate the specific session log so any open view of it refreshes
      queryClient.invalidateQueries({ queryKey: planKeys.sessionLog(finishedSessionLog.id) });
      // Invalidate dashboard to reflect completed workout counts, active plan status change
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Invalidate user queries (e.g., logbook, plan history, performance summaries)
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // If the parent plan's status might change, invalidate it too
      if (finishedSessionLog.plan_id) {
          queryClient.invalidateQueries({ queryKey: planKeys.detail(finishedSessionLog.plan_id) });
      }
    },
    onError: (error) => {
      console.error("Error finishing workout:", error);
      toast.error(`Failed to finish workout: ${error.message}`);
    }
  });
};

/**
 * @description Hook for the mutation to log a completed workout.
 * On success, it invalidates dashboard and user queries to reflect the new history.
 */
export const useLogWorkoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, LogWorkoutPayload>({
    mutationFn: (payload) => logWorkout(payload),
    onSuccess: (_, variables) => {
      toast.success("Workout saved successfully!");
      // After a successful save, we want to refetch data that shows workout history
      // or reflects user stats.
      queryClient.invalidateQueries({ queryKey: planKeys.sessionLog(variables.session_log_id) }); // Invalidate the specific log
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // If the workout was part of a plan, invalidate that plan's details
      // (This would require `logWorkout` RPC to return the plan_id, or payload containing it)
      // For now, relies on dashboard/user invalidations.
    },
    onError: (error) => {
      toast.error(`Failed to save workout: ${error.message}`);
    }
  });
};