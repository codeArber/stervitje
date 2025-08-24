// FILE: /src/types/exercise/index.ts

// Import base types from the centralized index
import type { Exercise as BaseExercise, Tag as BaseTag, MuscleGroup as BaseMuscleGroup, EngagementLevel as BaseEngagementLevel, ExerciseReference as BaseExerciseReference } from "../index";

// Re-exporting base types for convenience if this file is the primary entry for exercise-related types
export type Exercise = BaseExercise;
export type Tag = BaseTag;
export type ExerciseReference = BaseExerciseReference;
export type MuscleGroup = BaseMuscleGroup;
export type EngagementLevel = BaseEngagementLevel;

/**
 * @description Represents a muscle group associated with an exercise, along with its engagement level.
 * Corresponds to the `exercise_muscle` table data when joined and structured.
 */
export type ExerciseMuscleWithEngagement = {
  muscle: MuscleGroup;
  engagement: EngagementLevel;
};

/**
 * @description Represents an exercise with its associated muscles and tags.
 * Corresponds to the return type of `get_filtered_exercises_with_details` RPC.
 */
export type ExerciseWithMusclesAndTags = Exercise & {
  muscles: ExerciseMuscleWithEngagement[]; // `jsonb_agg` returns [] if no muscles
  tags: Tag[]; // `jsonb_agg` returns [] if no tags
};

/**
 * @description Represents a full exercise with its muscles, tags, and global references.
 * Corresponds to the return type of `get_exercise_details` RPC.
 */
export type ExerciseWithDetails = Exercise & {
  muscles: ExerciseMuscleWithEngagement[]; // `jsonb_agg` returns [] if empty
  tags: Tag[]; // `jsonb_agg` returns [] if empty
  references: ExerciseReference[]; // `jsonb_agg` returns [] if empty
};