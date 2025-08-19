// FILE: src/routes/_layout/workout.tsx

import React, { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';


// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Flag, ArrowLeft, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useWorkoutStore } from '@/stores/workout-store';
import { ActiveWorkoutUI } from '@/components/new/workout/ActiveWorkoutUI';
import { AdHocWorkoutUI } from '@/components/new/workout/AdHocWorkoutUI';
import { WorkoutSummary } from '@/components/new/workout/WorkoutSummary';

// --- Child Components (You will create these next) ---
// import { AdHocWorkoutUI } from '@/components/workout/AdHocWorkoutUI'; // We will create this

// --- Main Route Definition ---
export const Route = createFileRoute('/_layout/workout/')({
  component: WorkoutPlayerPage,
});

// --- The Main Page "Controller" Component ---
function WorkoutPlayerPage() {
  const { isLoading, activeSessionLog, plannedSession, isCompleted } = useWorkoutStore();

  if (isLoading) {
    return <WorkoutLoadingSkeleton />;
  }
  if (!activeSessionLog) {
    return <NoActiveWorkoutScreen />;
  }
  if (isCompleted) {
    return <WorkoutSummary />
  }

  // --- THE CORE LOGIC SWITCH ---
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <header className="mb-4">
        {/* The back button conditionally links to the plan if it exists */}
        {activeSessionLog.plan_id && (
          <Link to="/plans/$planId" params={{ planId: activeSessionLog.plan_id }}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan Details
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold">{plannedSession?.title || 'Ad-Hoc Workout'}</h1>
        <p className="text-muted-foreground">{plannedSession?.notes || 'Log your exercises as you go.'}</p>
      </header>
      <Separator className="my-6" />
      
      {plannedSession ? (
        // If a plan exists, render the structured workout UI
        <ActiveWorkoutUI />
      ) : (
        // Otherwise, render the ad-hoc workout UI
        <AdHocWorkoutUI />
      )}
    </div>
  );
}

// --- Placeholder for the Ad-Hoc UI ---
// We will replace this with a real component in the next step.
const AdHocWorkoutUIPlaceholder = () => (
    <div className="space-y-6 text-center">
        <Card>
            <CardHeader>
                <CardTitle>Log Your Workout</CardTitle>
                <CardDescription>
                    This is an ad-hoc session. Add the exercises you perform below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Your logged exercises will appear here.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Exercise
                </Button>
            </CardContent>
        </Card>
        <Button size="lg" className="w-full">Finish Workout</Button>
    </div>
);


// --- Helper Components (Unchanged) ---
const WorkoutLoadingSkeleton = () => (
  <div className="container mx-auto max-w-2xl py-8 animate-pulse">
    <Skeleton className="h-6 w-1/3 mb-2" />
    <Skeleton className="h-9 w-2/3 mb-1" />
    <Skeleton className="h-5 w-full mb-6" />
    <Separator className="my-6" />
    <Card>
      <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  </div>
);

const NoActiveWorkoutScreen = () => (
    <div className="container py-16 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold mt-4 mb-2">No Active Workout</h1>
      <p className="text-muted-foreground">Start a session from a plan or begin a new ad-hoc workout from the dashboard.</p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
);

const WorkoutCompleteScreen = ({ planId }: { planId: string | null }) => (
  <div className="container mx-auto max-w-2xl py-16 text-center flex flex-col items-center">
    <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
    <h1 className="text-4xl font-bold">Workout Complete!</h1>
    <p className="text-muted-foreground mt-2">Great work. You've finished your session.</p>
    <div className="flex gap-4 mt-8">
      {planId && (
        <Button asChild variant="outline">
          <Link to="/plans/$planId" params={{ planId }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plan
          </Link>
        </Button>
      )}
      <Button asChild>
        <Link to="/dashboard">
          <Flag className="mr-2 h-4 w-4" /> Go to Dashboard
        </Link>
      </Button>
    </div>
  </div>
);