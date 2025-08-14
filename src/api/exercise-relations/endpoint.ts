// src/api/exercise-relations/endpoint.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { 
  ExerciseToCategory, 
  ExerciseToType, 
  ExerciseMuscle, 
  ExerciseReferenceGlobal 
} from '@/types/index';

// --- Exercise Category Operations ---

/** Fetches all exercise categories */
export const fetchExerciseCategories = async (): Promise<ExerciseToCategory[]> => {
  const { data, error } = await supabase
    .from('exercise_to_category')
    .select('*');

  if (error) {
    console.error('API Error fetchExerciseCategories:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new exercise-category relationship */
export const createExerciseCategory = async (payload: ExerciseToCategory): Promise<ExerciseToCategory> => {
  const { data, error } = await supabase
    .from('exercise_to_category')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createExerciseCategory:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes an exercise-category relationship */
export const deleteExerciseCategory = async (exerciseId: string, category: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('exercise_to_category')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('category', category);

  if (error) {
    console.error(`API Error deleteExerciseCategory (Exercise ID: ${exerciseId}, Category: ${category}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Exercise Type Operations ---

/** Fetches all exercise types */
export const fetchExerciseTypes = async (): Promise<ExerciseToType[]> => {
  const { data, error } = await supabase
    .from('exercise_to_type')
    .select('*');

  if (error) {
    console.error('API Error fetchExerciseTypes:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new exercise-type relationship */
export const createExerciseType = async (payload: ExerciseToType): Promise<ExerciseToType> => {
  const { data, error } = await supabase
    .from('exercise_to_type')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createExerciseType:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes an exercise-type relationship */
export const deleteExerciseType = async (exerciseId: string, type: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('exercise_to_type')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('type', type);

  if (error) {
    console.error(`API Error deleteExerciseType (Exercise ID: ${exerciseId}, Type: ${type}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Exercise Muscle Operations ---

/** Fetches all exercise muscles */
export const fetchExerciseMuscles = async (): Promise<ExerciseMuscle[]> => {
  const { data, error } = await supabase
    .from('exercise_muscle')
    .select('*');

  if (error) {
    console.error('API Error fetchExerciseMuscles:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new exercise-muscle relationship */
export const createExerciseMuscle = async (payload: Omit<ExerciseMuscle, 'id' | 'created_at'>): Promise<ExerciseMuscle> => {
  const { data, error } = await supabase
    .from('exercise_muscle')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("API Error createExerciseMuscle:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes an exercise-muscle relationship */
export const deleteExerciseMuscle = async (muscleId: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('exercise_muscle')
    .delete()
    .eq('id', muscleId);

  if (error) {
    console.error(`API Error deleteExerciseMuscle (Muscle ID: ${muscleId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};

// --- Exercise Reference Global Operations ---

/** Fetches all global exercise references */
export const fetchExerciseReferenceGlobals = async (): Promise<ExerciseReferenceGlobal[]> => {
  const { data, error } = await supabase
    .from('exercise_reference_global')
    .select('*');

  if (error) {
    console.error('API Error fetchExerciseReferenceGlobals:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/** Creates a new global exercise reference */
export const createExerciseReferenceGlobal = async (payload: Omit<ExerciseReferenceGlobal, 'id' | 'created_at' | 'created_by'>): Promise<ExerciseReferenceGlobal> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const referenceData = {
    ...payload,
    created_by: user.id
  };

  const { data, error } = await supabase
    .from('exercise_reference_global')
    .insert(referenceData)
    .select()
    .single();

  if (error) {
    console.error("API Error createExerciseReferenceGlobal:", error);
    throw new Error(error.message);
  }

  return data;
};

/** Updates a global exercise reference */
export const updateExerciseReferenceGlobal = async (
  referenceId: string,
  payload: Partial<Omit<ExerciseReferenceGlobal, 'id' | 'created_at' | 'created_by'>>
): Promise<ExerciseReferenceGlobal> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing reference to check ownership
  const { data: existingReference, error: fetchError } = await supabase
    .from('exercise_reference_global')
    .select('created_by')
    .eq('id', referenceId)
    .single();

  if (fetchError) {
    console.error(`API Error updateExerciseReferenceGlobal (ID: ${referenceId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingReference.created_by !== user.id) {
    throw new Error("Cannot update another user's reference");
  }

  const { data, error } = await supabase
    .from('exercise_reference_global')
    .update(payload)
    .eq('id', referenceId)
    .select()
    .single();

  if (error) {
    console.error(`API Error updateExerciseReferenceGlobal (ID: ${referenceId}):`, error);
    throw new Error(error.message);
  }

  return data;
};

/** Deletes a global exercise reference */
export const deleteExerciseReferenceGlobal = async (referenceId: string): Promise<{ success: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // First fetch the existing reference to check ownership
  const { data: existingReference, error: fetchError } = await supabase
    .from('exercise_reference_global')
    .select('created_by')
    .eq('id', referenceId)
    .single();

  if (fetchError) {
    console.error(`API Error deleteExerciseReferenceGlobal (ID: ${referenceId}):`, fetchError);
    throw new Error(fetchError.message);
  }

  // Verify ownership
  if (existingReference.created_by !== user.id) {
    throw new Error("Cannot delete another user's reference");
  }

  const { error } = await supabase
    .from('exercise_reference_global')
    .delete()
    .eq('id', referenceId);

  if (error) {
    console.error(`API Error deleteExerciseReferenceGlobal (ID: ${referenceId}):`, error);
    throw new Error(error.message);
  }

  return { success: true };
};
