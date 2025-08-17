// FILE: /src/api/exercise/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import type { ExerciseWithDetails, ExerciseWithMuscles } from "@/types/exercise";

export interface ExerciseFilters {
  searchTerm?: string;
  muscleGroups?: string[];
  tagIds?: number[];
  difficultyLevel?: number;
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * Fetches a filtered list of exercises, including their muscle data.
 */
export const fetchFilteredExercisesWithDetails = async (filters: ExerciseFilters): Promise<ExerciseWithMuscles[]> => {
  const { data, error } = await supabase
    .rpc('get_filtered_exercises_with_details', {
      p_search_term: filters.searchTerm,
      p_muscle_groups: filters.muscleGroups,
      p_tag_ids: filters.tagIds,
      p_difficulty_level: filters.difficultyLevel,
      p_page_limit: filters.pageLimit,
      p_page_offset: filters.pageOffset
    });

  if (error) {
    console.error('API Error fetchFilteredExercisesWithDetails:', error);
    throw new Error(error.message);
  }
  return (data as ExerciseWithMuscles[]) || [];
};

/**
 * Fetches the complete details for a single exercise.
 */
export const fetchExerciseDetails = async (exerciseId: string): Promise<ExerciseWithDetails | null> => {
  const { data, error } = await supabase
    .rpc('get_exercise_details', { p_exercise_id: exerciseId });

  if (error) { throw new Error(error.message); }
  return data as ExerciseWithDetails | null;
};