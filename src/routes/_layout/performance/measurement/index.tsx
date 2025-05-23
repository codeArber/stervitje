import { getDisplayLabel } from '@/lib/data';
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Camera, Heart, Ruler, Save, User, X } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/_layout/performance/measurement/')({
  component: RouteComponent,
})

interface FormData {
  measurement_date: string;
  weight_kg: string;
  height_cm: string;
  body_fat_percentage: string;
  resting_heart_rate: string;
  biceps_left_cm: string;
  biceps_right_cm: string;
  forearm_left_cm: string;
  forearm_right_cm: string;
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  thigh_left_cm: string;
  thigh_right_cm: string;
  calf_left_cm: string;
  calf_right_cm: string;
  overall_notes: string;
}

interface PhotoData {
  file: File;
  preview: string;
  name: string;
}

interface NumberInputProps {
  field: keyof FormData;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PhotoUploadProps {
  field: string;
  relatedMeasurement: keyof FormData;
}

interface PairedMeasurementProps {
  leftField: keyof FormData;
  rightField: keyof FormData;
  photoLeftField?: string;
  photoRightField?: string;
  label: string;
}

function RouteComponent() {
  const [formData, setFormData] = useState<FormData>({
    measurement_date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    body_fat_percentage: '',
    resting_heart_rate: '',
    biceps_left_cm: '',
    biceps_right_cm: '',
    forearm_left_cm: '',
    forearm_right_cm: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    thigh_left_cm: '',
    thigh_right_cm: '',
    calf_left_cm: '',
    calf_right_cm: '',
    overall_notes: ''
  });

  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (field: string, file: File | null): void => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setPhotos(prev => ({
            ...prev,
            [field]: {
              file,
              preview: e.target!.result as string,
              name: file.name
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (field: string): void => {
    setPhotos(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would implement your actual submission logic
      // 1. Upload photos to storage (Supabase Storage)
      // 2. Insert measurement data with photo URLs
      console.log('Form Data:', formData);
      console.log('Photos:', photos);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Measurements saved successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Error saving measurements. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnit = (fieldName: string): string => {
    if (fieldName.includes('_kg')) return 'kg';
    if (fieldName.includes('_cm')) return 'cm';
    if (fieldName.includes('percentage')) return '%';
    if (fieldName.includes('heart_rate')) return 'bpm';
    return '';
  };

  const NumberInput: React.FC<NumberInputProps> = ({ field, placeholder, icon: Icon }) => (
    <div className="space-y-2">
      <Label className="flex items-center text-sm font-medium">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {getDisplayLabel(field)}
        <span className="ml-1 text-muted-foreground">({getUnit(field)})</span>
      </Label>
      <Input
        type="number"
        step="0.1"
        value={formData[field]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const PhotoUpload: React.FC<PhotoUploadProps> = ({ field }) => (
    <div className="space-y-2">
      <Label className="flex items-center text-sm font-medium">
        <Camera className="w-4 h-4 mr-2" />
        {getDisplayLabel(field)}
      </Label>
      
      {photos[field] ? (
        <div className="relative">
          <img
            src={photos[field].preview}
            alt={getDisplayLabel(field)}
            className="w-full h-32 object-cover rounded-md border"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => removePhoto(field)}
            className="absolute top-1 right-1 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
          <div className="text-xs text-muted-foreground mt-1">{photos[field].name}</div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePhotoUpload(field, e.target.files?.[0] || null)
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={field}
          />
          <Label
            htmlFor={field}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Upload Photo</span>
          </Label>
        </div>
      )}
    </div>
  );

  const PairedMeasurement: React.FC<PairedMeasurementProps> = ({ 
    leftField, 
    rightField, 
    photoLeftField, 
    photoRightField, 
    label 
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <NumberInput field={leftField} />
            {photoLeftField && <PhotoUpload field={photoLeftField} relatedMeasurement={leftField} />}
          </div>
          <div className="space-y-4">
            <NumberInput field={rightField} />
            {photoRightField && <PhotoUpload field={photoRightField} relatedMeasurement={rightField} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Measurements</h1>
        <p className="text-muted-foreground">Record your body measurements and track your progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                {getDisplayLabel('measurement_date')}
              </Label>
              <Input
                type="date"
                value={formData.measurement_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('measurement_date', e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="body-composition" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="body-composition" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Body Composition
            </TabsTrigger>
            <TabsTrigger value="health-metrics" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Health Metrics
            </TabsTrigger>
            <TabsTrigger value="circumferences" className="flex items-center">
              <Ruler className="w-4 h-4 mr-2" />
              Circumferences
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="body-composition">
            <Card>
              <CardHeader>
                <CardTitle>Body Composition</CardTitle>
                <CardDescription>Record your basic body measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NumberInput field="weight_kg" placeholder="Enter your weight" icon={User} />
                  <NumberInput field="height_cm" placeholder="Enter your height" icon={User} />
                  <div className="space-y-4">
                    <NumberInput field="body_fat_percentage" placeholder="Enter body fat percentage" />
                    <PhotoUpload field="body_fat_photo_url" relatedMeasurement="body_fat_percentage" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health-metrics">
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Record your health-related measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NumberInput field="resting_heart_rate" placeholder="Enter resting heart rate" icon={Heart} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circumferences">
            <Card>
              <CardHeader>
                <CardTitle>Circumferences</CardTitle>
                <CardDescription>Record circumference measurements for different body parts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Arms */}
                <div>
                  <h4 className="text-md font-medium mb-4">Arms</h4>
                  <div className="space-y-4">
                    <PairedMeasurement
                      leftField="biceps_left_cm"
                      rightField="biceps_right_cm"
                      photoLeftField="biceps_left_photo_url"
                      photoRightField="biceps_right_photo_url"
                      label="Biceps"
                    />
                    <PairedMeasurement
                      leftField="forearm_left_cm"
                      rightField="forearm_right_cm"
                      photoLeftField="forearm_left_photo_url"
                      photoRightField="forearm_right_photo_url"
                      label="Forearms"
                    />
                  </div>
                </div>

                {/* Torso */}
                <div>
                  <h4 className="text-md font-medium mb-4">Torso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Chest</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <NumberInput field="chest_cm" />
                        <PhotoUpload field="chest_photo_url" relatedMeasurement="chest_cm" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Waist</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <NumberInput field="waist_cm" />
                        <PhotoUpload field="waist_photo_url" relatedMeasurement="waist_cm" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Hips</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <NumberInput field="hips_cm" />
                        <PhotoUpload field="hips_photo_url" relatedMeasurement="hips_cm" />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Legs */}
                <div>
                  <h4 className="text-md font-medium mb-4">Legs</h4>
                  <div className="space-y-4">
                    <PairedMeasurement
                      leftField="thigh_left_cm"
                      rightField="thigh_right_cm"
                      photoLeftField="thigh_left_photo_url"
                      photoRightField="thigh_right_photo_url"
                      label="Thighs"
                    />
                    <PairedMeasurement
                      leftField="calf_left_cm"
                      rightField="calf_right_cm"
                      photoLeftField="calf_left_photo_url"
                      photoRightField="calf_right_photo_url"
                      label="Calves"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Add any additional notes about your measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>{getDisplayLabel('overall_notes')}</Label>
                  <Textarea
                    value={formData.overall_notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleInputChange('overall_notes', e.target.value)
                    }
                    placeholder="Add any notes about your measurements, training, diet, or how you're feeling..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Measurements'}
          </Button>
        </div>
      </form>
    </div>
  );
}