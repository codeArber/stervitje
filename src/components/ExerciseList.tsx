"use client"

import React, { useState } from 'react';
import { useInfiniteExercises } from "@/api/exercises";
import { ExerciseCard } from "./ExerciseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseFilter, ExerciseFilterValues } from "./filters/ExerciseFilter";

// Helper for Skeleton Loading Cards
function ExerciseCardSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-video w-full bg-muted" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-3/4" /> {/* Title */}
        <Skeleton className="h-3 w-full" /> {/* Description line 1 */}
        <Skeleton className="h-3 w-5/6" /> {/* Description line 2 */}
      </div>
      <div className="p-3 pt-0 mt-auto"> {/* Push skeleton button down */}
         <Skeleton className="h-8 w-full" /> {/* Button */}
      </div>
    </div>
  );
}


export function ExerciseList() {
  // Call the hook without the incorrect 'page' parameter.
  // // Pass filtering options here if needed, e.g., useInfiniteExercises({ isPublic: true })
  // const {
  //   data,
  //   error,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetching, // Overall fetching state (initial load + next page)
  //   isFetchingNextPage, // Specifically fetching the next page
  //   isLoading, // Initial loading state
  // } = useInfiniteExercises({}); // Pass filter params here if needed

  // // Flatten the pages array into a single array of exercises
  // const allExercises = data?.pages.flatMap(page => page) ?? [];

  // // --- Render Logic ---

  // if (isLoading) {
  //   // Show skeletons during initial load
  //   return (
  //     <div className="space-y-6">
  //        <h2 className="text-2xl font-semibold tracking-tight">Exercise Library</h2>
  //        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  //          {/* Render multiple skeletons */}
  //          {Array.from({ length: 8 }).map((_, index) => (
  //             <ExerciseCardSkeleton key={index} />
  //          ))}
  //        </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="text-red-600">
  //       Error loading exercises: {error.message}
  //     </div>
  //   );
  // }

  const [filters, setFilters] = useState<ExerciseFilterValues>({});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Exercise Library</h2>

      <ExerciseFilter values={filters} onChange={setFilters} />

      {/* Placeholder for exercise grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Example static card while API logic is disabled */}
        <ExerciseCard
          exercise={{
            id: '1',
            name: 'Placeholder Exercise',
            description: 'Example description',
            difficulty_level: 3,
            image_url: '',
            is_public: true,
          }}
        />
      </div>
    </div>
  );
}

// Grid for Exercise Cards
// {allExercises.length > 0 ? (
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//     {allExercises.map((exercise) => (
//       // Add the required unique key prop
//       <ExerciseCard key={exercise.id} exercise={exercise} />
//     ))}
//      {/* Show skeletons while fetching the *next* page for smoother loading */}
//      {isFetchingNextPage && Array.from({ length: 4 }).map((_, index) => (
//         <ExerciseCardSkeleton key={`loading-${index}`} />
//      ))}
//   </div>
// ) : (
//   // Message if no exercises are found (and not loading/error)
//   !isFetching && <p>No exercises found.</p>
// )}


// {/* Load More Button */}
// <div className="flex justify-center pt-4">
//   {hasNextPage && (
//     <Button
//       onClick={() => fetchNextPage()}
//       disabled={isFetchingNextPage}
//       variant="outline"
//     >
//       {isFetchingNextPage ? 'Loading more...' : 'Load More'}
//     </Button>
//   )}
//   {!hasNextPage && allExercises.length > 0 && (
//        <p className="text-muted-foreground text-sm">You've reached the end!</p>
//   )}
// </div>