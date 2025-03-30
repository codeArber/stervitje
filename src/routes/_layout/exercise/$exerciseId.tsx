import { createFileRoute, Link, notFound, ErrorComponent } from '@tanstack/react-router';
import { useFetchExerciseById } from '@/api/exercises'; // Adjust path
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExerciseDisplay } from '@/components/ExerciseDisplay';

export const Route = createFileRoute('/_layout/exercise/$exerciseId')({
  component: ExercisePage,
  // Optional: Add loader for SSR/metadata or error handling before component mounts
  // loader: async ({ params }) => { ... },
  errorComponent: ExerciseErrorComponent, // Use a custom error component
  notFoundComponent: ExerciseNotFound, // Use a custom not found component
});

// Custom Not Found Component
function ExerciseNotFound() {
  return (
     <div className="container py-6 text-center">
       <Alert variant="destructive" className="max-w-md mx-auto">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Not Found</AlertTitle>
         <AlertDescription>
           The exercise you are looking for could not be found.
         </AlertDescription>
       </Alert>
       <Link to="/exercise" className="mt-4 inline-block">
         <Button variant="outline" size="sm">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
         </Button>
       </Link>
     </div>
  );
}

// Custom Error Component for this route
function ExerciseErrorComponent({ error }: { error: Error }) {
   console.error("Exercise Page Error:", error);
   return (
       <div className="container py-6">
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Exercise</AlertTitle>
              <AlertDescription>
                  {error?.message || "An unexpected error occurred."}
              </AlertDescription>
          </Alert>
          <Link to="/exercise" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
            </Button>
          </Link>
       </div>
   );
}


// Main Page Component
function ExercisePage() {
  const { exerciseId } = Route.useParams();

  // Fetch the exercise data using the hook
  const { data: exercise, isLoading, error, isError } = useFetchExerciseById(exerciseId);

  // Note: TanStack Router's errorComponent/notFoundComponent handles primary error/not found states.
  // This isLoading check handles the initial loading phase.
  if (isLoading) {
    return (
       <div className="container py-6">
          {/* Back button can still be shown while loading */}
          <div className="mb-6">
             <Link to="/exercise">
                <Button variant="ghost" size="sm" className="gap-1">
                   <ArrowLeft className="h-4 w-4" />
                   Back to Exercises
                </Button>
             </Link>
          </div>
          {/* <ExerciseDetailSkeleton /> Show loading skeleton */}
       </div>
    );
  }

  // If loading is finished, and there's no error, but data is null/undefined,
  // the notFoundComponent defined in the route config should be rendered by TanStack Router.
  // Similarly, if isError is true, the errorComponent should be rendered.
  // We only need to render the success state here.

  // Render the exercise details if data is successfully loaded
  return (
    <div className="container py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/exercise"> {/* Adjust link if your list page is elsewhere */}
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Exercises
          </Button>
        </Link>
      </div>

      {/* Render the display component only if exercise data exists */}
      {/* This check might be redundant if notFoundComponent works correctly, but adds safety */}
      {exercise ? (
         <ExerciseDisplay exercise={exercise} />
      ) : (
         // Fallback if data is null after loading without an error state being triggered
         // This case *should* be caught by notFoundComponent if useFetchExerciseById returns null on 404
         <ExerciseNotFound />
      )}


      <Separator className="my-8" />

      {/* Placeholder for related exercises - implement fetching/display logic here */}
      {/* {exercise && <RelatedExercises currentExerciseId={exercise.id} />} */}
       <div>
          <h3 className="text-xl font-semibold mb-4">Related Exercises (Placeholder)</h3>
          {/* Add RelatedExercises component call here */}
       </div>
    </div>
  );
}

// Export the component as default if needed by your file structure / framework conventions
export default ExercisePage;