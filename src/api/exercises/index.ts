// src/api/exercises/index.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as exercisesApi from './endpoint';
import type { Exercise, ExercisePayload, FetchExercisesParams, ExerciseWithRelations, InsertExerciseMuscle, InsertExerciseReferenceGlobal, InsertExerciseSavedReference } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/supabaseClient';

// --- Query Keys ---
const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const, // Key for exercise lists
  list: (params: FetchExercisesParams) => [...exerciseKeys.lists(), params] as const, // Key for specific list query with filters
  details: () => [...exerciseKeys.all, 'detail'] as const, // Key for exercise details
  detail: (id: string) => [...exerciseKeys.details(), id] as const, // Key for specific exercise detail
  selectorList: (searchTerm?: string) => [...exerciseKeys.all, 'selectorList', searchTerm ?? 'all'] as const, // Key for selector list
};

// --- Hooks ---

/** Hook for fetching a single exercise by ID */
export const useFetchExerciseById = (exerciseId: string | undefined | null) => {
  return useQuery<ExerciseWithRelations | null, Error>({ // Specify return type (can be null if not found)
    queryKey: exerciseKeys.detail(exerciseId!), // Use non-null assertion or handle undefined key
    queryFn: () => exercisesApi.fetchExerciseById(exerciseId!),
    enabled: !!exerciseId, // Only run query if exerciseId is truthy
    // staleTime: 5 * 60 * 1000, // Optional: Cache data for 5 minutes
  });
};


/** 
 * Fetches the public URL for the given storage path 
 * @param imagePath Path inside the bucket, e.g. "images/plank.jpg"
 */
export function useExerciseImageUrl(imagePath: string) {
  return useQuery({
    queryKey: ['exerciseImageUrl', imagePath],
    queryFn: async () => {
      const {
        data: { publicUrl },
      } = supabase
        .storage
        .from('exercises')
        .getPublicUrl(imagePath);

      return publicUrl;
    },
  });
}


/** Hook for fetching exercises with infinite scrolling & filters */
export const useInfiniteExercises = (
  { page, limit: paramLimit, ...filters }: FetchExercisesParams = {},
  defaultLimit = 20
) => {
  const limit = paramLimit ?? defaultLimit;          // honour caller's limit

  return useInfiniteQuery<Exercise[], Error>({
    queryKey: exerciseKeys.list({ ...filters, limit: limit }),  // ⬅ include limit + filters
    queryFn: ({ pageParam = 1 }) =>
      exercisesApi.fetchExercises({ ...filters, page: pageParam, limit: limit }),

    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === limit ? allPages.length + 1 : undefined,

    initialPageParam: 1,
  });
};


/** Hook to fetch exercises for selection components */
export const useFetchExerciseListForSelector = (searchTerm?: string) => {
  // Debounce search term if implementing server-side search
  // const debouncedSearchTerm = useDebounce(searchTerm, 300); // Example

  return useQuery<Array<{ id: string; name: string }>, Error>({
    queryKey: exerciseKeys.selectorList(searchTerm), // Use search term in key if server searching
    queryFn: () => exercisesApi.fetchExerciseListForSelector(searchTerm),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};


/** Hook for creating a new exercise */
export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, ExercisePayload>({ // Return=Exercise, Error, Variables=Payload
    mutationFn: exercisesApi.createExercise,
    onSuccess: (newExercise) => {
      console.log('Exercise created successfully:', newExercise);
      // Invalidate general exercise lists to reflect the new addition
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      // Optional: Pre-populate the cache for the new exercise detail
      queryClient.setQueryData(exerciseKeys.detail(newExercise.id), newExercise);
    },
    onError: (error) => {
      console.error("Mutation Error useCreateExercise:", error);
      // Replace with better UI feedback (toast, notification, etc.)
    },
  });
};

/** Hook for updating an exercise */
export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  // Variables type for the mutation function
  type UpdateVars = { exerciseId: string; payload: Partial<ExercisePayload> };

  return useMutation<Exercise, Error, UpdateVars>({ // Return=Exercise, Error, Variables=UpdateVars
    mutationFn: (vars) => exercisesApi.updateExercise(vars.exerciseId, vars.payload),
    onSuccess: (updatedExercise, variables) => {
      console.log(`Exercise ${variables.exerciseId} updated successfully.`);
      // Invalidate the specific exercise detail query
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.exerciseId) });
      // Invalidate general lists as well, as updated data might change its position/filter status
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Optional: Update the cache immediately for this item
      queryClient.setQueryData(exerciseKeys.detail(variables.exerciseId), updatedExercise);
    },
    onError: (error, variables) => {
      console.error(`Mutation Error useUpdateExercise (ID: ${variables.exerciseId}):`, error);
      // Replace with better UI feedback (toast, notification, etc.)
    },
  });
};


