// FILE: src/routes/_layout/profile/measurements/index.tsx

import React, { useMemo } from 'react'; // Import useMemo
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { useUserMeasurementsQuery } from '@/api/user';

// shadcn/ui components
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { Ruler as RulerIcon, TrendingUp, PlusCircle, User } from 'lucide-react'; // Added User icon
import { MeasurementsPageSkeleton } from '@/components/new/measurements/measurementsSkeleton';
import { MeasurementProgressGraph } from '@/components/new/measurements/MeasurementProgressGraph';
import { MeasurementHistory } from '@/components/new/measurements/MeasurementHistory';
import { Breadcrumb } from '@/components/new/TopNavigation';

// ==================================================================
// NEW: Import the status diagram component
// ==================================================================
import { MeasurementStatusDiagram } from '@/components/new/measurements/MeasurementStatusDiagram';
import { MeasurementGraphSelectorDiagram } from '@/components/new/measurements/MeasurementGraphSelectorDiagram';


export const Route = createFileRoute('/_layout/profile/measurements/')({
  component: MeasurementsDisplayPage,
});

function MeasurementsDisplayPage() {
  const { user } = useAuthStore();
  const { data: measurements, isLoading } = useUserMeasurementsQuery(user?.id);
  const [selectedMetricKeys, setSelectedMetricKeys] = React.useState<string[]>(['weight_kg']);

  // ==================================================================
  // NEW: Find the most recent measurement from the data array
  // ==================================================================
  const latestMeasurement = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return null;
    }
    // Sort by date descending and return the first element
    return [...measurements].sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())[0];
  }, [measurements]);

  // (The rest of your filter logic remains unchanged)
  const ALL_METRIC_KEYS = [ 'weight_kg', 'height_cm', 'body_fat_percentage', 'resting_heart_rate', 'biceps_left_cm', 'biceps_right_cm', 'waist_cm', 'chest_cm', 'thigh_left_cm', 'thigh_right_cm', 'calf_left_cm', 'calf_right_cm', 'hips_cm', 'forearm_left_cm', 'forearm_right_cm' ];
  const getFilterLabel = (key: string): string => { /* ... no changes here ... */ };
  const toggleMetric = (key: string) => { /* ... no changes here ... */ };
  const selectAllMetrics = () => setSelectedMetricKeys(ALL_METRIC_KEYS);
  const clearAllMetrics = () => setSelectedMetricKeys([]);

  if (!user) { /* ... no changes here ... */ }
  if (isLoading && (!measurements || measurements.length === 0)) {
    return <MeasurementsPageSkeleton />;
  }

  return (
    <div className="pb-6 flex flex-col gap-4">
      <Breadcrumb currentPath={location.pathname}  rightContent={<><Link to='/profile/measurements/details'>Details</Link></>}/>

      <section className="space-y-4">
        <Card>
          <CardContent className="p-4 flex justify-center items-center">
            {latestMeasurement ? (
              <MeasurementStatusDiagram latestMeasurement={latestMeasurement} measurements={measurements || []} />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No measurement data found.</p>
                <p className="text-sm">Add your first measurement to see your status here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      {/* Measurement Progress Graph Section (Unchanged) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Measurement Trends
        </h2>
        {/* Grid container for the two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (takes 2/3 of the space on large screens) */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <MeasurementProgressGraph measurements={measurements || []} selectedMetricKeys={selectedMetricKeys} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column (takes 1/3 of the space on large screens) */}
          <div className="lg:col-span-1">
            <MeasurementGraphSelectorDiagram 
              selectedMetricKeys={selectedMetricKeys}
              onSelectionChange={setSelectedMetricKeys} // Pass the state setter function
            />
          </div>

        </div>
      </section>
    </div>
  );
}