// src/api/workout-logs/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as workoutLogsApi from './endpoint';
import type { SessionLog, SetLog } from '@/types/index';

// --- Query Keys ---
const workoutLogKeys = {
  all: ['workoutLogs'] as const,
  sessionLogs: () => [...workoutLogKeys.all, 'sessionLogs'] as const,
  sessionLogsByUser: (userId: string) => [...workoutLogKeys.all, 'sessionLogs', 'byUser', userId] as const,
  sessionLogById: (id: string) => [...workoutLogKeys.all, 'sessionLogs', 'byId', id] as const,
  setLogs: () => [...workoutLogKeys.all, 'setLogs'] as const,
  setLogsByExerciseLog: (exerciseLogId: string) => [...workoutLogKeys.all, 'setLogs', 'byExerciseLog', exerciseLogId] as const,
  setLogById: (id: string) => [...workoutLogKeys.all, 'setLogs', 'byId', id] as const,
};

// --- Hooks ---

// --- Session Log Operations ---

/** Hook for fetching all session logs */
export const useFetchSessionLogs = () => {
  return useQuery<SessionLog[], Error>({
    queryKey: workoutLogKeys.sessionLogs(),
    queryFn: workoutLogsApi.fetchSessionLogs,
  });
};

/** Hook for fetching session logs by user ID */
export const useFetchSessionLogsByUserId = (userId: string) => {
  return useQuery<SessionLog[], Error>({
    queryKey: workoutLogKeys.sessionLogsByUser(userId),
    queryFn: () => workoutLogsApi.fetchSessionLogsByUserId(userId),
    enabled: !!userId,
  });
};

/** Hook for fetching a single session log by ID */
export const useFetchSessionLogById = (logId: string) => {
  return useQuery<SessionLog | null, Error>({
    queryKey: workoutLogKeys.sessionLogById(logId),
    queryFn: () => workoutLogsApi.fetchSessionLogById(logId),
    enabled: !!logId,
  });
};

/** Hook for creating a new session log */
export const useCreateSessionLog = () => {
  const queryClient = useQueryClient();
  return useMutation<SessionLog, Error, Omit<SessionLog, 'id' | 'created_at'>>({
    mutationFn: workoutLogsApi.createSessionLog,
    onSuccess: (newLog) => {
      console.log('Session log created successfully:', newLog);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogs() });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogsByUser(newLog.user_id) });
    },
  });
};

/** Hook for updating a session log */
export const useUpdateSessionLog = () => {
  const queryClient = useQueryClient();
  return useMutation<SessionLog, Error, { logId: string; payload: Partial<Omit<SessionLog, 'id' | 'created_at' | 'user_id'>> }>({
    mutationFn: ({ logId, payload }) => workoutLogsApi.updateSessionLog(logId, payload),
    onSuccess: (updatedLog, variables) => {
      console.log(`Session log ${variables.logId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogs() });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogsByUser(updatedLog.user_id) });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogById(variables.logId) });
    },
  });
};

/** Hook for deleting a session log */
export const useDeleteSessionLog = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: workoutLogsApi.deleteSessionLog,
    onSuccess: (data, deletedLogId) => {
      console.log(`Session log ${deletedLogId} deleted.`);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.sessionLogs() });
    },
  });
};

// --- Set Log Operations ---

/** Hook for fetching all set logs */
export const useFetchSetLogs = () => {
  return useQuery<SetLog[], Error>({
    queryKey: workoutLogKeys.setLogs(),
    queryFn: workoutLogsApi.fetchSetLogs,
  });
};

/** Hook for fetching set logs by exercise log ID */
export const useFetchSetLogsByExerciseLogId = (exerciseLogId: string) => {
  return useQuery<SetLog[], Error>({
    queryKey: workoutLogKeys.setLogsByExerciseLog(exerciseLogId),
    queryFn: () => workoutLogsApi.fetchSetLogsByExerciseLogId(exerciseLogId),
    enabled: !!exerciseLogId,
  });
};

/** Hook for fetching a single set log by ID */
export const useFetchSetLogById = (logId: string) => {
  return useQuery<SetLog | null, Error>({
    queryKey: workoutLogKeys.setLogById(logId),
    queryFn: () => workoutLogsApi.fetchSetLogById(logId),
    enabled: !!logId,
  });
};

/** Hook for creating a new set log */
export const useCreateSetLog = () => {
  const queryClient = useQueryClient();
  return useMutation<SetLog, Error, Omit<SetLog, 'id' | 'created_at'>>({
    mutationFn: workoutLogsApi.createSetLog,
    onSuccess: (newLog) => {
      console.log('Set log created successfully:', newLog);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogs() });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogsByExerciseLog(newLog.exercise_log_id) });
    },
  });
};

/** Hook for updating a set log */
export const useUpdateSetLog = () => {
  const queryClient = useQueryClient();
  return useMutation<SetLog, Error, { logId: string; payload: Partial<Omit<SetLog, 'id' | 'created_at' | 'exercise_log_id'>> }>({
    mutationFn: ({ logId, payload }) => workoutLogsApi.updateSetLog(logId, payload),
    onSuccess: (updatedLog, variables) => {
      console.log(`Set log ${variables.logId} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogs() });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogsByExerciseLog(updatedLog.exercise_log_id) });
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogById(variables.logId) });
    },
  });
};

/** Hook for deleting a set log */
export const useDeleteSetLog = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: workoutLogsApi.deleteSetLog,
    onSuccess: (data, deletedLogId) => {
      console.log(`Set log ${deletedLogId} deleted.`);
      queryClient.invalidateQueries({ queryKey: workoutLogKeys.setLogs() });
    },
  });
};
