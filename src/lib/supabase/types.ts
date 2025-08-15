import type { Tables, TablesInsert } from "@/lib/database.types";

// Exercise type from the database schema
export type Exercise = Tables<'exercises'>;

// Exercise with related data
export type ExerciseWithRelations = Exercise & {
    exercise_muscle?: ExerciseMuscle[];
    exercise_reference_global?: ExerciseReferenceGlobal[];
    exercise_saved_references?: (ExerciseSavedReference & { exercise_reference_global?: ExerciseReferenceGlobal })[] ;
    exercise_to_category?: ExerciseToCategory[];
    exercise_to_type?: ExerciseToType[];
};

// Exercise list type with related data
export type ExerciseList = Exercise[] & {
    exercise_type?: ExerciseToType[];
    exercise_category?: ExerciseToCategory[];
};

// Exercise with all related data as specified in relationships.md
export type ExerciseFull = Exercise & {
    exercise_type?: ExerciseToType[];
    exercise_category?: ExerciseToCategory[];
    exercise_muscles?: ExerciseMuscle[];
    exercise_references?: ExerciseSavedReference[];
};

// Exercise references type with related data
export type ExerciseReferences = Exercise & {
    exercise_global_references?: ExerciseReferenceGlobal[];
    exercise_references?: ExerciseSavedReference[];
};

export type ExerciseToCategory = Tables<'exercise_to_category'>;

export type ExerciseToType = Tables<'exercise_to_type'>;

export type ExerciseSavedReferenceWithRelations = ExerciseSavedReference & {
    exercise_reference_global?: ExerciseReferenceGlobal;
};

export type FetchExerciseSavedReferencesParams = {
    page?: number;
    limit?: number;
    searchTerm?: string;
    exerciseId?: string;
};

export type ExerciseSavedReferencePayload = Partial<Omit<ExerciseSavedReference, "id" | "created_at" | "updated_at">>;

export type Team = Tables<'teams'>;

export type TeamWithMembers = Team & {
    team_members?: TeamMember[];
};

export type TeamMember = Tables<'team_members'>;

export type Plan = Tables<'plans'>;

export type PlanWithWeeks = Plan & {
    plan_weeks?: PlanWeek[];
};

export type PlanWeek = Tables<'plan_weeks'> & {
    plan_days?: PlanDay[];
};

export type PlanDay = Tables<'plan_days'> & {
    plan_sessions?: PlanSession[];
};

export type PlanSession = Tables<'plan_sessions'> & {
    plan_session_exercises?: PlanSessionExercise[];
};

export type PlanSessionExercise = Tables<'plan_session_exercises'> & {
    plan_session_exercise_sets?: PlanSessionExerciseSet[];
};

export type PlanSessionExerciseSet = Tables<'plan_session_exercise_sets'>;

// Exercise muscle type from the database schema
export type ExerciseMuscle = Tables<'exercise_muscle'>;

// Exercise reference type from the database schema
export type ExerciseReferenceGlobal = Tables<'exercise_reference_global'>;
export type ExerciseSavedReference = Tables<'exercise_saved_references'>;
export type InsertExerciseSavedReference = TablesInsert<'exercise_saved_references'>;

// Parameters for fetching exercises
export interface FetchExercisesParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
    category?: string | string[];
    difficulty?: number;
    type?: string | string[];
    environment?: string;
    muscle?: string;
    isPublic?: boolean;
    createdByUserId?: string;
}

export interface PlanFilterState {
  difficulty?: number;
  sport?: string;
  muscles?: string[];
  environments?: string[];
  page?: number;
  // Add any other filter properties here
}

export interface PlanToFilter {
  id: string;
  created_at: string | null;
  title: string;
  description: string | null;
  difficulty_level: number | null;
  sport: string | null;
  // ... and all other fields from your 'plans' table
}

// Payload for creating/updating an exercise
export type ExercisePayload = Partial<Omit<Exercise, "id" | "created_at" | "updated_at">>;

export type InsertExerciseReferenceGlobal = TablesInsert<'exercise_reference_global'>;
export type InsertExerciseMuscle = TablesInsert<'exercise_muscle'>;

export type UserMeasurements = Tables<'user_measurements'>;
