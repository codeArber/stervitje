// FILE: src/components/measurements/measurement-form.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth-store';
import { useInsertUserMeasurementMutation } from '@/api/user';
import { uploadMeasurementImage } from '@/types/storage';

import type { TablesInsert } from '@/types/database.types';

// Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Icons
import { Ruler, PlusCircle, Scale, CalendarDays, Percent, HeartPulse, User, Zap, Target } from 'lucide-react';
import { MeasurementInputWithPhoto } from './MeasurementInputWithPhoto';

// Import the reusable input component

// --- CORRECTED ZOD SCHEMA ---
// Fields are now z.string() for form input, then transformed to number | null.
const toNullableNumber = z.literal('').transform(() => null).or(z.coerce.number());

const measurementSchema = z.object({
  measurement_date: z.string().optional(),
  weight_kg: toNullableNumber.nullable().optional(),
  height_cm: toNullableNumber.nullable().optional(),
  body_fat_percentage: toNullableNumber.nullable().optional(),
  body_fat_photo_url: z.string().nullable().optional(),
  resting_heart_rate: toNullableNumber.nullable().optional(),
  biceps_left_cm: toNullableNumber.nullable().optional(),
  biceps_left_photo_url: z.string().nullable().optional(),
  biceps_right_cm: toNullableNumber.nullable().optional(),
  biceps_right_photo_url: z.string().nullable().optional(),
  waist_cm: toNullableNumber.nullable().optional(),
  waist_photo_url: z.string().nullable().optional(),
  chest_cm: toNullableNumber.nullable().optional(),
  chest_photo_url: z.string().nullable().optional(),
  thigh_left_cm: toNullableNumber.nullable().optional(),
  thigh_left_photo_url: z.string().nullable().optional(),
  thigh_right_cm: toNullableNumber.nullable().optional(),
  thigh_right_photo_url: z.string().nullable().optional(),
  calf_left_cm: toNullableNumber.nullable().optional(),
  calf_left_photo_url: z.string().nullable().optional(),
  calf_right_cm: toNullableNumber.nullable().optional(),
  calf_right_photo_url: z.string().nullable().optional(),
  hips_cm: toNullableNumber.nullable().optional(),
  hips_photo_url: z.string().nullable().optional(),
  forearm_left_cm: toNullableNumber.nullable().optional(),
  forearm_left_photo_url: z.string().nullable().optional(),
  forearm_right_cm: toNullableNumber.nullable().optional(),
  forearm_right_photo_url: z.string().nullable().optional(),
  overall_notes: z.string().nullable().optional(),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;

export const MeasurementForm: React.FC = () => {
  const { user } = useAuthStore();
  const { mutate: insertMeasurement, isPending } = useInsertUserMeasurementMutation();

  const form = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measurement_date: dayjs().format('YYYY-MM-DD'),
      // Initialize number fields with null (or undefined) directly now.
      // The `toNullableNumber` transform handles '' from user input.
      weight_kg: null,
      height_cm: null,
      body_fat_percentage: null,
      body_fat_photo_url: null,
      resting_heart_rate: null,
      biceps_left_cm: null,
      biceps_left_photo_url: null,
      biceps_right_cm: null,
      biceps_right_photo_url: null,
      waist_cm: null,
      waist_photo_url: null,
      chest_cm: null,
      chest_photo_url: null,
      thigh_left_cm: null,
      thigh_left_photo_url: null,
      thigh_right_cm: null,
      thigh_right_photo_url: null,
      calf_left_cm: null,
      calf_left_photo_url: null,
      calf_right_cm: null,
      calf_right_photo_url: null,
      hips_cm: null,
      hips_photo_url: null,
      forearm_left_cm: null,
      forearm_left_photo_url: null,
      forearm_right_cm: null,
      forearm_right_photo_url: null,
      overall_notes: null,
    },
  });

  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof MeasurementFormData
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to upload images.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const measurementDate = form.getValues('measurement_date') || dayjs().format('YYYY-MM-DD');

    try {
      const publicUrl = await uploadMeasurementImage(file, user.id, measurementDate, fieldName as string);
      form.setValue(fieldName, publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const onSubmit = (data: MeasurementFormData) => {
    // Zod's transform handles string to number|null.
    // We just need to filter out `undefined` values, as `null` is fine for DB.
    const payload: TablesInsert<'user_measurements'> = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as TablesInsert<'user_measurements'>;
    
    insertMeasurement(payload, {
      onSuccess: () => {
        form.reset({
          measurement_date: dayjs().format('YYYY-MM-DD'),
          // Reset number fields to null to match defaultValues
          weight_kg: null,
          height_cm: null,
          body_fat_percentage: null,
          body_fat_photo_url: null,
          resting_heart_rate: null,
          biceps_left_cm: null,
          biceps_left_photo_url: null,
          biceps_right_cm: null,
          biceps_right_photo_url: null,
          waist_cm: null,
          waist_photo_url: null,
          chest_cm: null,
          chest_photo_url: null,
          thigh_left_cm: null,
          thigh_left_photo_url: null,
          thigh_right_cm: null,
          thigh_right_photo_url: null,
          calf_left_cm: null,
          calf_left_photo_url: null,
          calf_right_cm: null,
          calf_right_photo_url: null,
          hips_cm: null,
          hips_photo_url: null,
          forearm_left_cm: null,
          forearm_left_photo_url: null,
          forearm_right_cm: null,
          forearm_right_photo_url: null,
          overall_notes: null,
        });
        toast.success('Measurement added successfully!');
      },
      onError: (error) => {
        toast.error(`Error adding measurement: ${error.message}`);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add New Measurement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="measurement_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Measurement Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="upper" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Upper Body
                </TabsTrigger>
                <TabsTrigger value="lower" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Lower Body
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Weight */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="weight_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Weight (kg)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g., 70.5"
                              {...field}
                              value={field.value ?? ''} // Use nullish coalescing to ensure string for input
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="height_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Height (cm)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g., 175"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Resting HR */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="resting_heart_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <HeartPulse className="h-4 w-4" />
                            Resting HR (bpm)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="e.g., 60"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Body Fat % with Photo */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <MeasurementInputWithPhoto
                      form={form}
                      measurementField="body_fat_percentage"
                      photoField="body_fat_photo_url"
                      label="Body Fat (%)"
                      placeholder="e.g., 15.2"
                      icon={Percent}
                      onImageUpload={handleImageUpload}
                      isUploadingImage={isUploadingImage}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upper" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="chest_cm"
                    photoField="chest_photo_url"
                    label="Chest (cm)"
                    placeholder="e.g., 100.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="waist_cm"
                    photoField="waist_photo_url"
                    label="Waist (cm)"
                    placeholder="e.g., 80.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="biceps_left_cm"
                    photoField="biceps_left_photo_url"
                    label="Biceps Left (cm)"
                    placeholder="e.g., 35.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="biceps_right_cm"
                    photoField="biceps_right_photo_url"
                    label="Biceps Right (cm)"
                    placeholder="e.g., 35.2"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="forearm_left_cm"
                    photoField="forearm_left_photo_url"
                    label="Forearm Left (cm)"
                    placeholder="e.g., 28.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="forearm_right_cm"
                    photoField="forearm_right_photo_url"
                    label="Forearm Right (cm)"
                    placeholder="e.g., 28.1"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />
                </div>
              </TabsContent>

              <TabsContent value="lower" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="hips_cm"
                    photoField="hips_photo_url"
                    label="Hips (cm)"
                    placeholder="e.g., 95.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="thigh_left_cm"
                    photoField="thigh_left_photo_url"
                    label="Thigh Left (cm)"
                    placeholder="e.g., 55.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="thigh_right_cm"
                    photoField="thigh_right_photo_url"
                    label="Thigh Right (cm)"
                    placeholder="e.g., 55.5"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="calf_left_cm"
                    photoField="calf_left_photo_url"
                    label="Calf Left (cm)"
                    placeholder="e.g., 38.0"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />

                  <MeasurementInputWithPhoto
                    form={form}
                    measurementField="calf_right_cm"
                    photoField="calf_right_photo_url"
                    label="Calf Right (cm)"
                    placeholder="e.g., 38.2"
                    onImageUpload={handleImageUpload}
                    isUploadingImage={isUploadingImage}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="overall_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this measurement session..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending || isUploadingImage}
              className="w-full sm:w-auto"
              size="lg"
            >
              {(isPending || isUploadingImage) ? 'Processing...' : 'Add Measurement'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};