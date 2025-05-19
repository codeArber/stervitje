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
    category?: string;
    difficulty?: number;
    type?: string;
    environment?: string;
    muscle?: string;
    createdByUserId?: string; // To fetch only user's exercises
}
