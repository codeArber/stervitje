import type { Tables, TablesInsert } from "@/lib/database.types";

// Exercise type from the database schema
export type Exercise = Tables<'exercises'>;

// Exercise with related data
export type ExerciseWithRelations = Exercise & {
    exercise_muscle?: ExerciseMuscle[];
    exercise_reference_global?: ExerciseReferenceGlobal[];
    exercise_saved_references?: (ExerciseSavedReference & { exercise_reference_global?: ExerciseReferenceGlobal })[] ;
    
    
};

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
    categoryId?: string;
    difficulty?: number;
    isPublic?: boolean;
    createdByUserId?: string;
}

// Payload for creating/updating an exercise
export type ExercisePayload = Partial<Omit<Exercise, "id" | "created_at" | "updated_at">>;

export type InsertExerciseReferenceGlobal = TablesInsert<'exercise_reference_global'>;
export type InsertExerciseMuscle = TablesInsert<'exercise_muscle'>;
