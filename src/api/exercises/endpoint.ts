// src/api/exercises/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient'; // Adjust path
import type { Exercise, ExercisePayload, FetchExercisesParams } from '@/types/type'; // Adjust path

const DEFAULT_LIMIT = 20;

/** Fetches a single exercise by its ID, including categories */
export const fetchExerciseById = async (exerciseId: string): Promise<Exercise | null> => {
    if (!exerciseId) return null;

    // Cleaned-up select statement without internal comments
    // This syntax tells Supabase: select all columns from 'exercises' (*),
    // and also follow the relationship inferred from the 'exercise_category_mapping' table
    // to get the 'id' and 'name' from the related 'exercise_categories' table.
    // The alias 'categories' makes the result nested under that key.
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            exercise_reference(*),
            exercise_muscle(*)
            `)
        .eq('id', exerciseId)
        .single(); // Use .single() for fetching by unique ID

    if (error) {
        if (error.code === 'PGRST116') { // Handle "not found" gracefully
            console.warn(`API Warning fetchExerciseById: Exercise ${exerciseId} not found.`);
            return null;
        }
        console.error(`API Error fetchExerciseById (ID: ${exerciseId}):`, error);
        throw new Error(error.message);
    }

    // Transform the nested structure returned by Supabase for categories
    const exerciseData = data as any; // Use intermediate 'any' or a more specific fetch type
    if (exerciseData && Array.isArray(exerciseData.categories)) {
        exerciseData.categories = exerciseData.categories
            // The result is [{ exercise_categories: {id: ..., name: ...} }, ...]
            .map((mapping: any) => mapping.exercise_categories)
            // Filter out any potential nulls if relationships weren't found (shouldn't happen with INNER join default)
            .filter(Boolean);
    } else {
        // Ensure categories array exists even if empty
        exerciseData.categories = [];
    }

    return exerciseData as Exercise;
};

/** Fetches a list of exercises (id, name) suitable for selection components */
export const fetchExerciseListForSelector = async (searchTerm?: string): Promise<Array<{ id: string; name: string }>> => {
    // Select only id and name for efficiency
    let query = supabase
        .from('exercises')
        .select('id, name')
        .eq('is_public', true) // Typically only show public exercises for selection
        .order('name', { ascending: true })
        .limit(50); // Limit initial results, add search later if needed

    // Optional: Add server-side search if the list is very large
    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("API Error fetchExerciseListForSelector:", error);
        throw new Error(error.message);
    }
    return data || [];
};


/** Fetches a list of exercises with optional filters and pagination */
export const fetchExercises = async (params: FetchExercisesParams = {}): Promise<Exercise[]> => {
    const {
        page = 1,
        limit = DEFAULT_LIMIT,
        searchTerm,
        categoryId,
        difficulty,
        isPublic,
        createdByUserId,
    } = params;

    const offset = (page - 1) * limit;

    let query = supabase
        .from('exercises')
        // Select specific columns for list view efficiency. Avoid '*' if possible.
        // Avoid fetching categories here unless absolutely necessary for the list view itself,
        // as it adds overhead for each item.
        .select(`
            id, name, description, difficulty_level, image_url, is_public, created_at
        `)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    // Apply filters conditionally
    if (searchTerm) {
        // Use textSearch for potentially better performance on larger datasets if you set up tsvector columns,
        // otherwise ilike is fine for simpler cases.
        query = query.ilike('name', `%${searchTerm}%`);
    }
    if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
    }
    if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
    }
    if (createdByUserId) {
        query = query.eq('created_by', createdByUserId);
    }
    // Filtering by category requires checking the mapping table.
    if (categoryId) {
        // This is the correct way to filter based on a many-to-many relationship using the join table.
        // Find exercises whose 'id' is present in the 'exercise_category_mapping' table
        // where the 'category_id' matches the one we're filtering by.
        query = query.filter('exercise_category_mapping.category_id', 'eq', categoryId);
        // Note: This implicitly requires Supabase to join `exercise_category_mapping`.
        // If performance is an issue, an RPC or DB view might be better.
    }

    const { data, error } = await query;

    if (error) {
        console.error("API Error fetchExercises:", error);
        throw new Error(error.message);
    }

    return (data as Exercise[]) || [];
};


/** Creates a new exercise */
export const createExercise = async (payload: ExercisePayload): Promise<Exercise> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const { category, ...exerciseData } = payload;

    const { data: newExercise, error: insertError } = await supabase
        .from('exercises')
        .insert({
            ...exerciseData,
            created_by: user.id
        })
        .select() // Select the entire newly created row
        .single();

    if (insertError) {
        console.error("API Error createExercise (insert):", insertError);
        throw new Error(insertError.message);
    }
    if (!newExercise) {
        throw new Error("Failed to create exercise or retrieve the created record.");
    }

    // Fetch the newly created exercise *with* categories included for a complete return object
    const createdExerciseWithDetails = await fetchExerciseById(newExercise.id);
    if (!createdExerciseWithDetails) {
        // This shouldn't happen if insert succeeded, but handle defensively
        console.warn("Could not re-fetch created exercise with details, returning basic object.");
        return newExercise as Exercise;
    }
    return createdExerciseWithDetails;
};


/** Updates an existing exercise */
export const updateExercise = async (
    exerciseId: string,
    payload: Partial<ExercisePayload>
): Promise<Exercise> => {

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated.")

    /** 🔑 Remove keys whose value is `undefined`, but keep *all* others */
    const updateData = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
    )

    if (Object.keys(updateData).length === 0) {
        throw new Error("updateExercise called with an empty payload.")
    }

    const { data, error } = await supabase
        .from("exercises")
        .update(updateData)
        .eq("id", exerciseId)
        .select()
        .single()

    if (error) {
        console.error(`API Error updateExercise (ID: ${exerciseId}):`, error)
        throw new Error(error.message)
    }

    return data
}


/** Deletes an exercise */
export const deleteExercise = async (exerciseId: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // RLS should enforce ownership/permissions for deletion
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

    if (error) {
        console.error(`API Error deleteExercise (ID: ${exerciseId}):`, error);
        throw new Error(error.message);
    }
    return { success: true };
};