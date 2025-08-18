// FILE: src/components/measurements/measurement-input-with-photo.tsx

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Camera, ImageIcon, Ruler } from 'lucide-react'; // Import Ruler for default icon
import { getMeasurementImageUrl } from '@/types/storage';

// --- CORRECTED ZOD SCHEMA FOR THIS COMPONENT'S TYPING ---
// Matches the `toNullableNumber` pattern from MeasurementForm.
const toNullableNumberForInput = z.literal('').transform(() => null).or(z.coerce.number());

const measurementSchemaForInput = z.object({
  measurement_date: z.string().optional(),
  weight_kg: toNullableNumberForInput.nullable().optional(),
  height_cm: toNullableNumberForInput.nullable().optional(),
  body_fat_percentage: toNullableNumberForInput.nullable().optional(),
  body_fat_photo_url: z.string().nullable().optional(),
  resting_heart_rate: toNullableNumberForInput.nullable().optional(),
  biceps_left_cm: toNullableNumberForInput.nullable().optional(),
  biceps_left_photo_url: z.string().nullable().optional(),
  biceps_right_cm: toNullableNumberForInput.nullable().optional(),
  biceps_right_photo_url: z.string().nullable().optional(),
  waist_cm: toNullableNumberForInput.nullable().optional(),
  waist_photo_url: z.string().nullable().optional(),
  chest_cm: toNullableNumberForInput.nullable().optional(),
  chest_photo_url: z.string().nullable().optional(),
  thigh_left_cm: toNullableNumberForInput.nullable().optional(),
  thigh_left_photo_url: z.string().nullable().optional(),
  thigh_right_cm: toNullableNumberForInput.nullable().optional(),
  thigh_right_photo_url: z.string().nullable().optional(),
  calf_left_cm: toNullableNumberForInput.nullable().optional(),
  calf_left_photo_url: z.string().nullable().optional(),
  calf_right_cm: toNullableNumberForInput.nullable().optional(),
  calf_right_photo_url: z.string().nullable().optional(),
  hips_cm: toNullableNumberForInput.nullable().optional(),
  hips_photo_url: z.string().nullable().optional(),
  forearm_left_cm: toNullableNumberForInput.nullable().optional(),
  forearm_left_photo_url: z.string().nullable().optional(),
  forearm_right_cm: toNullableNumberForInput.nullable().optional(),
  forearm_right_photo_url: z.string().nullable().optional(),
  overall_notes: z.string().nullable().optional(),
});
type MeasurementFormData = z.infer<typeof measurementSchemaForInput>;

interface MeasurementInputWithPhotoProps {
  form: UseFormReturn<MeasurementFormData>;
  measurementField: keyof MeasurementFormData;
  photoField: keyof MeasurementFormData;
  label: string;
  placeholder: string;
  icon?: React.ElementType;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof MeasurementFormData) => Promise<void>;
  isUploadingImage: boolean;
}

export const MeasurementInputWithPhoto: React.FC<MeasurementInputWithPhotoProps> = ({
  form,
  measurementField,
  photoField,
  label,
  placeholder,
  icon: Icon = Ruler,
  onImageUpload,
  isUploadingImage,
}) => {
  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={measurementField}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''} // <--- FIX: Use nullish coalescing to ensure string for input
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={photoField}
        render={({ field }) => {
          // Narrow the field value to a string (or null) before passing to getMeasurementImageUrl
          const photoValue = field.value as string | null | undefined;
          const photoSrc = typeof photoValue === 'string' ? getMeasurementImageUrl(photoValue) : getMeasurementImageUrl(null);

          return (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, photoField)}
                  disabled={isUploadingImage}
                  className="cursor-pointer"
                />
              </FormControl>
              {field.value && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-md">
                  <img
                    src={photoSrc}
                    alt={`${label} Preview`}
                    className="h-12 w-12 object-cover rounded-md border"
                  />
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Photo uploaded
                    </div>
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};