// src/types/exercise/index.ts

import { Enums, Tables } from "../database.types";

// Re-exporting base types for convenience
export type Exercise = Tables<'exercises'>;
export type MuscleGroup = Enums<'muscle_group_enum'>;
export type ExerciseCategory = Enums<'exercise_category'>;


export type ExerciseReference = Tables<'exercise_reference_global'>;
export type ExerciseType = Enums<'exercise_type_enum'>;

// --- RPC Response Type ---
// This is the main type for a single exercise object returned by the get_filtered_exercises function.
// It includes the base exercise data plus aggregated arrays of its relations.
export type ExerciseWithDetails = Exercise & {
  muscle_groups: MuscleGroup[] | null;
  categories: ExerciseCategory[] | null;
};

export type ExerciseDetails = {
  exercise: Exercise;
  muscle_groups: Enums<'muscle_group_enum'>[] | null;
  categories: Enums<'exercise_category'>[] | null;
  types: ExerciseType[] | null;
  references: ExerciseReference[] | null;
};

export const allMuscleGroups = [ "trapezius", "upper-back", "lower-back", "chest", "biceps", "triceps", "forearm", "back-deltoids", "front-deltoids", "abs", "obliques", "adductor", "hamstring", "quadriceps", "abductors", "calves", "gluteal", "head", "neck" ] as const;
export const allCategories = [ "strength", "endurance", "mobility", "power", "speed", "agility", "balance", "coordination", "recovery", "core_stability" ] as const;
export const allTypes = [ "pull", "push", "isometric", "plyometric", "rotational", "dynamic" ] as const;
export const allEnvironments = [ "gym", "outdoor", "home", "studio" ] as const;