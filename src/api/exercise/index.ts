// FILE: /src/api/exercise/index.ts

import { useQuery } from '@tanstack/react-query';
import {
    fetchExerciseDetails,
    fetchFilteredExercisesWithDetails,
    type ExerciseFilters
} from './endpoint';
import type { ExerciseWithDetails, ExerciseWithMuscles } from '@/types/exercise';

const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (filters: ExerciseFilters) => [...exerciseKeys.lists(), filters] as const,
  details: () => [...exerciseKeys.all, 'details'] as const,
  detail: (exerciseId: string) => [...exerciseKeys.details(), exerciseId] as const,
};

/**
 * Hook for fetching a filtered list of exercises, including their muscle data.
 */
export const useFilteredExercisesQuery = (filters: ExerciseFilters) => {
  return useQuery<ExerciseWithMuscles[], Error>({
    queryKey: exerciseKeys.list(filters),
    queryFn: () => fetchFilteredExercisesWithDetails(filters),
  });
};

/**
 * Hook for fetching the complete details of a single exercise.
 */
export const useExerciseDetailsQuery = (exerciseId: string | undefined) => {
  return useQuery<ExerciseWithDetails | null, Error>({
    queryKey: exerciseKeys.detail(exerciseId!),
    queryFn: () => fetchExerciseDetails(exerciseId!),
    enabled: !!exerciseId,
  });
};