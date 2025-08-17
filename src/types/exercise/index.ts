// FILE: /src/types/exercise/index.ts

import type { Tables, Enums } from "../database.types";

export type Exercise = Tables<'exercises'>;
export type Tag = Tables<'tags'>;
export type ExerciseReference = Tables<'exercise_reference_global'>;
export type MuscleGroup = Enums<'muscle_group_enum'>;
export type EngagementLevel = Enums<'engagement_level'>;

export type ExerciseMuscleWithEngagement = {
  muscle: MuscleGroup;
  engagement: EngagementLevel;
};

// This is the type for a single item in the list from our new RPC
export type ExerciseWithMuscles = Exercise & {
  muscles: ExerciseMuscleWithEngagement[] | null;
  tags: Tag[] | null; // <-- ADD THIS LINE
};

// This is the rich type for the Exercise Details page
export type ExerciseWithDetails = Exercise & {
  muscles: ExerciseMuscleWithEngagement[] | null;
  tags: Tag[] | null;
  references: ExerciseReference[] | null;
};