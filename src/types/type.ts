// src/types/exerciseTypes.ts (or your central types file)
import { ExerciseCategory } from "@/lib/data";
import { z } from "zod";

// Interface for a fetched Exercise, potentially including category details
export interface Exercise {
    id: string; // UUID
    name: string;
    description?: string | null;
    instructions?: string | null;
    difficulty_level?: number | null;
    video_url?: string | null;
    image_url?: string | null;
    created_by?: string | null; // UUID of the user who created it
    is_public?: boolean | null;
    created_at?: string | null; // ISO Date string
    updated_at?: string | null; // ISO Date string
    // Joined categories (if fetched)
    category?: ExerciseCategory | null; // FK to exercise_categories
}

// Interface for the payload when creating/updating an exercise
// Excludes read-only fields like id, created_at, updated_at, created_by
export interface ExercisePayload {
    name: string;
    description?: string | null;
    instructions?: string | null;
    difficulty_level?: number | null;
    video_url?: string | null;
    image_url?: string | null;
    is_public?: boolean; // Default to true in DB? Or required here?
    // We'll handle category mapping separately if needed, or expect IDs here
    category?: ExerciseCategory; // Optional: If you want to set categories during create/update
}

// Interface for fetch parameters (optional filtering/pagination)
export interface FetchExercisesParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
    categoryId?: string;
    difficulty?: number;
    createdByUserId?: string; // To fetch only user's exercises
}

export const CreatePlanSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
    description: z.string().max(500).optional(),
    // Add other fields as needed and make them optional/required accordingly
    // Example:
    // difficulty_level: z.coerce.number().min(1).max(5).optional().nullable(),
    // duration_weeks: z.coerce.number().positive().optional().nullable(),
    // sport: z.string().max(100).optional().nullable(),
    // visibility: z.enum(['private', 'public', 'team']).default('private'), // Default visibility
  });
  
  // Type derived from the schema
  export type CreatePlanPayload = z.infer<typeof CreatePlanSchema>;
  
  // Update the main Plan type if needed (ensure it includes fields you create)
  export interface Plan {
    id: string; // UUID
    title: string;
    description?: string | null;
    difficulty_level?: number | null;
    duration_weeks?: number | null;
    sport?: string | null;
    created_by?: string | null; // UUID
    team_id?: string | null; // UUID
    visibility?: 'public' | 'team' | 'private';
    allow_public_forking?: boolean;
    origin_type?: 'user' | 'admin' | 'ai' | 'coach';
    is_featured?: boolean;
    view_count?: number;
    fork_count?: number;
    like_count?: number;
    forked_from?: string | null; // UUID
    created_at?: string; // TIMESTAMPTZ
    updated_at?: string; // TIMESTAMPTZ
    // Add any other fields from your DB table
  }
  

  /** Represents an individual set within a planned exercise. */
export interface PlanExerciseSet {
    id: string;
    plan_exercise_id: string;
    set_number: number;
    target_reps?: number | null;
    target_weight?: number | null;
    target_weight_unit?: 'kg' | 'lb' | null;
    target_duration_seconds?: number | null;
    target_distance_meters?: number | null;
    target_rest_seconds?: number | null; // Rest *after* this set
    notes?: string | null;
    created_at?: string;
}

/** Represents a specific exercise within a plan day (Updated Structure) */
export interface PlanExercise {
    id: string; // UUID (Primary Key for plan_exercises)
    plan_day_id: string; // FK to plan_days
    exercise_id: string; // FK to exercises
    order_index: number; // SMALLINT NOT NULL
    notes?: string | null; // Overall notes for the exercise entry

    // Optional: Target number of sets (if kept)
    target_sets_min?: number | null;
    target_sets_max?: number | null;

    // Rest AFTER the entire exercise block
    target_rest_seconds?: number | null;

    // Nested details for individual sets
    plan_exercise_sets?: PlanExerciseSet[]; // Array of sets

