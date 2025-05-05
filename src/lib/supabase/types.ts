import type { Tables, TablesInsert } from "@/lib/database.types";
import { z } from "zod";

// Exercise type from the database schema
export type Exercise = Tables<'exercises'>;

// Exercise with related data
export type ExerciseWithRelations = Exercise & {
    exercise_muscle?: ExerciseMuscle[];
    exercise_reference_global?: ExerciseReferenceGlobal[];
    exercise_reference_private?: ExerciseReferencePrivate[];
};

// Exercise muscle type from the database schema
export type ExerciseMuscle = Tables<'exercise_muscle'>;

// Exercise reference type from the database schema
export type ExerciseReferenceGlobal = Tables<'exercise_reference_global'>;
export type ExerciseReferencePrivate = Tables<'exercise_reference_private'>;

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

// ============= PLAN TYPES =============

// Set (Innermost)
export type PlanExerciseSet = Tables<'plan_session_exercise_sets'>;

// User Plan
export type UserPlan = Tables<'user_plans'>;

export type Plan = Tables<'plans'>

export type InsertExerciseReferenceGlobal = TablesInsert<'exercise_reference_global'>;

export type InsertExerciseMuscle = TablesInsert<'exercise_muscle'>;

// Exercise Entry in Session (Contains Sets)
export type PlanSessionExercise = Tables<'plan_session_exercises'> & {
    plan_exercise_sets?: PlanExerciseSet[];
    exercise?: Exercise;
    plan_session_exercise_sets?: PlanExerciseSet[];

}

// Session in Day (Contains Exercise Entries)
export type PlanSession = Tables<'plan_sessions'> & {
    plan_session_exercises?: PlanSessionExercise[];
}

export type PlanDay = Tables<'plan_days'> & {
    plan_sessions?: PlanSession[];
}

export type PlanWeek = Tables<'plan_weeks'> & {
    plan_days?: PlanDay[];
}
// Base Plan (Top Level Info)

// Full Plan Detail Structure (Extends Plan, Contains Nested Data)
export interface PlanDetail extends Plan {
    plan_weeks?: PlanWeek[]; // Array of weeks
    // Include creator profile info if joined
    creator_profile?: {
        id: string;
        username?: string | null;
        profile_image_url?: string | null;
    } | null;
    // Include team info if joined
    team?: {
        id: string;
        name?: string | null;
    } | null;
}

// Type for Discoverable Plans list items (subset of fields)
export interface DiscoverablePlan {
    id: string;
    title: string;
    description?: string | null;
    difficulty_level?: number | null;
    duration_weeks?: number | null;
    sport?: string | null;
    visibility?: string;
    allow_public_forking?: boolean;
    is_featured?: boolean;
    view_count?: number;
    fork_count?: number;
    like_count?: number;
    created_at?: string;
    origin_type?: string;
    team_id?: string | null;
    team_name?: string | null;
    created_by_username?: string | null;
    created_by_profile_image_url?: string | null;
}


export interface PlanSummary {
    id: string; // UUID PRIMARY KEY
    title: string; // VARCHAR(255) NOT NULL
    description?: string | null; // TEXT
    difficulty_level?: number | null; // SMALLINT CHECK (difficulty_level BETWEEN 1 AND 5)
    duration_weeks?: number | null; // SMALLINT
    sport?: string | null; // VARCHAR(100)
    visibility: 'public' | 'team' | 'private'; // VARCHAR(50) NOT NULL DEFAULT 'private'
    created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    // Optional fields often added by specific queries/RPCs:
    created_by?: string | null; // UUID REFERENCES auth.users(id)
    team_id?: string | null; // UUID REFERENCES public.teams(id)
    allow_public_forking?: boolean; // BOOLEAN NOT NULL DEFAULT FALSE
    origin_type?: 'user' | 'admin' | 'ai' | 'coach'; // VARCHAR(50) NOT NULL DEFAULT 'user'
    is_featured?: boolean; // BOOLEAN DEFAULT FALSE
    view_count?: number; // INTEGER DEFAULT 0
    fork_count?: number; // INTEGER DEFAULT 0
    like_count?: number; // INTEGER DEFAULT 0
    forked_from?: string | null; // UUID REFERENCES public.plans(id)
    // Fields potentially added by JOINs or RPCs:
    team_name?: string | null;
    created_by_username?: string | null;
    created_by_profile_image_url?: string | null;
}
// Basic Exercise Info (adjust as needed based on your 'exercises' table)
export interface ExerciseSummary {
    id: string;
    name: string;
    description?: string | null;
    // video_url?: string | null;
    // image_url?: string | null;
}

// Type for a single planned set
export interface PlanSetDetails {
    id: string;
    plan_session_exercise_id: string;
    set_number: number;
    target_reps?: number | null;
    target_weight?: number | null; // Stored as string if using DECIMAL? Check Supabase client handling
    target_weight_unit?: 'kg' | 'lb' | string | null; // Use your weight_unit_enum values
    target_duration_seconds?: number | null;
    target_distance_meters?: number | null; // Stored as string if using DECIMAL?
    target_rest_seconds?: number | null; // Rest AFTER this set
    notes?: string | null;
    created_at: string;
    // updated_at?: string; // Add if present and selected
}

// Type for an exercise block within a session
export interface PlanSessionExerciseDetails {
    id: string;
    plan_session_id: string;
    exercise_id: string;
    order_index: number;
    notes?: string | null;
    target_rest_seconds?: number | null; // Rest AFTER all sets of this exercise
    created_at: string;
    updated_at?: string | null;
    exercise: ExerciseSummary; // Nested exercise details
    plan_session_exercise_sets: PlanSetDetails[]; // Array of sets for this exercise
}

// Type for a session within a day
export interface PlanSessionDetails {
    id: string;
    plan_day_id: string;
    order_index: number;
    title?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at?: string | null;
    plan_session_exercises: PlanSessionExerciseDetails[]; // Array of exercises in this session
}

// Type for the overall plan day details structure returned by the RPC
export interface PlanDayDetails {
    id: string;
    plan_week_id: string;
    day_number: number;
    title?: string | null;
    description?: string | null;
    is_rest_day: boolean;
    created_at: string;
    updated_at?: string | null;
    plan_sessions: PlanSessionDetails[]; // Array of sessions for the day
}


// Zod Schema for Creating a Plan (Top Level Fields)
export const CreatePlanSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  description: z.string().max(500).optional().nullable(),
  difficulty_level: z.coerce.number().int().min(1).max(5).optional().nullable(),
  duration_weeks: z.coerce.number().int().positive().optional().nullable(),
  sport: z.string().max(100).optional().nullable(),
  visibility: z.enum(['private', 'public', 'team']).default('private'),
  // team_id: z.string().uuid().optional().nullable(), // Add if creating team plans directly
  allow_public_forking: z.boolean().default(false),
  team_id: z.string().uuid().optional().nullable(),
}).refine(data => data.visibility !== 'team', { // Basic check, needs team_id if visibility is team
    message: "Team ID required if visibility is 'team'",
    path: ["visibility"], // Or path: ["team_id"]
});
export type CreatePlanPayload = z.infer<typeof CreatePlanSchema>;

// Type for Updating a Plan (Partial of CreatePlanPayload)
export type UpdatePlanPayload = Partial<CreatePlanPayload>;
