// src/api/plan-hierarchy/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as planHierarchyApi from './endpoint';
import type { 
  PlanWeek, 
  PlanDay, 
  PlanSession, 
  PlanSessionExercise, 
  PlanSessionExerciseSet 
} from '@/types/index';

// --- Query Keys ---
const planHierarchyKeys = {
  all: ['planHierarchy'] as const,
  weeks: () => [...planHierarchyKeys.all, 'weeks'] as const,
  weeksByPlan: (planId: string) => [...planHierarchyKeys.all, 'weeks', 'byPlan', planId] as const,
  days: () => [...planHierarchyKeys.all, 'days'] as const,
  daysByWeek: (weekId: string) => [...planHierarchyKeys.all, 'days', 'byWeek', weekId] as const,
  sessions: () => [...planHierarchyKeys.all, 'sessions'] as const,
  sessionsByDay: (dayId: string) => [...planHierarchyKeys.all, 'sessions', 'byDay', dayId] as const,
  exercises: () => [...planHierarchyKeys.all, 'exercises'] as const,
  exercisesBySession: (sessionId: string) => [...planHierarchyKeys.all, 'exercises', 'bySession', sessionId] as const,
  sets: () => [...planHierarchyKeys.all, 'sets'] as const,
  setsByExercise: (exerciseId: string) => [...planHierarchyKeys.all, 'sets', 'byExercise', exerciseId] as const,
};

// --- Hooks ---

// --- Plan Week Operations ---

/** Hook for fetching all plan weeks */
export const useFetchPlanWeeks = () => {
  return useQuery<PlanWeek[], Error>({
    queryKey: planHierarchyKeys.weeks(),
    queryFn: planHierarchyApi.fetchPlanWeeks,
  });
};

/** Hook for fetching plan weeks by plan ID */
export const useFetchPlanWeeksByPlanId = (planId: string | undefined | null) => {
  return useQuery<PlanWeek[], Error>({
    queryKey: planHierarchyKeys.weeksByPlan(planId!),
    queryFn: () => planHierarchyApi.fetchPlanWeeksByPlanId(planId!),
    enabled: !!planId,
  });
};

/** Hook for creating a new plan week */
export const useCreatePlanWeek = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, Omit<PlanWeek, 'id'>>({
    mutationFn: planHierarchyApi.createPlanWeek,
    onSuccess: (newWeek) => {
      console.log('Plan week created successfully:', newWeek);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.weeks() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.weeksByPlan(newWeek.plan_id) });
    },
  });
};

/** Hook for updating a plan week */
export const useUpdatePlanWeek = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanWeek, Error, { weekId: string; payload: Partial<Omit<PlanWeek, 'id'>> }>({
    mutationFn: ({ weekId, payload }) => planHierarchyApi.updatePlanWeek(weekId, payload),
    onSuccess: (updatedWeek, variables) => {
      console.log(`Plan week ${variables.weekId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.weeks() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.weeksByPlan(updatedWeek.plan_id) });
    },
  });
};

/** Hook for deleting a plan week */
export const useDeletePlanWeek = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: planHierarchyApi.deletePlanWeek,
    onSuccess: (data, deletedWeekId) => {
      console.log(`Plan week ${deletedWeekId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.weeks() });
    },
  });
};

// --- Plan Day Operations ---

/** Hook for fetching all plan days */
export const useFetchPlanDays = () => {
  return useQuery<PlanDay[], Error>({
    queryKey: planHierarchyKeys.days(),
    queryFn: planHierarchyApi.fetchPlanDays,
  });
};

/** Hook for fetching plan days by week ID */
export const useFetchPlanDaysByWeekId = (weekId: string | undefined | null) => {
  return useQuery<PlanDay[], Error>({
    queryKey: planHierarchyKeys.daysByWeek(weekId!),
    queryFn: () => planHierarchyApi.fetchPlanDaysByWeekId(weekId!),
    enabled: !!weekId,
  });
};

/** Hook for creating a new plan day */
export const useCreatePlanDay = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, Omit<PlanDay, 'id'>>({
    mutationFn: planHierarchyApi.createPlanDay,
    onSuccess: (newDay) => {
      console.log('Plan day created successfully:', newDay);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.days() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.daysByWeek(newDay.plan_week_id) });
    },
  });
};

/** Hook for updating a plan day */
export const useUpdatePlanDay = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanDay, Error, { dayId: string; payload: Partial<Omit<PlanDay, 'id'>> }>({
    mutationFn: ({ dayId, payload }) => planHierarchyApi.updatePlanDay(dayId, payload),
    onSuccess: (updatedDay, variables) => {
      console.log(`Plan day ${variables.dayId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.days() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.daysByWeek(updatedDay.plan_week_id) });
    },
  });
};

/** Hook for deleting a plan day */
export const useDeletePlanDay = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: planHierarchyApi.deletePlanDay,
    onSuccess: (data, deletedDayId) => {
      console.log(`Plan day ${deletedDayId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.days() });
    },
  });
};

// --- Plan Session Operations ---

/** Hook for fetching all plan sessions */
export const useFetchPlanSessions = () => {
  return useQuery<PlanSession[], Error>({
    queryKey: planHierarchyKeys.sessions(),
    queryFn: planHierarchyApi.fetchPlanSessions,
  });
};

/** Hook for fetching plan sessions by day ID */
export const useFetchPlanSessionsByDayId = (dayId: string | undefined | null) => {
  return useQuery<PlanSession[], Error>({
    queryKey: planHierarchyKeys.sessionsByDay(dayId!),
    queryFn: () => planHierarchyApi.fetchPlanSessionsByDayId(dayId!),
    enabled: !!dayId,
  });
};

