// FILE: src/components/measurements/measurement-history.tsx

import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUserMeasurementsQuery } from '@/api/user'; // Only need query hook here
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, TrendingUp } from 'lucide-react'; // Icons


import type { Tables } from '@/types/database.types'; // For UserMeasurement type
import { MeasurementEntryCard } from './MeasurementEntryCard';
import { MeasurementsHistorySkeleton } from './measurementsSkeleton';

export const MeasurementHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { data: measurements, isLoading, isError, error } = useUserMeasurementsQuery(user?.id);

  if (!user) {
    return (
      <div className="text-destructive text-center py-8">
        Please log in to view your measurement history.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Measurement History
        </h2>
        {measurements && measurements.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {measurements.length} {measurements.length === 1 ? 'Entry' : 'Entries'}
          </Badge>
        )}
      </div>
      
      {isLoading ? (
        <MeasurementsHistorySkeleton />
      ) : isError ? (
        <Card className="p-8 text-center">
          <div className="text-destructive">Error loading history: {error?.message}</div>
        </Card>
      ) : !measurements || measurements.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-2">
            <Ruler className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No measurements recorded yet</h3>
            <p className="text-muted-foreground">Add your first measurement above to start tracking your progress!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {measurements.map(m => (
            <MeasurementEntryCard key={m.id} measurement={m} />
          ))}
        </div>
      )}
    </section>
  );
};