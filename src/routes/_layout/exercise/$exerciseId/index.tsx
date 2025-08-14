import { createFileRoute } from '@tanstack/react-router'
import { useFetchExerciseById } from '@/api/exercises'
import { useExerciseReferenceLists } from '@/hooks/use-references'
import ExerciseInstructions from '@/components/ExerciseInstructions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/$exerciseId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { exerciseId } = Route.useParams()
  const { data: exercise, isLoading, error } = useFetchExerciseById(exerciseId)
  const { globalRefs, savedRefs, isLoading: refsLoading } = useExerciseReferenceLists(exerciseId)
  const navigate = useNavigate()
  
  // Get muscle groups from exercise data
  const muscleGroups = exercise?.exercise_muscle?.map(m => m.muscle_group) || []

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error.message}</p>
            <Button 
              onClick={() => navigate({ to: '/exercise' })}
              className="mt-4"
            >
              Back to Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Exercise Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested exercise could not be found.</p>
            <Button 
              onClick={() => navigate({ to: '/exercise' })}
              className="mt-4"
            >
              Back to Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine which references to show
  const referencesToShow = savedRefs.length > 0 ? savedRefs : globalRefs.slice(0, 3)

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link to="/">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link to="/exercise">
                  Exercises
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{exercise.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Exercise Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{exercise.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {exercise.exercise_to_category?.map(cat => (
            <span key={cat.category} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {cat.category}
            </span>
          ))}
          {exercise.exercise_to_type?.map(type => (
            <span key={type.type} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {type.type}
            </span>
          ))}
          {exercise.difficulty_level && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Difficulty: {exercise.difficulty_level}/10
            </span>
          )}
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {exercise.environment}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="space-y-6">
          {/* Image Placeholder */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {exercise.image_url ? (
                <img 
                  src={exercise.image_url} 
                  alt={exercise.name} 
                  className="w-full h-64 object-cover rounded-md"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {exercise.description && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{exercise.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Muscles Targeted */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Muscles Targeted</CardTitle>
            </CardHeader>
            <CardContent>
              {muscleGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((muscle, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No muscle groups specified</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - References and Instructions */}
        <div className="space-y-6">
          {/* References Section */}
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              {refsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : referencesToShow.length > 0 ? (
                <div className="space-y-4">
                  {referencesToShow.map((ref, index) => {
                    // Handle both saved and global reference types
                    if ('globalReference' in ref && ref.globalReference) {
                      // This is a saved reference with global reference data
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{ref.globalReference.title || 'Reference'}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Source: {ref.globalReference.source || 'Unknown'}
                          </p>
                          <a 
                            href={ref.globalReference.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                          >
                            View Reference
                          </a>
                        </div>
                      );
                    } else {
                      // This is a global reference
                      const globalRef = ref as any;
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{globalRef.title || 'Reference'}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Source: {globalRef.source || 'Unknown'}
                          </p>
                          <a 
                            href={globalRef.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                          >
                            View Reference
                          </a>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No references available for this exercise.</p>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {exercise.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ExerciseInstructions 
                  title="Exercise Instructions" 
                  instructions={exercise.instructions} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
