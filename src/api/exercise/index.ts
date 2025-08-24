// FILE: /src/api/exercise/index.ts

import { useQuery } from '@tanstack/react-query';
import {
  fetchExerciseDetails,
  fetchFilteredExercisesWithDetails,
  type ExerciseFilters
} from './endpoint';
// Update the import to use the more descriptive type
import type { ExerciseWithDetails, ExerciseWithMusclesAndTags } from '@/types/exercise';

const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  // Ensure the filter object is stable for queryKey generation, maybe sort keys or use a hashing function if `filters` can be re-ordered.
  // For now, simple spread is fine if `filters` object is typically built consistently.
  list: (filters: ExerciseFilters) => [...exerciseKeys.lists(), filters] as const,
  details: () => [...exerciseKeys.all, 'details'] as const,
  detail: (exerciseId: string) => [...exerciseKeys.details(), exerciseId] as const,
};

/**
 * @description Hook for fetching a filtered list of exercises, including their muscle data and tags.
 * Uses `ExerciseWithMusclesAndTags` as the expected type for each item in the array.
 */
export const useFilteredExercisesQuery = (filters: ExerciseFilters) => {
  return useQuery<ExerciseWithMusclesAndTags[], Error>({ // Update generic type here
    queryKey: exerciseKeys.list(filters),
    queryFn: () => fetchFilteredExercisesWithDetails(filters),
  });
};

/**
 * @description Hook for fetching the complete details of a single exercise.
 * Uses `ExerciseWithDetails` as the expected type, allowing for `null` if not found.
 */
export const useExerciseDetailsQuery = (exerciseId: string | undefined) => {
  return useQuery<ExerciseWithDetails | null, Error>({
    queryKey: exerciseKeys.detail(exerciseId!), // `exerciseId!` is safe due to `enabled`
    queryFn: () => fetchExerciseDetails(exerciseId!),
    enabled: !!exerciseId, // Only run the query if exerciseId is defined
  });
};