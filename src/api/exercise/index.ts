// src/api/exercise/index.ts
import { useQuery } from '@tanstack/react-query';
import { fetchExerciseDetails, fetchFilteredExercises, type ExerciseFilters } from './endpoint';
import type { Exercise, ExerciseDetails, ExerciseWithDetails } from '@/types/exercise/index';

// --- Query Keys ---
// --- Query Keys ---
const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (filters: ExerciseFilters) => [...exerciseKeys.lists(), filters] as const,
  details: () => [...exerciseKeys.all, 'details'] as const,
  // NEW: A key for a single exercise's details
  detail: (exerciseId: string) => [...exerciseKeys.details(), exerciseId] as const,
};

// --- Hooks ---
/**
 * Hook for fetching a filtered list of exercises.
 * @param filters - An object containing all active filter criteria.
 */
export const useFilteredExercisesQuery = (filters: ExerciseFilters) => {
  return useQuery<Exercise[], Error>({ // The return type is now Exercise[]
    queryKey: exerciseKeys.list(filters),
    queryFn: () => fetchFilteredExercises(filters),
  });
};

/**
 * **NEW:** Hook for fetching the complete details of a single exercise.
 * @param exerciseId - The ID of the exercise to fetch.
 */
export const useExerciseDetailsQuery = (exerciseId: string | undefined) => {
  return useQuery<ExerciseDetails | null, Error>({
    queryKey: exerciseKeys.detail(exerciseId!),
    queryFn: () => fetchExerciseDetails(exerciseId!),
    enabled: !!exerciseId, // The query will not run until the ID is available
  });
};