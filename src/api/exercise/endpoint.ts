// src/api/exercise/endpoint.ts

import { supabase } from "@/lib/supabase/supabaseClient";
import { Exercise, ExerciseDetails, ExerciseWithDetails } from "@/types/exercise";

// A type for the filters object to make it clear what can be passed
export interface ExerciseFilters {
  searchTerm?: string;
  muscleGroups?: string[];
  categories?: string[];
  types?: string[];
  environments?: string[];
  difficultyLevel?: number;
  pageLimit?: number;
  pageOffset?: number;
}


/**
 * Fetches a filtered, paginated list of exercises.
 * @param filters - An object containing all active filter criteria.
 */
export const fetchFilteredExercises = async (filters: ExerciseFilters): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .rpc('get_filtered_exercises', {
      p_search_term: filters.searchTerm,
      p_muscle_groups: filters.muscleGroups,
      p_categories: filters.categories,
      p_types: filters.types,
      p_environments: filters.environments,
      p_difficulty_level: filters.difficultyLevel,
      p_page_limit: filters.pageLimit,
      p_page_offset: filters.pageOffset
    });

  if (error) {
    console.error('API Error fetchFilteredExercises:', error);
    throw new Error(error.message);
  }
  return data || [];
};



/**
 * **NEW:** Fetches the complete, aggregated details for a single exercise.
 *
 * @param exerciseId - The UUID of the exercise to fetch.
 */
export const fetchExerciseDetails = async (exerciseId: string): Promise<ExerciseDetails | null> => {
  const { data, error } = await supabase
    .rpc('get_exercise_details', { p_exercise_id: exerciseId });

  if (error) {
    console.error(`API Error fetchExerciseDetails (ID: ${exerciseId}):`, error);
    throw new Error(error.message);
  }
  return data as ExerciseDetails | null;
};