/** Hook for deleting an exercise */
export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({ // Return, Error, Variable=exerciseId
    mutationFn: exercisesApi.deleteExercise,
    onSuccess: (data, deletedExerciseId) => {
      console.log(`Exercise ${deletedExerciseId} deleted.`);
      // Invalidate both the specific detail and general lists
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(deletedExerciseId) });
      // More efficient: remove the detail query from cache
      // queryClient.removeQueries({ queryKey: exerciseKeys.detail(deletedExerciseId) });

      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Optional: Manually remove from infinite query cache for instant UI update
      // This is more complex and typically not needed if using invalidateQueries properly
    },
    onError: (error, variables) => {
      console.error(`Mutation Error useDeleteExercise (ID: ${variables}):`, error);
      // Replace with better UI feedback (toast, notification, etc.)
    },
  });
};


/** Hook for adding a global reference to an exercise */
export const useCreateExerciseReferenceGlobal = () => {
  const queryClient = useQueryClient();
  return useMutation<InsertExerciseReferenceGlobal, Error, { exerciseId: string; reference: InsertExerciseReferenceGlobal }>({
    mutationFn: ({ exerciseId, reference }) => exercisesApi.addExercisGlobalReference(exerciseId, reference),
    onSuccess: (data, variables) => {
      // Invalidate the specific exercise detail query to refresh references
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.exerciseId) });
      // Invalidate the exercise references query
      queryClient.invalidateQueries({ queryKey: ['exerciseReferences', variables.exerciseId] });
    },
  });
};

/** Hook for adding a muscle group to an exercise */
export const useCreateExerciseMuscleGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<InsertExerciseMuscle, Error, { muscleGroup: InsertExerciseMuscle }>({
    mutationFn: ({ muscleGroup }) => exercisesApi.addExerciseMuscleGroup(muscleGroup),
    onSuccess: (data, variables) => {
      // Invalidate the specific exercise detail query to refresh references
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(data.exercise_id) });
      // Invalidate the exercise references query
      queryClient.invalidateQueries({ queryKey: ['exerciseReferences', data.exercise_id] });
    },
  });
};


/** Hook for removing a muscle group from an exercise */
export const useRemoveExerciseMuscleGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean, exercise_id: string }, Error, { id: string, exerciseId: string }>({
    mutationFn: ({ id, exerciseId }) => exercisesApi.removeExerciseMuscleGroup(id, exerciseId),
    onSuccess: (data, variables) => {
      // Invalidate the specific exercise detail query to refresh references
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.exerciseId) });
      // Invalidate the exercise references query
      queryClient.invalidateQueries({ queryKey: ['exerciseReferences', variables.exerciseId] });
    },
  });
};

/** Hook for adding a saved reference to an exercise */
export const useCreateExerciseSavedReference = () => {
  const queryClient = useQueryClient();
  return useMutation<InsertExerciseSavedReference, Error, { reference: InsertExerciseSavedReference }>({
    mutationFn: ({ reference }) => exercisesApi.addExerciseSavedReference(reference),
    onSuccess: (data, variables) => {
      // Invalidate the specific exercise detail query to refresh references
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(data.exercise_id) });
      // Invalidate the exercise references query
      queryClient.invalidateQueries({ queryKey: ['exerciseReferences', data.exercise_id] });
    },
  });
};


/** Hook for removing a saved reference from an exercise */
export const useRemoveExerciseSavedReference = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean, exercise_id: string }, Error, { id: string, exerciseId: string }>({
    mutationFn: ({ id, exerciseId }) => exercisesApi.removeExerciseSavedReference(id, exerciseId),
    onSuccess: (data, variables) => {
      // Invalidate the specific exercise detail query to refresh references
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.exerciseId) });
      // Invalidate the exercise references query
      queryClient.invalidateQueries({ queryKey: ['exerciseReferences', variables.exerciseId] });
    },
  });
}
