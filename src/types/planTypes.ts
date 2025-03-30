// src/types/planTypes.ts (Ensure this is up-to-date)

import { z } from "zod";

// Set (Innermost)
export interface PlanExerciseSet {
    id: string;
    plan_session_exercise_id: string;
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

// Exercise Entry in Session (Contains Sets)
export interface PlanSessionExercise {
    id: string;
    plan_session_id: string;
    exercise_id: string;
    order_index: number;
    notes?: string | null; // Overall notes
    target_rest_seconds?: number | null; // Rest *after* exercise block
    // Nested Data
    plan_exercise_sets?: PlanExerciseSet[]; // Renamed from plan_session_exercise_sets for clarity maybe? Or keep DB name. Let's keep DB name for now.
    plan_session_exercise_sets?: PlanExerciseSet[];
    exercise?: { // Basic linked exercise info
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
}

// Session in Day (Contains Exercise Entries)
export interface PlanSession {
    id: string;
    plan_day_id: string;
    order_index: number;
    title?: string | null;
    notes?: string | null;
    // Nested Data
    plan_session_exercises?: PlanSessionExercise[];
}

// Day in Week (Contains Sessions)
export interface PlanDay {
    id: string;
    plan_week_id: string;
    day_number: number;
    title?: string | null; // Maybe less relevant now session has title?
    description?: string | null;
    is_rest_day?: boolean;
    // Nested Data
    plan_sessions?: PlanSession[];
}

// Week in Plan (Contains Days)
export interface PlanWeek {
    id: string;
    plan_id: string;
    week_number: number;
    description?: string | null;
    // Nested Data
    plan_days?: PlanDay[];
}

// Base Plan (Top Level Info)
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
}

// Full Plan Detail Structure (Extends Plan, Contains Nested Data)
export interface PlanDetail extends Plan {
    plan_weeks?: PlanWeek[]; // Array of weeks
    // Include creator profile info if joined
    created_by_profile?: {
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
}).refine(data => data.visibility !== 'team', { // Basic check, needs team_id if visibility is team
    message: "Team ID required if visibility is 'team'",
    path: ["visibility"], // Or path: ["team_id"]
});
export type CreatePlanPayload = z.infer<typeof CreatePlanSchema>;

// Type for Updating a Plan (Partial of CreatePlanPayload)
export type UpdatePlanPayload = Partial<CreatePlanPayload>;