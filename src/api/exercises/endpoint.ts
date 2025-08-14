// src/api/exercises/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient'; // Adjust path
import { Exercise, ExerciseMuscle, ExercisePayload, ExerciseReferenceGlobal, ExerciseSavedReference, ExerciseWithRelations, FetchExercisesParams, InsertExerciseMuscle, InsertExerciseReferenceGlobal, InsertExerciseSavedReference } from '@/lib/supabase/types';

const DEFAULT_LIMIT = 20;

/** Fetches a single exercise by its ID, including categories and types */
export const fetchExerciseById = async (exerciseId: string): Promise<ExerciseWithRelations | null> => {
    if (!exerciseId) return null;

    // Fetch exercise with all related data including categories and types
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            exercise_to_category(*),
            exercise_to_type(*),
            exercise_muscle(*),
            exercise_reference_global(*),
            exercise_saved_references(*, exercise_reference_global(*))
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

    return data as ExerciseWithRelations;
};

/** Fetches a list of exercises (id, name) suitable for selection components */
export const fetchExerciseListForSelector = async (searchTerm?: string): Promise<Array<{ id: string; name: string }>> => {
    // Select only id and name for efficiency
    let query = supabase
        .from('exercises')
        .select('id, name')
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
        category,
        difficulty,
        type,
        environment,
        muscle,
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
            *,
            exercise_to_category(category),
            exercise_to_type(type)
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
    if (createdByUserId) {
        query = query.eq('created_by', createdByUserId);
    }
    if (category) {
        // Handle both single category and array of categories
        if (Array.isArray(category)) {
            // For array of categories, we need to use the 'in' operator
            query = query.in('exercise_to_category.category', category);
        } else {
            // For single category, use eq
            query = query.eq('exercise_to_category.category', category);
        }
    }
    if (type) {
        // Handle both single type and array of types
        if (Array.isArray(type)) {
            // For array of types, we need to use the 'in' operator
            query = query.in('exercise_to_type.type', type);
        } else {
            // For single type, use eq
            query = query.eq('exercise_to_type.type', type);
        }
    }
    if (environment) {
        query = query.eq('environment', environment);
    }
    if (muscle) {
        query = query.filter('exercise_muscle.muscle_group', 'eq', muscle);
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

    // Extract category and type from payload if they exist, but they're not part of the main exercise data
    // Use a type assertion to safely extract them without TypeScript errors
    const { category, type, ...exerciseData } = payload as ExercisePayload & { category?: string; type?: string };

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

    // If category was provided, create the relationship
    if (category) {
        const { error: categoryError } = await supabase
            .from('exercise_to_category')
            .insert({
                exercise_id: newExercise.id,
                category: category
            });
        
        if (categoryError) {
            console.error("API Error createExercise (category relationship):", categoryError);
            throw new Error(categoryError.message);
        }
    }

    // If type was provided, create the relationship
    if (type) {
        const { error: typeError } = await supabase
            .from('exercise_to_type')
            .insert({
                exercise_id: newExercise.id,
                type: type
            });
        
        if (typeError) {
            console.error("API Error createExercise (type relationship):", typeError);
            throw new Error(typeError.message);
        }
    }

    // Fetch the newly created exercise *with* categories and types included for a complete return object
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

    // Fetch the updated exercise with relationships for complete return object
    const updatedExerciseWithDetails = await fetchExerciseById(exerciseId);
    if (!updatedExerciseWithDetails) {
        // This shouldn't happen if update succeeded, but handle defensively
        console.warn("Could not re-fetch updated exercise with details, returning basic object.");
        return data;
    }
    return updatedExerciseWithDetails;
};


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

export const addExercisGlobalReference = async (exerciseId: string, reference: InsertExerciseReferenceGlobal): Promise<ExerciseReferenceGlobal> => {
    const { data, error } = await supabase
        .from("exercise_reference_global")
        .insert({
            ...reference,
        })
        .select()
        .single();

    if (error) {
        console.error(`API Error addExercisGlobalReference (ID: ${exerciseId}):`, error);
        throw new Error(error.message);
    }

    return data;
};

export const addExerciseMuscleGroup = async (payload: InsertExerciseMuscle): Promise<ExerciseMuscle> => {
    const { data, error } = await supabase
        .from("exercise_muscle")
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error(`API Error addExerciseMuscleGroup (ID: ${payload.exercise_id}):`, error);
        throw new Error(error.message);
    }

    return data;
};


//remove musclegroup
export const removeExerciseMuscleGroup = async (id: string, exerciseId: string): Promise<{ success: boolean, exercise_id: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // RLS should enforce ownership/permissions for deletion
    const { error } = await supabase
        .from('exercise_muscle')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`API Error removeExerciseMuscleGroup (ID: ${id}):`, error);
        throw new Error(error.message);
    }
    return { success: true , exercise_id: exerciseId };
};


export const addExerciseSavedReference = async (reference: InsertExerciseSavedReference): Promise<ExerciseSavedReference> => {
    const { data, error } = await supabase
        .from("exercise_saved_references")
        .insert({
            ...reference,
        })
        .select()
        .single();

    if (error) {
        console.error(`API Error addExerciseSavedReference (ID: ${reference.exercise_id}):`, error);
        throw new Error(error.message);
    }

    return data;
};

export const removeExerciseSavedReference = async (id: string, exerciseId: string): Promise<{ success: boolean, exercise_id: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");
    console.log(id, exerciseId)
    // RLS should enforce ownership/permissions for deletion
    const { error } = await supabase
        .from('exercise_saved_references')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`API Error removeExerciseSavedReference (ID: ${id}):`, error);
        throw new Error(error.message);
    }
    return { success: true , exercise_id: exerciseId };
};
