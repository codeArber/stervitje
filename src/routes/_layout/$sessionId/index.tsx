import { createFileRoute, Link } from '@tanstack/react-router';
import { usePlanSession } from '@/api/plans/plan_session'; // Adjust path if needed
// Import UI components
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLogWorkout } from '@/api/workouts';
import { WorkoutLogger } from '@/components/session/WorkoutLogger';
// Import your new display components

export const Route = createFileRoute('/_layout/$sessionId/')({
  component: RouteComponent,
  // Add pending/error components for better UX
  pendingComponent: SessionLoadingSkeleton,
  errorComponent: SessionErrorComponent,
});

// --- Optional Loading Skeleton ---
function SessionLoadingSkeleton() {
  return (
    <div className="container py-6 space-y-6 animate-pulse">
      <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title Placeholder */}
      <div className="space-y-4">
        {/* Skeleton for Exercise Cards */}
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start gap-4 p-4">
              <Skeleton className="w-20 h-20 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="py-2 px-4 border-t">
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="py-2 px-4 border-t">
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Optional Error Component ---
function SessionErrorComponent({ error }: { error: Error }) {
  console.error("Session Page Error:", error);
  return (
    <div className="container py-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Session</AlertTitle>
        <AlertDescription>
          {error?.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>
      {/* Provide a relevant back link */}
      <Link to="/plans" className="mt-4 inline-block">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
        </Button>
      </Link>
    </div>
  );
}

// --- Main Route Component ---
function RouteComponent() {
  const { sessionId } = Route.useParams();
  // isLoading and isError are handled by pending/errorComponent if defined above
  // const { data: sessionData } = usePlanSession(sessionId);

  // The component only renders if loading succeeded and no error occurred.
  // // Handle the case where data is null/undefined after loading (Not Found)
  // if (!sessionData) {
  //   return (
  //     <div className="container py-6 text-center">
  //       <p>Session not found.</p>
  //       {/* Provide a relevant back link */}
  //       <Link to="/plans" className="mt-4 inline-block">
  //         <Button variant="outline" size="sm">
  //           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
  //         </Button>
  //       </Link>
  //     </div>
  //   );
  // }


  return (
  <div>
      <WorkoutLogger />
    </div>
  );
}