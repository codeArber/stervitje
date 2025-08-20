// FILE: /src/api/plan/index.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlanDetails,
  fetchRichPlanCards,
  fetchPlanPerformanceList,
  startPlanForUser,
  startWorkout,
  fetchTagsByType,
  fetchSessionLog,
  createBasicPlan,
  addPlanWeek,
  updatePlanWeek,
  deletePlanWeek,
  addPlanDay,
  // --- FIX: Add missing imports for update/delete day endpoints ---
  updatePlanDay,
  deletePlanDay,
  addPlanSession,
  updatePlanSession,
  deletePlanSession,
  PlanFilters,
  addPlanSessionExercise,
  updatePlanSessionExercise,
  deletePlanSessionExercise,
  addPlanSessionExerciseSet,
  updatePlanSessionExerciseSet,
  deletePlanSessionExerciseSet,
  savePlanChanges,
  savePlanHierarchy,
  logWorkout,
  PlanGoalPayload,
  addPlanGoal,
  updatePlanGoal,
  deletePlanGoal,
  fetchPendingBaselinesForSession,
  PendingBaselineGoal,
  PlanGoalWithExercise,
  fetchPlanGoals,
  UserBaseline,
  startPlanWithBaselines,
  PlanGoalWithExerciseDetails,
} from './endpoint';
import type {
  AddPlanDayPayload,
  AddPlanWeekPayload,
  DeletePlanSessionPayload,
  DeletePlanWeekPayload,
  FullPlan,
  Plan,
  PlanDay,
  PlanPerformanceEntry,
  PlanSession,
  PlanWeek,
  RichPlanCardData,
  UpdatePlanSessionPayload,
  UpdatePlanWeekPayload,
  UserPlanStatus,
  // --- FIX: Add missing imports for day payloads ---
  UpdatePlanDayPayload,
  DeletePlanDayPayload,
  AddPlanSessionPayload,
  PlanExercise,
  AddPlanSessionExercisePayload,
  UpdatePlanSessionExercisePayload,
  DeletePlanSessionExercisePayload,
  AddPlanSessionExerciseSetPayload,
  PlanSet,
  UpdatePlanSessionExerciseSetPayload,
  DeletePlanSessionExerciseSetPayload,
  PlanHierarchy,
  LogWorkoutPayload,
} from '@/types/plan';
import type { Tag } from '@/types/exercise';
import type { Tables } from '@/types/database.types';
import { toast } from 'sonner';
import { PlanChangeset } from '@/utils/plan-diff';

const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'details'] as const,
  detail: (planId: string) => [...planKeys.details(), planId] as const,
  performanceLists: () => [...planKeys.all, 'performance', 'list'] as const,
  performanceList: (planId: string) => [...planKeys.performanceLists(), planId] as const,
  sessionLogs: () => [...planKeys.all, 'sessionLog'] as const,
  sessionLog: (sessionId: string) => [...planKeys.sessionLogs(), sessionId] as const,
  teamPlans: (teamId: string) => [...planKeys.all, 'team', teamId] as const,
  planWeeks: (planId: string) => [...planKeys.detail(planId), 'weeks'] as const, // Key for specific plan's weeks
  planDays: (weekId: string) => [...planKeys.all, 'week', weekId, 'days'] as const, // Key for specific week's days
  planSessions: (dayId: string) => [...planKeys.all, 'day', dayId, 'sessions'] as const,
  // New keys for plan session exercises and sets
  planSessionExercises: (sessionId: string) => [...planKeys.all, 'session', sessionId, 'exercises'] as const,
  planSessionExerciseSets: (exerciseId: string) => [...planKeys.all, 'exercise', exerciseId, 'sets'] as const,
  pendingBaselines: (sessionId: string) => [...planKeys.all, 'pending-baselines', sessionId] as const,
  goals: (planId: string) => [...planKeys.all, 'goals', planId] as const,
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
 * Hook for fetching a single session_log record.
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

/**
 * Hook for the mutation to start a workout session.
 */
