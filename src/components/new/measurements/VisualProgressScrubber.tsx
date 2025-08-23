// FILE: src/components/new/measurements/VisualProgressScrubber.tsx

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Tables } from '@/types/database.types';

// --- CONFIGURATION ---
// This object maps a user-friendly dropdown option to the specific data and photo columns in your database.
// 'trend' is used to determine if an increase is "good" (green) or "bad" (red).

const viewConfigurations = {
  // --- Main Poses ---
  // Note: These assume you have general pose image URLs. If not, you can remove them or point them to
  // a specific body part photo, e.g., 'chest_photo_url' for the front pose.
  frontPose: {
    label: 'Front Pose',
    photoKey: 'front_image_url', // You'll need to add this column to your table if it doesn't exist
    metrics: [
      { dbKey: 'weight_kg', label: 'Weight', unit: 'kg', trend: 'decrease' },
      { dbKey: 'waist_cm', label: 'Waist', unit: 'cm', trend: 'decrease' }
    ],
  },
  sidePose: {
    label: 'Side Pose',
    photoKey: 'side_image_url', // You'll need to add this column to your table if it doesn't exist
    metrics: [{ dbKey: 'weight_kg', label: 'Weight', unit: 'kg', trend: 'decrease' }],
  },
  backPose: {
    label: 'Back Pose',
    photoKey: 'back_image_url', // You'll need to add this column to your table if it doesn't exist
    metrics: [{ dbKey: 'hips_cm', label: 'Hips', unit: 'cm', trend: 'decrease' }],
  },
  
  // --- Specific Body Parts (from your schema) ---
  chest: {
    label: 'Chest',
    photoKey: 'chest_photo_url',
    metrics: [{ dbKey: 'chest_cm', label: 'Chest', unit: 'cm', trend: 'increase' }],
  },
  biceps: {
    label: 'Biceps',
    photoKey: 'biceps_left_photo_url', // We'll use the left bicep photo for this combined view
    metrics: [
      { dbKey: 'biceps_l_cm', label: 'Biceps L', unit: 'cm', trend: 'increase' },
      { dbKey: 'biceps_r_cm', label: 'Biceps R', unit: 'cm', trend: 'increase' }
    ],
  },
  forearms: {
    label: 'Forearms',
    photoKey: 'forearm_left_photo_url',
    metrics: [
      { dbKey: 'forearm_l_cm', label: 'Forearm L', unit: 'cm', trend: 'increase' },
      { dbKey: 'forearm_r_cm', label: 'Forearm R', unit: 'cm', trend: 'increase' }
    ],
  },
  waist: {
    label: 'Waist',
    photoKey: 'waist_photo_url',
    metrics: [{ dbKey: 'waist_cm', label: 'Waist', unit: 'cm', trend: 'decrease' }],
  },
  hips: {
    label: 'Hips',
    photoKey: 'hips_photo_url',
    metrics: [{ dbKey: 'hips_cm', label: 'Hips', unit: 'cm', trend: 'decrease' }],
  },
  thighs: {
    label: 'Thighs',
    photoKey: 'thigh_left_photo_url',
    metrics: [
      { dbKey: 'thigh_l_cm', label: 'Thigh L', unit: 'cm', trend: 'increase' },
      { dbKey: 'thigh_r_cm', label: 'Thigh R', unit: 'cm', trend: 'increase' }
    ],
  },
  calves: {
    label: 'Calves',
    photoKey: 'calf_left_photo_url',
    metrics: [
      { dbKey: 'calf_l_cm', label: 'Calf L', unit: 'cm', trend: 'increase' },
      { dbKey: 'calf_r_cm', label: 'Calf R', unit: 'cm', trend: 'increase' }
    ],
  },
  bodyFat: {
    label: 'Body Fat',
    photoKey: 'body_fat_photo_url',
    metrics: [{ dbKey: 'body_fat_percentage', label: 'Body Fat %', unit: '%', trend: 'decrease' }],
  },
};

// --- THE COMPONENT ---

interface VisualProgressScrubberProps {
  measurements: Tables<'user_measurements'>[];
}

export function VisualProgressScrubber({ measurements }: VisualProgressScrubberProps) {
  const sortedMeasurements = useMemo(() => {
    if (!measurements) return [];
    return [...measurements].sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime());
  }, [measurements]);

  const [currentViewKey, setCurrentViewKey] = useState('frontPose');
  const [currentTimeIndex, setCurrentTimeIndex] = useState(sortedMeasurements.length - 1);

  const { currentView, currentEntry, initialEntry, photoSrc } = useMemo(() => {
    if (sortedMeasurements.length === 0) return {};
    
    const view = viewConfigurations[currentViewKey];
    const entry = sortedMeasurements[currentTimeIndex];
    const initial = sortedMeasurements[0];
    const src = entry?.[view.photoKey] || 'https://via.placeholder.com/800x600/cccccc/FFFFFF?text=No+Image';

    return { currentView: view, currentEntry: entry, initialEntry: initial, photoSrc: src };
  }, [currentViewKey, currentTimeIndex, sortedMeasurements]);

  if (sortedMeasurements.length < 2) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-6 w-6 text-primary" />Visual Progress</CardTitle></CardHeader>
        <CardContent><div className="text-center text-muted-foreground py-10"><p>You need at least two measurements to see your progress.</p></div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><Camera className="h-6 w-6 text-primary" />Visual Progress</CardTitle>
            <CardDescription>Select a view and slide the timeline to see your transformation.</CardDescription>
          </div>
          <select
            value={currentViewKey}
            onChange={(e) => setCurrentViewKey(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm font-medium"
          >
            {Object.entries(viewConfigurations).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden transition-all duration-300">
            <img key={photoSrc as string} src={photoSrc as string} alt={`Progress for ${currentView.label} on ${currentEntry.measurement_date}`} className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
          {currentView.metrics.map(({ dbKey, label, unit, trend }) => {
            const currentValue = currentEntry?.[dbKey];
            const initialValue = initialEntry?.[dbKey];
            
            if (currentValue == null || initialValue == null) return <div key={dbKey} className="bg-muted p-3 rounded-lg"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">-</p></div>;

            const delta = currentValue - initialValue;
            const isGood = (trend === 'increase' && delta >= 0) || (trend === 'decrease' && delta <= 0);

            return (
              <div key={dbKey} className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold tracking-tighter">
                  {currentValue} <span className="text-base font-normal text-muted-foreground">{unit}</span>
                </p>
                <p className={cn("text-sm font-semibold", isGood ? "text-green-500" : "text-red-500")}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)} {unit}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={sortedMeasurements.length - 1}
            value={currentTimeIndex}
            onChange={(e) => setCurrentTimeIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {sortedMeasurements.map((entry, index) => (
              <span key={index}>
                {new Date(entry.measurement_date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}