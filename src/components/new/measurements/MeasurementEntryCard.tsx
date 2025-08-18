// FILE: src/components/measurements/measurement-entry-card.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CalendarDays, User, Zap, Target } from 'lucide-react'; // Icons
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // For .fromNow()
dayjs.extend(relativeTime);


import type { Tables } from '@/types/database.types'; // For UserMeasurement type
import { getMeasurementImageUrl } from '@/types/storage';

interface MeasurementEntryCardProps {
  measurement: Tables<'user_measurements'>;
}

export const MeasurementEntryCard: React.FC<MeasurementEntryCardProps> = ({ measurement: m }) => {
  return (
    <Card key={m.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {dayjs(m.measurement_date).format('MMMM D, YYYY')}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {dayjs(m.created_at).fromNow()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Measurements */}
        {(m.weight_kg || m.height_cm || m.body_fat_percentage || m.resting_heart_rate) && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <User className="h-3 w-3" />
              BASIC INFO
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {m.weight_kg && (
                <div className="text-sm">
                  <span className="font-medium">Weight:</span> {m.weight_kg} kg
                </div>
              )}
              {m.height_cm && (
                <div className="text-sm">
                  <span className="font-medium">Height:</span> {m.height_cm} cm
                </div>
              )}
              {m.body_fat_percentage && (
                <div className="text-sm">
                  <span className="font-medium">Body Fat:</span> {m.body_fat_percentage}%
                </div>
              )}
              {m.resting_heart_rate && (
                <div className="text-sm">
                  <span className="font-medium">RHR:</span> {m.resting_heart_rate} bpm
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upper Body Measurements */}
        {(m.chest_cm || m.waist_cm || m.biceps_left_cm || m.biceps_right_cm || m.forearm_left_cm || m.forearm_right_cm) && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              UPPER BODY
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {m.chest_cm && (
                <div className="text-sm">
                  <span className="font-medium">Chest:</span> {m.chest_cm} cm
                </div>
              )}
              {m.waist_cm && (
                <div className="text-sm">
                  <span className="font-medium">Waist:</span> {m.waist_cm} cm
                </div>
              )}
              {m.biceps_left_cm && (
                <div className="text-sm">
                  <span className="font-medium">Biceps L:</span> {m.biceps_left_cm} cm
                </div>
              )}
              {m.biceps_right_cm && (
                <div className="text-sm">
                  <span className="font-medium">Biceps R:</span> {m.biceps_right_cm} cm
                </div>
              )}
              {m.forearm_left_cm && (
                <div className="text-sm">
                  <span className="font-medium">Forearm L:</span> {m.forearm_left_cm} cm
                </div>
              )}
              {m.forearm_right_cm && (
                <div className="text-sm">
                  <span className="font-medium">Forearm R:</span> {m.forearm_right_cm} cm
                </div>
              )}
            </div>
          </div>
        )}

      {/* Lower Body Measurements */}
        {(m.hips_cm || m.thigh_left_cm || m.thigh_right_cm || m.calf_left_cm || m.calf_right_cm) && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" />
              LOWER BODY
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {m.hips_cm && (
                <div className="text-sm">
                  <span className="font-medium">Hips:</span> {m.hips_cm} cm
                </div>
              )}
              {m.thigh_left_cm && (
                <div className="text-sm">
                  <span className="font-medium">Thigh L:</span> {m.thigh_left_cm} cm
                </div>
              )}
              {m.thigh_right_cm && (
                <div className="text-sm">
                  <span className="font-medium">Thigh R:</span> {m.thigh_right_cm} cm
                </div>
              )}
              {m.calf_left_cm && (
                <div className="text-sm">
                  <span className="font-medium">Calf L:</span> {m.calf_left_cm} cm
                </div>
              )}
              {m.calf_right_cm && (
                <div className="text-sm">
                  <span className="font-medium">Calf R:</span> {m.calf_right_cm} cm
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Photos */}
        {(m.body_fat_photo_url || m.biceps_left_photo_url || m.biceps_right_photo_url || 
          m.waist_photo_url || m.chest_photo_url || m.thigh_left_photo_url || 
          m.thigh_right_photo_url || m.calf_left_photo_url || m.calf_right_photo_url || 
          m.hips_photo_url || m.forearm_left_photo_url || m.forearm_right_photo_url) && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-1">
              <Camera className="h-3 w-3" />
              PROGRESS PHOTOS
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {m.body_fat_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.body_fat_photo_url)} 
                    alt="Body Fat" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Body Fat</p>
                </div>
              )}
              {m.chest_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.chest_photo_url)} 
                    alt="Chest" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Chest</p>
                </div>
              )}
              {m.waist_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.waist_photo_url)} 
                    alt="Waist" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Waist</p>
                </div>
              )}
              {m.biceps_left_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.biceps_left_photo_url)} 
                    alt="Biceps Left" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Biceps L</p>
                </div>
              )}
              {m.biceps_right_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.biceps_right_photo_url)} 
                    alt="Biceps Right" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Biceps R</p>
                </div>
              )}
              {m.forearm_left_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.forearm_left_photo_url)} 
                    alt="Forearm Left" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Forearm L</p>
                </div>
              )}
              {m.forearm_right_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.forearm_right_photo_url)} 
                    alt="Forearm Right" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Forearm R</p>
                </div>
              )}
              {m.hips_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.hips_photo_url)} 
                    alt="Hips" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Hips</p>
                </div>
              )}
              {m.thigh_left_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.thigh_left_photo_url)} 
                    alt="Thigh Left" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Thigh L</p>
                </div>
              )}
              {m.thigh_right_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.thigh_right_photo_url)} 
                    alt="Thigh Right" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Thigh R</p>
                </div>
              )}
              {m.calf_left_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.calf_left_photo_url)} 
                    alt="Calf Left" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Calf L</p>
                </div>
              )}
              {m.calf_right_photo_url && (
                <div className="space-y-1">
                  <img 
                    src={getMeasurementImageUrl(m.calf_right_photo_url)} 
                    alt="Calf Right" 
                    className="w-full h-24 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer" 
                  />
                  <p className="text-xs text-center text-muted-foreground">Calf R</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {m.overall_notes && (
          <div className="border-l-4 border-primary/20 pl-4 py-2 bg-muted/30 rounded-r-md">
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">NOTES</h4>
            <p className="text-sm italic">{m.overall_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};