export const useStartWorkoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Tables<'session_logs'>, Error, string>({
    mutationFn: (planSessionId) => startWorkout(planSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error("Error starting workout:", error);
    }
  });
};

/**
 * Hook for the mutation to log a completed workout.
 * On success, it invalidates dashboard and user queries to reflect the new history.
 */
export const useLogWorkoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LogWorkoutPayload) => logWorkout(payload),
    onSuccess: () => {
      // After a successful save, we want to refetch data that shows workout history
      // or reflects user stats. The dashboard is a great catch-all for this.
      toast.success("Workout saved successfully!");
      
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate any user-specific queries
      
      // We don't need to invalidate the specific plan details here unless it shows
      // completion status, but invalidating the dashboard is generally enough.
    },
    onError: (error) => {
      // The toast is handled in the component, but we can log the error.
      toast.error(`Failed to save workout: ${error.message}`);
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

export const useCreateBasicPlanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, {
    p_title: string;
    p_description?: string | null;
    p_difficulty_level?: number | null;
    p_private?: boolean | null;
    p_team_id?: string | null;
  }>({
    mutationFn: (planData) => createBasicPlan(planData),
    onSuccess: (newPlan) => {
      toast.success(`Plan "${newPlan.title}" created!`);
      if (newPlan.team_id) {
        queryClient.invalidateQueries({ queryKey: planKeys.teamPlans(newPlan.team_id) });
        queryClient.invalidateQueries({ queryKey: ['teams', 'details', newPlan.team_id] });
      }
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    }
  });
};

export const useAddPlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, AddPlanWeekPayload>({
    mutationFn: (payload) => addPlanWeek(payload),
    onSuccess: (newWeek) => {
      toast.success(`Week ${newWeek.week_number} added!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newWeek.plan_id) });
    },
    onError: (error) => {
      toast.error(`Failed to add week: ${error.message}`);
    }
  });
};

/**
 * Hook for updating an existing plan week.
 */
export const useUpdatePlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, UpdatePlanWeekPayload>({
    mutationFn: (payload) => updatePlanWeek(payload),
    onSuccess: (updatedWeek) => {
      toast.success(`Week ${updatedWeek.week_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(updatedWeek.plan_id) });
    },
    onError: (error) => {
      toast.error(`Failed to update week: ${error.message}`);
    }
  });
};

/**
 * Hook for deleting a plan week.
 */
export const useDeletePlanWeekMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanWeekPayload>({
    mutationFn: (payload) => deletePlanWeek(payload),
    onSuccess: (_, deletedWeekPayload) => {
      toast.success(`Week deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
    onError: (error) => {
      toast.error(`Failed to delete week: ${error.message}`);
    }
  });
};

/**
 * Hook for adding a new plan day.
 */
export const useAddPlanDayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, AddPlanDayPayload>({
    mutationFn: (payload) => addPlanDay(payload),
    onSuccess: (newDay) => {
      toast.success(`Day ${newDay.day_number} added!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newDay.plan_week_id.split('-')[0]) });
      queryClient.invalidateQueries({ queryKey: planKeys.planDays(newDay.plan_week_id) });
    },
    onError: (error) => {
      toast.error(`Failed to add day: ${error.message}`);
    }
  });
};

/**
 * NEW: Hook for updating an existing plan day.
 */