    // Include nested exercise details if fetched
    exercise?: {
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
}

/** Represents a specific day within a plan week */
export interface PlanDay {
    id: string; // UUID (Primary Key for plan_days)
    plan_week_id: string; // FK to plan_weeks
    day_number: number; // SMALLINT (1-7)
    title?: string | null; // VARCHAR(255)
    description?: string | null; // TEXT
    is_rest_day?: boolean; // BOOLEAN DEFAULT FALSE
    // Nested plan exercises for this day
    plan_exercises?: PlanExercise[];
}

/** Represents a specific week within a plan */
export interface PlanWeek {
    id: string; // UUID (Primary Key for plan_weeks)
    plan_id: string; // FK to plans
    week_number: number; // SMALLINT
    description?: string | null; // TEXT
    // Nested plan days for this week
    plan_days?: PlanDay[];
}

export interface PlanDetail extends Plan {
    plan_weeks?: Array<{ // PlanWeek structure remains the same
        id: string;
        plan_id: string;
        week_number: number;
        description?: string | null;
        plan_days?: Array<{ // PlanDay structure remains the same
            id: string;
            plan_week_id: string;
            day_number: number;
            title?: string | null;
            description?: string | null;
            is_rest_day?: boolean;
            // PlanExercises now contain nested sets
            plan_exercises?: PlanExercise[]; // This type now includes plan_exercise_sets
        }>;
    }>;
    created_by_profile?: { /* ... */ } | null;
    team?: { /* ... */ } | null;
}

// --- Payload Types for Creating/Updating Structure ---

export interface PlanWeekPayload {
    plan_id: string;
    week_number: number; // Client might need to suggest the next available number
    description?: string | null;
}

export interface PlanDayPayload {
    plan_week_id: string;
    day_number: number; // Client might need to suggest the next available number (1-7)
    title?: string | null;
    description?: string | null;
    is_rest_day?: boolean;
}

// Payload for creating/updating a plan_exercise entry
// Excludes id, plan_day_id (usually passed separately or inferred)
export interface PlanExercisePayload {
    exercise_id: string; // Required: which exercise to link
    order_index: number; // Required: position within the day
    sets?: string | null;
    reps?: string | null;
    duration?: string | null;
    distance?: string | null;
    rest_time?: string | null;
    target_sets_min?: number | null;
    target_sets_max?: number | null;
    target_reps_min?: number | null;
    target_reps_max?: number | null;
    target_weight?: number | null;
    target_weight_unit?: string | null;
    target_duration_seconds?: number | null;
    target_distance_meters?: number | null;
    target_rest_seconds?: number | null;
    notes?: string | null;
}

export interface PlanExerciseEntryPayload {
    exercise_id: string;
    notes?: string | null;
    target_sets_min?: number | null; // Optional: If you track target set count
    target_sets_max?: number | null; // Optional: If you track target set count
    target_rest_seconds?: number | null; // Optional: Rest after the whole exercise block
}

// Payload for creating/updating an individual set
export interface PlanSetPayload {
    // plan_exercise_id and set_number usually managed externally or passed separately
    target_reps?: number | null;
    target_weight?: number | null;
    target_weight_unit?: 'kg' | 'lb' | null;
    target_duration_seconds?: number | null;
    target_distance_meters?: number | null;
    target_rest_seconds?: number | null; // Rest after *this* set
    notes?: string | null;
}

// Zod for the Add/Edit Set Form
export const SetFormSchema = z.object({
    // set_number: managed externally
    target_reps: z.coerce.number().int().positive().optional().nullable(),
    target_weight: z.coerce.number().positive().optional().nullable(),
    target_weight_unit: z.enum(['kg', 'lb']).optional().nullable(),
    target_duration_seconds: z.coerce.number().int().positive().optional().nullable(),
    target_distance_meters: z.coerce.number().positive().optional().nullable(),
    target_rest_seconds: z.coerce.number().int().positive().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
}).refine(data => (data.target_weight !== null && data.target_weight !== undefined) ? data.target_weight_unit !== null && data.target_weight_unit !== undefined : true, {
    message: "Weight unit is required if weight is specified",
    path: ["target_weight_unit"],
});
export type SetFormValues = z.infer<typeof SetFormSchema>;

// Zod for the main Add Exercise Entry (simpler now)
export const AddExerciseEntrySchema = z.object({
    exercise_id: z.string().uuid({ message: "Please select a valid exercise." }),
    notes: z.string().max(500).optional().nullable(),
    target_sets_min: z.coerce.number().int().positive().optional().nullable(),
    target_sets_max: z.coerce.number().int().positive().optional().nullable(),
    target_rest_seconds: z.coerce.number().int().positive().optional().nullable(),
    // Add refine for sets min/max if using them
});
export type AddExerciseEntryValues = z.infer<typeof AddExerciseEntrySchema>;