// FILE: /src/api/exercise/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
// Update the import to use the more descriptive type
import type { ExerciseWithDetails, ExerciseWithMusclesAndTags } from "@/types/exercise";

export interface ExerciseFilters {
  searchTerm?: string;
  muscleGroups?: string[];
  tagIds?: number[];
  difficultyLevel?: number;
  pageLimit?: number;
  pageOffset?: number;
}

/**
 * @description Fetches a filtered list of exercises, including their muscle data and tags.
 * Corresponds to the `get_filtered_exercises_with_details` RPC.
 */
export const fetchFilteredExercisesWithDetails = async (filters: ExerciseFilters): Promise<ExerciseWithMusclesAndTags[]> => {
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
  // Cast to the more descriptive type
  return (data as ExerciseWithMusclesAndTags[]) || [];
};

/**
 * @description Fetches the complete details for a single exercise.
 * Corresponds to the `get_exercise_details` RPC.
 */
export const fetchExerciseDetails = async (exerciseId: string): Promise<ExerciseWithDetails | null> => {
  const { data, error } = await supabase
    .rpc('get_exercise_details', { p_exercise_id: exerciseId });

  if (error) { throw new Error(error.message); }
  // RPC `get_exercise_details` returns `jsonb_build_object`, which will be `null` if no match.
  // The cast is correct here as the internal SQL will return a single object or no row.
  return data as ExerciseWithDetails | null;
};