export const useUpdatePlanDayMutation = () => { // <--- ADDED HOOK
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, UpdatePlanDayPayload>({
    mutationFn: (payload) => updatePlanDay(payload),
    onSuccess: (updatedDay) => {
      toast.success(`Day ${updatedDay.day_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(updatedDay.plan_week_id.split('-')[0]) });
      queryClient.invalidateQueries({ queryKey: planKeys.planDays(updatedDay.plan_week_id) });
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Fallback
    },
    onError: (error) => {
      toast.error(`Failed to update day: ${error.message}`);
    }
  });
};

/**
 * NEW: Hook for deleting a plan day.
 */
export const useDeletePlanDayMutation = () => { // <--- ADDED HOOK
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanDayPayload>({
    mutationFn: (payload) => deletePlanDay(payload),
    onSuccess: (_, deletedDayPayload) => {
      toast.success(`Day deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete day: ${error.message}`);
    }
  });
};

export const useUpdatePlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, UpdatePlanSessionPayload>({
    mutationFn: (payload) => updatePlanSession(payload),
    onSuccess: (updatedSession) => {
      toast.success(`Session ${updatedSession.order_index} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.invalidateQueries({ queryKey: planKeys.planSessions(updatedSession.plan_day_id) });
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    }
  });
};

/**
 * NEW: Hook for deleting a plan session.
 */
export const useDeletePlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionPayload>({
    mutationFn: (payload) => deletePlanSession(payload),
    onSuccess: (_, deletedSessionPayload) => {
      toast.success(`Session deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    }
  });
};



/**
 * Hook for adding a new plan day.
 */
export const useAddPlanSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, AddPlanSessionPayload>({
    mutationFn: (payload) => addPlanSession(payload),
    onSuccess: (newSession) => {
      toast.success(`Session ${newSession.order_index} added!`);
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newSession.plan_day_id.split('-')[0]) });
      queryClient.invalidateQueries({ queryKey: planKeys.planSessions(newSession.plan_day_id) });
    },
    onError: (error) => {
      toast.error(`Failed to add session: ${error.message}`);
    }
  });
};
export const useAddPlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanExercise, Error, AddPlanSessionExercisePayload>({ // <--- Return type is PlanExercise
    mutationFn: (payload) => addPlanSessionExercise(payload),
    onSuccess: (newExercise) => { // newExercise is now PlanExercise
      toast.success(`Exercise "${newExercise.exercise_details.name}" added!`); // This should now work
      // Invalidate the full plan details query
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newExercise.plan_session_id.split('-')[0]) }); // This assumes plan_session_id contains plan_id prefix (which it doesn't in your schema)
      // For now, let's use a broad invalidation or assume the parent will handle it.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
      // Alternatively, the RPC could return the planId, or you could add it to payload.
      // Since the parent PlanEditPage refetches, it will eventually update.
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExercises(newExercise.plan_session_id) }); // More specific
    },
    onError: (error) => {
      toast.error(`Failed to add exercise: ${error.message}`);
    }
  });
};
/**
 * NEW: Hook for updating an existing plan session exercise.
 */
export const useUpdatePlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanExercise, Error, UpdatePlanSessionExercisePayload>({
    mutationFn: (payload) => updatePlanSessionExercise(payload),
    onSuccess: (updatedExercise) => {
      toast.success(`Exercise "${updatedExercise.exercise_details.name}" updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExercises(updatedExercise.plan_session_id) });
    },
    onError: (error) => {
      toast.error(`Failed to update exercise: ${error.message}`);
    }
  });
};

/**
 * NEW: Hook for deleting a plan session exercise.
 */
export const useDeletePlanSessionExerciseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionExercisePayload>({
    mutationFn: (payload) => deletePlanSessionExercise(payload),
    onSuccess: (_, deletedExercisePayload) => {
      toast.success(`Exercise deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete exercise: ${error.message}`);
    }
  });
};

export const useAddPlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSet, Error, AddPlanSessionExerciseSetPayload>({
    mutationFn: (payload) => addPlanSessionExerciseSet(payload),
    onSuccess: (newSet) => {
      toast.success(`Set ${newSet.set_number} added!`);
      // Invalidate the full plan details query (will cause entire hierarchy to refetch)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(newSet.plan_session_exercise_id.split('-')[0]) }); // This still needs plan_id
      // For now, simpler invalidation.
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExerciseSets(newSet.plan_session_exercise_id) });
    },
    onError: (error) => {
      toast.error(`Failed to add set: ${error.message}`);
    }
  });
};


