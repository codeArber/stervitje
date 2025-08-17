// FILE: /src/lib/supabase/storage.ts

/**
 * Constructs the public URL for an exercise image from its filename.
 * @param fileName - The name of the file stored in the 'exercises' bucket (e.g., 'barbell-squat.webp').
 * @returns The full public URL to the image, or a placeholder if no name is provided.
 */
export const getExerciseImageUrl = (fileName: string | null | undefined): string => {
  if (!fileName) {
    // Return a generic placeholder or an empty string if no image is specified
    return 'https://placehold.co/200x200?text=No+Image';
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("Supabase URL is not defined in environment variables.");
    return ''; // Fallback
  }
  
  // Construct the URL directly from the filename
  return `${supabaseUrl}/storage/v1/object/public/exercises/${fileName}`;
};