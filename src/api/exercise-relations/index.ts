// src/api/exercise-relations/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as exerciseRelationsApi from './endpoint';
import type { 
  ExerciseToCategory, 
  ExerciseToType, 
  ExerciseMuscle, 
  ExerciseReferenceGlobal 
} from '@/types/index';

// --- Query Keys ---
const exerciseRelationKeys = {
  all: ['exerciseRelations'] as const,
  categories: () => [...exerciseRelationKeys.all, 'categories'] as const,
  types: () => [...exerciseRelationKeys.all, 'types'] as const,
  muscles: () => [...exerciseRelationKeys.all, 'muscles'] as const,
  references: () => [...exerciseRelationKeys.all, 'references'] as const,
};

// --- Hooks ---

// --- Exercise Category Operations ---

/** Hook for fetching all exercise categories */
export const useFetchExerciseCategories = () => {
  return useQuery<ExerciseToCategory[], Error>({
    queryKey: exerciseRelationKeys.categories(),
    queryFn: exerciseRelationsApi.fetchExerciseCategories,
  });
};

/** Hook for creating a new exercise-category relationship */
export const useCreateExerciseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<ExerciseToCategory, Error, ExerciseToCategory>({
    mutationFn: exerciseRelationsApi.createExerciseCategory,
    onSuccess: (newRelation) => {
      console.log('Exercise-category relation created successfully:', newRelation);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.categories() });
    },
  });
};

/** Hook for deleting an exercise-category relationship */
export const useDeleteExerciseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { exerciseId: string; category: string }>({
    mutationFn: ({ exerciseId, category }) => exerciseRelationsApi.deleteExerciseCategory(exerciseId, category),
    onSuccess: (data, variables) => {
      console.log(`Exercise-category relation deleted (Exercise ID: ${variables.exerciseId}, Category: ${variables.category})`);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.categories() });
    },
  });
};

// --- Exercise Type Operations ---

/** Hook for fetching all exercise types */
export const useFetchExerciseTypes = () => {
  return useQuery<ExerciseToType[], Error>({
    queryKey: exerciseRelationKeys.types(),
    queryFn: exerciseRelationsApi.fetchExerciseTypes,
  });
};

/** Hook for creating a new exercise-type relationship */
export const useCreateExerciseType = () => {
  const queryClient = useQueryClient();
  return useMutation<ExerciseToType, Error, ExerciseToType>({
    mutationFn: exerciseRelationsApi.createExerciseType,
    onSuccess: (newRelation) => {
      console.log('Exercise-type relation created successfully:', newRelation);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.types() });
    },
  });
};

/** Hook for deleting an exercise-type relationship */
export const useDeleteExerciseType = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { exerciseId: string; type: string }>({
    mutationFn: ({ exerciseId, type }) => exerciseRelationsApi.deleteExerciseType(exerciseId, type),
    onSuccess: (data, variables) => {
      console.log(`Exercise-type relation deleted (Exercise ID: ${variables.exerciseId}, Type: ${variables.type})`);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.types() });
    },
  });
};

// --- Exercise Muscle Operations ---

/** Hook for fetching all exercise muscles */
export const useFetchExerciseMuscles = () => {
  return useQuery<ExerciseMuscle[], Error>({
    queryKey: exerciseRelationKeys.muscles(),
    queryFn: exerciseRelationsApi.fetchExerciseMuscles,
  });
};

/** Hook for creating a new exercise-muscle relationship */
export const useCreateExerciseMuscle = () => {
  const queryClient = useQueryClient();
  return useMutation<ExerciseMuscle, Error, Omit<ExerciseMuscle, 'id' | 'created_at'>>({
    mutationFn: exerciseRelationsApi.createExerciseMuscle,
    onSuccess: (newRelation) => {
      console.log('Exercise-muscle relation created successfully:', newRelation);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.muscles() });
    },
  });
};

/** Hook for deleting an exercise-muscle relationship */
export const useDeleteExerciseMuscle = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: exerciseRelationsApi.deleteExerciseMuscle,
    onSuccess: (data, deletedMuscleId) => {
      console.log(`Exercise-muscle relation deleted (Muscle ID: ${deletedMuscleId})`);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.muscles() });
    },
  });
};

// --- Exercise Reference Global Operations ---

/** Hook for fetching all global exercise references */
export const useFetchExerciseReferenceGlobals = () => {
  return useQuery<ExerciseReferenceGlobal[], Error>({
    queryKey: exerciseRelationKeys.references(),
    queryFn: exerciseRelationsApi.fetchExerciseReferenceGlobals,
  });
};

/** Hook for creating a new global exercise reference */
export const useCreateExerciseReferenceGlobal = () => {
  const queryClient = useQueryClient();
  return useMutation<ExerciseReferenceGlobal, Error, Omit<ExerciseReferenceGlobal, 'id' | 'created_at' | 'created_by'>>({
    mutationFn: exerciseRelationsApi.createExerciseReferenceGlobal,
    onSuccess: (newReference) => {
      console.log('Global exercise reference created successfully:', newReference);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.references() });
    },
  });
};

/** Hook for updating a global exercise reference */
export const useUpdateExerciseReferenceGlobal = () => {
  const queryClient = useQueryClient();
  return useMutation<ExerciseReferenceGlobal, Error, { referenceId: string; payload: Partial<Omit<ExerciseReferenceGlobal, 'id' | 'created_at' | 'created_by'>> }>({
    mutationFn: ({ referenceId, payload }) => exerciseRelationsApi.updateExerciseReferenceGlobal(referenceId, payload),
    onSuccess: (updatedReference, variables) => {
      console.log(`Global exercise reference updated (ID: ${variables.referenceId})`);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.references() });
    },
  });
};

/** Hook for deleting a global exercise reference */
export const useDeleteExerciseReferenceGlobal = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: exerciseRelationsApi.deleteExerciseReferenceGlobal,
    onSuccess: (data, deletedReferenceId) => {
      console.log(`Global exercise reference deleted (ID: ${deletedReferenceId})`);
      queryClient.invalidateQueries({ queryKey: exerciseRelationKeys.references() });
    },
  });
};
