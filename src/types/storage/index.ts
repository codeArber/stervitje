// FILE: /src/lib/supabase/storage.ts

import { supabase } from '@/lib/supabase/supabaseClient'; // Assuming this import exists

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

/**
 * Uploads an image to the 'measurements' Supabase bucket and returns its public URL.
 * Organizes images by user ID and measurement date.
 * @param file - The File object to upload.
 * @param userId - The ID of the authenticated user.
 * @param measurementDate - The date of the measurement (YYYY-MM-DD format).
 * @param fieldName - The specific measurement field this image is for (e.g., 'biceps_right_photo').
 * @returns The public URL of the uploaded image.
 */
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export const uploadMeasurementImage = async (
  file: File,
  userId: string,
  measurementDate: string, // YYYY-MM-DD
  fieldName: string // e.g., 'biceps_right_photo_url'
): Promise<string> => {
  const bucketName = 'measurements';
  const fileExtension = file.name.split('.').pop();
  // Ensure unique filename to prevent overwrites, use fieldName and a UUID/timestamp
  const fileName = `${fieldName}_${uuidv4()}.${fileExtension}`;
  const filePath = `${userId}/${measurementDate}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Set to true if you want to overwrite existing files at the same path
    });

  if (error) {
    console.error(`Error uploading image for ${fieldName}:`, error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image.');
  }

  return publicUrlData.publicUrl;
};

/**
 * Constructs the public URL for a measurement image from its full storage path.
 * This is useful if you store the full path (userId/date/filename) in the DB.
 * Or you can store the full public URL directly. Assuming full public URL is stored.
 * @param fullPublicUrl - The full public URL stored in the database.
 * @returns The full public URL.
 */
export const getMeasurementImageUrl = (fullPublicUrl: string | null | undefined): string => {
  if (!fullPublicUrl) {
    return 'https://placehold.co/100x100?text=No+Image'; // Placeholder for missing images
  }
  return fullPublicUrl;
};