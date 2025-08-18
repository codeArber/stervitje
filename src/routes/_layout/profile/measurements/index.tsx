// FILE: src/routes/_layout/profile/measurements/index.tsx

import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router'; // Import Link
import { useAuthStore } from '@/stores/auth-store';
import { useUserMeasurementsQuery } from '@/api/user';
import { toast } from 'sonner';

// shadcn/ui components
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button for the new button

// Icons
import { Ruler as RulerIcon, TrendingUp, PlusCircle } from 'lucide-react'; // Import PlusCircle
import { MeasurementsPageSkeleton } from '@/components/new/measurements/measurementsSkeleton';
import { Badge } from '@/components/ui/badge';
import { MeasurementProgressGraph } from '@/components/new/measurements/MeasurementProgressGraph';
import { MeasurementHistory } from '@/components/new/measurements/measurementHistory';

// Import the sub-components
// MeasurementForm is NOT imported here anymore


export const Route = createFileRoute('/_layout/profile/measurements/')({
  component: MeasurementsDisplayPage, // Renamed to clarify its purpose
});

function MeasurementsDisplayPage() { // Renamed function
  const { user } = useAuthStore();
  const { data: measurements, isLoading, isError, error } = useUserMeasurementsQuery(user?.id);

  // State for selected filters, initialized to only 'weight_kg'
  const [selectedMetricKeys, setSelectedMetricKeys] = React.useState<string[]>(['weight_kg']);

  // Define all possible metric keys (should match keys in ALL_DATASETS_CONFIG in graph component)
  const ALL_METRIC_KEYS = [
    'weight_kg', 'height_cm', 'body_fat_percentage', 'resting_heart_rate',
    'biceps_left_cm', 'biceps_right_cm', 'waist_cm', 'chest_cm',
    'thigh_left_cm', 'thigh_right_cm', 'calf_left_cm', 'calf_right_cm',
    'hips_cm', 'forearm_left_cm', 'forearm_right_cm'
  ];

  // Helper to create a more readable label from a metric key for the filter UI
  const getFilterLabel = (key: string): string => {
    switch (key) {
      case 'weight_kg': return 'Weight';
      case 'height_cm': return 'Height';
      case 'body_fat_percentage': return 'Body Fat %';
      case 'resting_heart_rate': return 'Resting HR';
      case 'biceps_left_cm': return 'Biceps L';
      case 'biceps_right_cm': return 'Biceps R';
      case 'waist_cm': return 'Waist';
      case 'chest_cm': return 'Chest';
      case 'thigh_left_cm': return 'Thigh L';
      case 'thigh_right_cm': return 'Thigh R';
      case 'calf_left_cm': return 'Calf L';
      case 'calf_right_cm': return 'Calf R';
      case 'hips_cm': return 'Hips';
      case 'forearm_left_cm': return 'Forearm L';
      case 'forearm_right_cm': return 'Forearm R';
      default: return key;
    }
  };

  const toggleMetric = (key: string) => {
    setSelectedMetricKeys(prev => 
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
    );
  };

  const selectAllMetrics = () => {
    setSelectedMetricKeys(ALL_METRIC_KEYS);
  };

  const clearAllMetrics = () => {
    setSelectedMetricKeys([]);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-destructive text-center">
        Please log in to view your measurements.
      </div>
    );
  }

  // Overall page skeleton based on initial data load
  if (isLoading && (!measurements || measurements.length === 0)) {
    return <MeasurementsPageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <RulerIcon className="h-9 w-9" /> Body Measurements
          </h1>
          {/* New Button to Add Measurement */}
          <Button asChild>
            <Link to="/profile/measurements/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Measurement
            </Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">Track your physical changes over time with detailed measurements and progress photos.</p>
      </header>

      <Separator />

      {/* Measurement Progress Graph */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Measurement Trends
        </h2>
        <Card>
            <CardHeader>
                <CardTitle>Your Progress Chart</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                    {/* Filter buttons */}
                    {ALL_METRIC_KEYS.map(key => (
                        <Badge 
                            key={key} 
                            variant={selectedMetricKeys.includes(key) ? 'default' : 'outline'} 
                            className="cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => toggleMetric(key)}
                        >
                            {getFilterLabel(key)}
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={selectAllMetrics} className="text-xs h-auto py-1">Select All</Button>
                    <Button variant="ghost" size="sm" onClick={clearAllMetrics} className="text-xs h-auto py-1">Clear</Button>
                </div>
            </CardHeader>
            <CardContent>
                <MeasurementProgressGraph measurements={measurements || []} selectedMetricKeys={selectedMetricKeys} />
            </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Measurement History Display */}
      <MeasurementHistory measurements={measurements || []} isLoading={isLoading} isError={isError} error={error} />
    </div>
  );
}