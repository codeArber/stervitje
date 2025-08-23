// FILE: src/components/new/measurements/measurementHistory.tsx

import React from 'react';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { FilePenLine, Trash2, History } from 'lucide-react';
import type { Tables } from '@/types/database.types';
// UPDATED: Import the new history diagram
import { MeasurementHistoryDiagram } from './MeasurementHistoryDiagram';

interface MeasurementHistoryProps {
  measurements: Tables<'user_measurements'>[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function MeasurementHistory({ measurements, isLoading, isError, error }: MeasurementHistoryProps) {
  if (isLoading) return <div>Loading measurement history...</div>;
  if (isError) return <div className="text-destructive">Error loading history: {error?.message}</div>;
  if (!measurements || measurements.length === 0) {
    return (
      <section className="space-y-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <History className="h-6 w-6" /> Measurement History
        </h2>
        <p className="text-muted-foreground">No past measurements found.</p>
      </section>
    );
  }

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
  );

  return (
    <section className="space-y-6">
      <div className="space-y-6">
        <div>
          {sortedMeasurements.map((measurement) => (
            <div className='flex flex-col gap-1 py-1'>
                <div>{dayjs(measurement.created_at).format('YYYY-MM-DD')}</div>
              <MeasurementHistoryDiagram measurement={measurement} key={measurement.id} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}