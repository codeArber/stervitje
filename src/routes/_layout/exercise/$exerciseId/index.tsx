// FILE: src/routes/_layout/exercise/$exerciseId.tsx
// Make sure you have these installed: npm install lucide-react clsx tailwind-merge

import { createFileRoute, Link } from '@tanstack/react-router';
import { useExerciseDetailsQuery } from '@/api/exercise';

// shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Youtube } from 'lucide-react';

export const Route = createFileRoute('/_layout/exercise/$exerciseId/')({
  component: ExerciseDetailPage,
})



// --- The Main Page Component ---
function ExerciseDetailPage() {
  const { exerciseId } = Route.useParams();
  const { data: exerciseData, isLoading, isError } = useExerciseDetailsQuery(exerciseId);

  if (isLoading) {
    return <ExerciseDetailSkeleton />;
  }

  if (isError || !exerciseData) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Oops!</h1>
        <p className="text-destructive">Failed to load exercise details.</p>
        <p className="text-muted-foreground mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  const { exercise, muscle_groups, references, categories, types } = exerciseData;

  const difficultyMap: { [key: number]: string } = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

  return (
    <div className="container max-w-4xl py-8">
      {/* 1. Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/exercise">Exercises</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{exercise.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <main className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{exercise.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {exercise.difficulty_level && (
              <Badge variant="outline">{difficultyMap[exercise.difficulty_level]}</Badge>
            )}
            {categories?.map(cat => (
              <Badge key={cat} variant="secondary" className="capitalize">{cat}</Badge>
            ))}
            {types?.map(type => (
              <Badge key={type} variant="secondary" className="capitalize">{type}</Badge>
            ))}
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image and Description */}
          <div className="space-y-4">
             <div className="aspect-video overflow-hidden rounded-lg border">
                <img
                    src={exercise.image_url || `https://placehold.co/600x400?text=${exercise.name.replace(/\s/g, '+')}`}
                    alt={`Image of ${exercise.name}`}
                    className="w-full h-full object-cover"
                />
             </div>
            {exercise.description && (
              <p className="text-base text-muted-foreground">{exercise.description}</p>
            )}
          </div>

          {/* Right Column: Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-base">
                  {exercise.instructions || 'No instructions available.'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subsequent Cards */}
        <div className="space-y-6">
            {muscle_groups && muscle_groups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Muscles Targeted</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {muscle_groups.map((muscle) => (
                    <Badge key={muscle} className="capitalize">
                      {muscle.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {references && references.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Video References</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {references.map((ref) => (
                    <a
                      key={ref.id}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted"
                    >
                      <Youtube className="h-6 w-6 text-red-500 shrink-0" />
                      <span className="text-sm font-medium text-primary hover:underline">
                        {ref.title || 'Watch on YouTube'}
                      </span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  );
}


// --- A skeleton component for a better loading experience ---
const ExerciseDetailSkeleton = () => (
  <div className="container max-w-4xl py-8">
    <Skeleton className="h-6 w-1/2 mb-6" />
    <main className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full h-48" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    </main>
  </div>
);