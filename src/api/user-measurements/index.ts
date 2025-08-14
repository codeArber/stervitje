// src/api/user-measurements/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userMeasurementsApi from './endpoint';
import type { UserMeasurements } from '@/types/index';

// --- Query Keys ---
const userMeasurementKeys = {
  all: ['userMeasurements'] as const,
  lists: () => [...userMeasurementKeys.all, 'list'] as const,
  byUserId: (userId: string) => [...userMeasurementKeys.all, 'byUserId', userId] as const,
  details: () => [...userMeasurementKeys.all, 'detail'] as const,
  detail: (id: string) => [...userMeasurementKeys.details(), id] as const,
};

// --- Hooks ---

/** Hook for fetching all user measurements */
export const useFetchUserMeasurements = () => {
  return useQuery<UserMeasurements[], Error>({
    queryKey: userMeasurementKeys.lists(),
    queryFn: userMeasurementsApi.fetchUserMeasurements,
  });
};

/** Hook for fetching user measurements by user ID */
export const useFetchUserMeasurementsByUserId = (userId: string | undefined | null) => {
  return useQuery<UserMeasurements[], Error>({
    queryKey: userMeasurementKeys.byUserId(userId!),
    queryFn: () => userMeasurementsApi.fetchUserMeasurementsByUserId(userId!),
    enabled: !!userId,
  });
};

/** Hook for fetching a single user measurement by ID */
export const useFetchUserMeasurementById = (measurementId: string | undefined | null) => {
  return useQuery<UserMeasurements | null, Error>({
    queryKey: userMeasurementKeys.detail(measurementId!),
    queryFn: () => userMeasurementsApi.fetchUserMeasurementById(measurementId!),
    enabled: !!measurementId,
  });
};

/** Hook for creating new user measurements */
export const useCreateUserMeasurements = () => {
  const queryClient = useQueryClient();
  return useMutation<UserMeasurements, Error, Omit<UserMeasurements, 'id' | 'created_at'>>({
    mutationFn: userMeasurementsApi.createUserMeasurements,
    onSuccess: (newMeasurement) => {
      console.log('User measurements created successfully:', newMeasurement);
      // Invalidate the list queries for all measurements
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.lists() });
      // Invalidate the user-specific queries
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.byUserId(newMeasurement.user_id) });
      // Set the new measurement in cache
      queryClient.setQueryData(userMeasurementKeys.detail(newMeasurement.id), newMeasurement);
    },
  });
};

/** Hook for updating user measurements */
export const useUpdateUserMeasurements = () => {
  const queryClient = useQueryClient();
  return useMutation<UserMeasurements, Error, { measurementId: string; payload: Partial<Omit<UserMeasurements, 'id' | 'created_at' | 'user_id'>> }>({
    mutationFn: ({ measurementId, payload }) => userMeasurementsApi.updateUserMeasurements(measurementId, payload),
    onSuccess: (updatedMeasurement, variables) => {
      console.log(`User measurements ${variables.measurementId} updated successfully.`);
      // Invalidate the detail query
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.detail(variables.measurementId) });
      // Invalidate the user-specific queries
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.byUserId(updatedMeasurement.user_id) });
      // Set the updated measurement in cache
      queryClient.setQueryData(userMeasurementKeys.detail(variables.measurementId), updatedMeasurement);
    },
  });
};

/** Hook for deleting user measurements */
export const useDeleteUserMeasurements = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: userMeasurementsApi.deleteUserMeasurements,
    onSuccess: (data, deletedMeasurementId) => {
      console.log(`User measurements ${deletedMeasurementId} deleted.`);
      // Invalidate the detail query
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.detail(deletedMeasurementId) });
      // Invalidate the list queries
      queryClient.invalidateQueries({ queryKey: userMeasurementKeys.lists() });
    },
  });
};
