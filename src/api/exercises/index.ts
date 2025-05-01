// src/api/exercises/index.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, QueryKey, InfiniteData } from '@tanstack/react-query';
import * as exercisesApi from './endpoint';
// import { FetchExercisesParams } from '@/types/type';
import type { Exercise, ExercisePayload, FetchExercisesParams } from '@/types/type'; // Adjust path
import { supabase } from '@/lib/supabase/supabaseClient';

// --- Query Keys ---
const exerciseKeys = {
    all: ['exercises'] as const,
    lists: () => [...exerciseKeys.all, 'list'] as const, // Key for exercise lists
    list: (params: FetchExercisesParams) => [...exerciseKeys.lists(), params] as const, // Key for specific list query with filters
    details: () => [...exerciseKeys.all, 'detail'] as const, // Key for exercise details
    detail: (id: string) => [...exerciseKeys.details(), id] as const, // Key for specific exercise detail
};

// --- Hooks ---

/** Hook for fetching a single exercise by ID */
export const useFetchExerciseById = (exerciseId: string | undefined | null) => {
    return useQuery<Exercise | null, Error>({ // Specify return type (can be null if not found)
        queryKey: exerciseKeys.detail(exerciseId!), // Use non-null assertion or handle undefined key
        queryFn: () => exercisesApi.fetchExerciseById(exerciseId!),
        enabled: !!exerciseId, // Only run query if exerciseId is truthy
        // staleTime: 5 * 60 * 1000, // Optional: Cache data for 5 minutes
    });
};

/** Hook for fetching exercises with infinite scrolling */
export const useInfiniteExercises = (params: FetchExercisesParams = {}, limit = 20) => {
     // Remove pagination params from the query key params object if they exist
    const { page, limit: paramsLimit, ...filterParams } = params;

    return useInfiniteQuery<Exercise[], Error, InfiniteData<Exercise[]>, QueryKey, number>({ // Explicit types
        queryKey: exerciseKeys.list(filterParams), // Use filters in query key
        queryFn: ({ pageParam = 1 }) => exercisesApi.fetchExercises({ ...filterParams, page: pageParam, limit }),
        getNextPageParam: (lastPage, allPages) => {
            // If the last page fetched less items than the limit, there are no more pages
            return lastPage.length === limit ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });
};


// Key for the selector list
exerciseKeys.selectorList = (searchTerm?: string) => [...exerciseKeys.all, 'selectorList', searchTerm ?? 'all'] as const;

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
            alert(`Create Exercise Error: ${error.message}`); // Replace with better UI feedback
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
             // Optional: Update the item within infinite lists (more complex)
            // queryClient.setQueryData<InfiniteData<Exercise[]>>(exerciseKeys.list({...}), oldData => ...)
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useUpdateExercise (ID: ${variables.exerciseId}):`, error);
            alert(`Update Exercise Error: ${error.message}`); // Replace with better UI feedback
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
             queryClient.setQueryData<InfiniteData<Exercise[]>>(exerciseKeys.lists(), (oldData) => {
                 if (!oldData) return oldData;
                 return {
                     ...oldData,
                     pages: oldData.pages.map(page => page.filter(ex => ex.id !== deletedExerciseId)),
                 };
             });
              // Remember to adapt the key above if you use filtered lists `exerciseKeys.list(filters)`
        },
        onError: (error, variables) => {
            console.error(`Mutation Error useDeleteExercise (ID: ${variables}):`, error);
            alert(`Delete Exercise Error: ${error.message}`); // Replace with better UI feedback
        },
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


export function userExerciseReferences(exerciseId: string, userId: string) {
  return useQuery({
    queryKey: ['exerciseReferences', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_reference')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)

      if (error) throw new Error(error.message);
      return data;
    },
  });
}