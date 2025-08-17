// FILE: /src/routes/_layout/plans/$planId/workout/$sessionId.tsx

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';

// Components & Icons
import { ArrowLeft, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_layout/plans/$planId/workout/$sessionId')({
  component: WorkoutPlayer,
});

// This component is now the single, simple source of truth for the workout page.
function WorkoutPlayer() {
  const navigate = useNavigate();
  const { planId } = Route.useParams();

  // THE FIX IS HERE: We select the correct state and actions from our final store.
  const playerActiveSession = useWorkoutStore((state) => state.playerActiveSession);
  const isPlayerCompleted = useWorkoutStore((state) => state.isPlayerCompleted);
  const resetPlayer = useWorkoutStore((state) => state.resetPlayer);

  // This cleanup effect correctly resets the PLAYER state when the user navigates away.
  useEffect(() => {
    return () => {
      resetPlayer();
    };
  }, [resetPlayer]);

  // If the user lands on this page without the store being initialized,
  // it means they didn't come from the "Start" button. This is our safety net.
  if (!playerActiveSession) {
    return <ErrorScreen message="Please start a workout from a plan page first." />;
  }

  // If the player is marked as completed in the store, show the summary.
  if (isPlayerCompleted) {
    return <WorkoutCompleteScreen planId={planId} />;
  }

  // --- Main Interactive UI ---
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/plans/$planId', params: { planId } })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plan Details
        </Button>
        <h1 className="text-3xl font-bold mt-2">{playerActiveSession.title || 'Workout Session'}</h1>
      </header>
      
      <div className="space-y-6">
          <p className="font-bold text-lg">Current Exercise UI will go here.</p>
          <p className="font-bold text-lg">Rest Timer UI will go here.</p>
          <p className="font-bold text-lg">Control buttons will go here.</p>
      </div>
    </div>
  );
}


// --- Reusable Helper & Skeleton Components (Unchanged) ---
const ErrorScreen = ({ message }: { message: string }) => (
    <div className="container py-8 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold mt-4 mb-2">Something Went Wrong</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-6"><Link to="/dashboard">Go to Dashboard</Link></Button>
    </div>
);

const WorkoutCompleteScreen = ({ planId }: { planId: string }) => (
  <div className="container mx-auto max-w-2xl py-8 text-center flex flex-col items-center">
    <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
    <h1 className="text-4xl font-bold">Workout Complete!</h1>
    <p className="text-muted-foreground mt-2">Great work. You've finished your session for the day.</p>
    <div className="flex gap-4 mt-6">
      <Button asChild variant="outline">
        <Link to="/plans/$planId" params={{ planId }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plan
        </Link>
      </Button>
      <Button asChild>
        <Link to="/dashboard">
          <Flag className="mr-2 h-4 w-4" /> Go to Dashboard
        </Link>
      </Button>
    </div>
  </div>
);

// We still need a skeleton for the brief moment before the store is initialized.
const WorkoutPlayerSkeleton = () => (
    <div className="container mx-auto max-w-2xl py-8 animate-pulse">
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-8 w-3/4 mb-8" />
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
);