/** Hook for creating a new plan session */
export const useCreatePlanSession = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, Omit<PlanSession, 'id'>>({
    mutationFn: planHierarchyApi.createPlanSession,
    onSuccess: (newSession) => {
      console.log('Plan session created successfully:', newSession);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sessionsByDay(newSession.plan_day_id) });
    },
  });
};

/** Hook for updating a plan session */
export const useUpdatePlanSession = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSession, Error, { sessionId: string; payload: Partial<Omit<PlanSession, 'id'>> }>({
    mutationFn: ({ sessionId, payload }) => planHierarchyApi.updatePlanSession(sessionId, payload),
    onSuccess: (updatedSession, variables) => {
      console.log(`Plan session ${variables.sessionId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sessionsByDay(updatedSession.plan_day_id) });
    },
  });
};

/** Hook for deleting a plan session */
export const useDeletePlanSession = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: planHierarchyApi.deletePlanSession,
    onSuccess: (data, deletedSessionId) => {
      console.log(`Plan session ${deletedSessionId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sessions() });
    },
  });
};

// --- Plan Session Exercise Operations ---

/** Hook for fetching all plan session exercises */
export const useFetchPlanSessionExercises = () => {
  return useQuery<PlanSessionExercise[], Error>({
    queryKey: planHierarchyKeys.exercises(),
    queryFn: planHierarchyApi.fetchPlanSessionExercises,
  });
};

/** Hook for fetching plan session exercises by session ID */
export const useFetchPlanSessionExercisesBySessionId = (sessionId: string | undefined | null) => {
  return useQuery<PlanSessionExercise[], Error>({
    queryKey: planHierarchyKeys.exercisesBySession(sessionId!),
    queryFn: () => planHierarchyApi.fetchPlanSessionExercisesBySessionId(sessionId!),
    enabled: !!sessionId,
  });
};

/** Hook for creating a new plan session exercise */
export const useCreatePlanSessionExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSessionExercise, Error, Omit<PlanSessionExercise, 'id'>>({
    mutationFn: planHierarchyApi.createPlanSessionExercise,
    onSuccess: (newExercise) => {
      console.log('Plan session exercise created successfully:', newExercise);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.exercises() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.exercisesBySession(newExercise.plan_session_id) });
    },
  });
};

/** Hook for updating a plan session exercise */
export const useUpdatePlanSessionExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSessionExercise, Error, { exerciseId: string; payload: Partial<Omit<PlanSessionExercise, 'id'>> }>({
    mutationFn: ({ exerciseId, payload }) => planHierarchyApi.updatePlanSessionExercise(exerciseId, payload),
    onSuccess: (updatedExercise, variables) => {
      console.log(`Plan session exercise ${variables.exerciseId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.exercises() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.exercisesBySession(updatedExercise.plan_session_id) });
    },
  });
};

/** Hook for deleting a plan session exercise */
export const useDeletePlanSessionExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: planHierarchyApi.deletePlanSessionExercise,
    onSuccess: (data, deletedExerciseId) => {
      console.log(`Plan session exercise ${deletedExerciseId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.exercises() });
    },
  });
};

// --- Plan Session Exercise Set Operations ---

/** Hook for fetching all plan session exercise sets */
export const useFetchPlanSessionExerciseSets = () => {
  return useQuery<PlanSessionExerciseSet[], Error>({
    queryKey: planHierarchyKeys.sets(),
    queryFn: planHierarchyApi.fetchPlanSessionExerciseSets,
  });
};

/** Hook for fetching plan session exercise sets by exercise ID */
export const useFetchPlanSessionExerciseSetsByExerciseId = (exerciseId: string | undefined | null) => {
  return useQuery<PlanSessionExerciseSet[], Error>({
    queryKey: planHierarchyKeys.setsByExercise(exerciseId!),
    queryFn: () => planHierarchyApi.fetchPlanSessionExerciseSetsByExerciseId(exerciseId!),
    enabled: !!exerciseId,
  });
};

/** Hook for creating a new plan session exercise set */
export const useCreatePlanSessionExerciseSet = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSessionExerciseSet, Error, Omit<PlanSessionExerciseSet, 'id'>>({
    mutationFn: planHierarchyApi.createPlanSessionExerciseSet,
    onSuccess: (newSet) => {
      console.log('Plan session exercise set created successfully:', newSet);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sets() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.setsByExercise(newSet.plan_session_exercise_id) });
    },
  });
};

/** Hook for updating a plan session exercise set */
export const useUpdatePlanSessionExerciseSet = () => {
  const queryClient = useQueryClient();
  return useMutation<PlanSessionExerciseSet, Error, { setId: string; payload: Partial<Omit<PlanSessionExerciseSet, 'id'>> }>({
    mutationFn: ({ setId, payload }) => planHierarchyApi.updatePlanSessionExerciseSet(setId, payload),
    onSuccess: (updatedSet, variables) => {
      console.log(`Plan session exercise set ${variables.setId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sets() });
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.setsByExercise(updatedSet.plan_session_exercise_id) });
    },
  });
};

/** Hook for deleting a plan session exercise set */
export const useDeletePlanSessionExerciseSet = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: planHierarchyApi.deletePlanSessionExerciseSet,
    onSuccess: (data, deletedSetId) => {
      console.log(`Plan session exercise set ${deletedSetId} deleted.`);
      queryClient.invalidateQueries({ queryKey: planHierarchyKeys.sets() });
    },
  });
};
