// FILE: src/routes/_layout/profile/measurements/add/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// shadcn/ui components
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Assuming Button is available
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // For skeleton

// Icons
import { Ruler as RulerIcon, ArrowLeft, PlusCircle } from 'lucide-react';
import { MeasurementForm } from '@/components/new/measurements/MeasurementForm';
import { MeasurementsPageSkeleton } from '@/components/new/measurements/measurementsSkeleton';

// Import the MeasurementForm component


export const Route = createFileRoute('/_layout/profile/measurements/add/')({
  component: AddMeasurementsPage,
});

function AddMeasurementsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-destructive text-center">
        Please log in to add measurements.
      </div>
    );
  }

  // You might want a specific skeleton for the form page if loading external data
  // For now, reuse MeasurementsPageSkeleton if it covers basic page layout
  // Or create a simpler form-specific skeleton
  if (!user) { // Only show skeleton if user is loading, or if other data for form is loading
    return <MeasurementsPageSkeleton />; // Re-using for simplicity
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <RulerIcon className="h-9 w-9" /> Add Measurement
          </h1>
          <Button asChild variant="outline">
            <Link to="/profile/measurements">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
            </Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">Record your latest body measurements.</p>
      </header>

      <Separator />

      {/* The actual Measurement Form */}
      <MeasurementForm />
    </div>
  );
}