export const useSavePlanChangesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeset: PlanChangeset) => savePlanChanges(changeset),
    onSuccess: (data, variables) => {
      toast.success("Plan saved successfully!");
      // After a successful save, we MUST refetch the plan details
      // to get the real database IDs and latest data.
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
    },
    onError: (error) => {
      // The toast is already handled in the component, but you can add more logic here.
      console.error("Save plan mutation error:", error);
    }
  });
};

/**
 * NEW: Hook for updating an existing plan session exercise set.
 */
export const useUpdatePlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSet, Error, UpdatePlanSessionExerciseSetPayload>({
    mutationFn: (payload) => updatePlanSessionExerciseSet(payload),
    onSuccess: (updatedSet) => {
      toast.success(`Set ${updatedSet.set_number} updated!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
      queryClient.invalidateQueries({ queryKey: planKeys.planSessionExerciseSets(updatedSet.plan_session_exercise_id) });
    },
    onError: (error) => {
      toast.error(`Failed to update set: ${error.message}`);
    }
  });
};

/**
 * NEW: Hook for deleting a plan session exercise set.
 */
export const useDeletePlanSessionExerciseSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeletePlanSessionExerciseSetPayload>({
    mutationFn: (payload) => deletePlanSessionExerciseSet(payload),
    onSuccess: (_, deletedSetPayload) => {
      toast.success(`Set deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: planKeys.all }); // Broad invalidation as a fallback
    },
    onError: (error) => {
      toast.error(`Failed to delete set: ${error.message}`);
    }
  });
};

export const useSavePlanHierarchyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { planId: string; hierarchy: PlanHierarchy }) => savePlanHierarchy(payload),
    onSuccess: (data, variables) => {
      // After a successful save, we MUST refetch the plan details.
      // This gets the real DB IDs for any new items and confirms the structure.
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
    },
    onError: (error) => {
      // The toast is handled in the component, but we can log here.
      console.error("Save plan hierarchy mutation error:", error);
    }
  });
};

// --- ADD THESE THREE NEW MUTATION HOOKS ---

export const useAddPlanGoalMutation = (planId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    // --- THIS LINE IS THE FIX ---
    // The `payload` is now correctly typed as our new, complete PlanGoalPayload
    mutationFn: (payload: PlanGoalPayload) => addPlanGoal(planId, payload),
    onSuccess: () => {
      toast.success("Goal added!");
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
    onError: (err) => toast.error(`Failed to add goal: ${err.message}`),
  });
};

export const useUpdatePlanGoalMutation = (planId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { goalId: string, payload: PlanGoalPayload }) => updatePlanGoal(variables.goalId, variables.payload),
    onSuccess: () => {
      toast.success("Goal updated!");
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
    onError: (err) => toast.error(`Failed to update goal: ${err.message}`),
  });
};

export const useDeletePlanGoalMutation = (planId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deletePlanGoal(goalId),
    onSuccess: () => {
      toast.success("Goal deleted!");
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
    onError: (err) => toast.error(`Failed to delete goal: ${err.message}`),
  });
};


// --- ADD NEW HOOK ---
export const usePendingBaselinesQuery = (planSessionId: string | undefined, options: { enabled: boolean }) => {
    return useQuery<PendingBaselineGoal[], Error>({
        queryKey: planKeys.pendingBaselines(planSessionId!),
        queryFn: () => fetchPendingBaselinesForSession(planSessionId!),
        enabled: !!planSessionId && options.enabled,
    });
};


// --- THIS HOOK NOW USES THE CORRECT TYPE ---
export const usePlanGoalsQuery = (planId: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery<PlanGoalWithExerciseDetails[], Error>({
        queryKey: planKeys.goals(planId!),
        queryFn: () => fetchPlanGoals(planId!),
        enabled: !!planId && (options?.enabled ?? true),
    });
};

export const useStartPlanWithBaselinesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { planId: string; baselines: UserBaseline[] }) => 
            startPlanWithBaselines(variables.planId, variables.baselines),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
        },
    });
};