import { createFileRoute, Link, notFound, ErrorComponent } from '@tanstack/react-router';
import { useExerciseImageUrl, useFetchExerciseById } from '@/api/exercises'; // Adjust path
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExerciseDisplay } from '@/components/ExerciseDisplay';
import Model, { IExerciseData } from 'react-body-highlighter';
import { ExerciseCategoryDropdown, ExerciseTypeDropdown } from '@/components/ExerciseCategorySelector';
import { useState } from 'react';
import { ExerciseCategory, exerciseTypes } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateExercise } from '@/api/exercises/endpoint';

export const Route = createFileRoute('/_layout/exercise/$exerciseId')({
  component: ExercisePage,
  // Optional: Add loader for SSR/metadata or error handling before component mounts
  // loader: async ({ params }) => { ... },
  errorComponent: ExerciseErrorComponent, // Use a custom error component
  notFoundComponent: ExerciseNotFound, // Use a custom not found component
});

const exercises: IExerciseData[] = [
  { name: 'Bench Press', muscles: ['chest', 'triceps', 'front-deltoids'] },
  { name: 'Push Ups', muscles: ['chest', 'triceps', 'front-deltoids'] },
  { name: 'Pull Ups', muscles: ['upper-back', 'biceps', 'back-deltoids'] },
  { name: 'Deadlift', muscles: ['hamstring', 'gluteal', 'lower-back', 'forearm'] },
  { name: 'Squats', muscles: ['quadriceps', 'gluteal', 'hamstring'] },
  { name: 'Overhead Press', muscles: ['front-deltoids', 'triceps', 'trapezius'] },
  { name: 'Barbell Row', muscles: ['upper-back', 'back-deltoids', 'biceps'] },
  { name: 'Bicep Curls', muscles: ['biceps', 'forearm'] },
  { name: 'Tricep Dips', muscles: ['triceps', 'chest'] },
  { name: 'Lunges', muscles: ['quadriceps', 'gluteal', 'hamstring', 'calves'] },
  { name: 'Plank', muscles: ['abs', 'obliques'] },
  { name: 'Russian Twists', muscles: ['obliques', 'abs'] },
]

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

  console.log(exercise)
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
    <div className="flex flex-col w-full px-4 py-8">
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
        <div className='flex flex-row w-full gap-4'>
          <ExerciseDisplay exercise={exercise} />
          <div className='border border-border flex flex-col items-start rounded shadow px-4 py-6 z-10 w-full justify-between h-18'>
            <div className=" ">
              <h3 className="text-xl font-semibold mb-4">Exercise Details</h3>
              <p>{exercise.description}</p>
              {/* Add more details as needed */}
              <div className="mt-4">
                <h4 className="text-lg font-medium">Muscle Group</h4>
                {exercise?.exercise_muscle?.map((muscle, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {muscle.muscle_group}
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium">Equipment</h4>
                <p>{"N/A"}</p>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium">Exercise Type</h4>

                <ExerciseTypeDropdown exerciseId={exercise.id} category={exercise.category} type={exercise.exercise_type} />

              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium">Category</h4>
                <ExerciseCategoryDropdown exerciseId={exercise.id} category={exercise.category} />
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium">Benefits</h4>
                <ul className="list-disc pl-5">
                  <li>Improves strength</li>
                  <li>Enhances flexibility</li>
                  <li>Boosts endurance</li>
                  {/* Add more benefits as needed */}
                </ul>
              </div>
            </div>
            <div className="flex flex-row w-full gap-4 justify-center">
              <Model
                data={exercises.find(ex => ex.name === exercise.name) ? [exercises.find(ex => ex.name === exercise.name)] : exercises} // Fallback to all exercises if not found
                style={{ width: '10rem', padding: '1rem' }}
              // onClick={handleClick}
              />
              <Model
                data={exercises.find(ex => ex.name === exercise.name) ? [exercises.find(ex => ex.name === exercise.name)] : exercises} // Fallback to all exercises if not found
                style={{ width: '10rem', padding: '1rem' }}
                type="posterior"

              // onClick={handleClick}
              />


            </div>
          </div>
        </div>
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