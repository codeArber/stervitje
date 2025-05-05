"use client"

import React, { useState } from 'react'; // Import React for Fragment
import { useInfiniteExercises } from "@/api/exercises"; // Adjust path if needed
import { ExerciseCard } from "./ExerciseCard"; // Adjust path if needed
import { Button } from "@/components/ui/button"; // Import Button for Load More
import { Skeleton } from "@/components/ui/skeleton"; // Optional: for loading state
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Constants } from '@/lib/database.types';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from './ui/breadcrumb';
import { Link } from '@tanstack/react-router';

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
  const [filters, setFilters] = useState<{
    difficulty?: number;
    type?: string;
    category?: string;
    searchTerm?: string;
  }>({});

  // 2️⃣  data hook – query key now includes filters
  const {
    data, error, fetchNextPage, hasNextPage,
    isFetchingNextPage, isLoading,
  } = useInfiniteExercises(filters);   // <-- just pass it

  // Get the enum values from Constants
  const difficultyOptions = [1, 2, 3, 4, 5];
  const typeOptions = Constants.public.Enums.exercise_type_enum;
  const categoryOptions = Constants.public.Enums.exercise_category;

  // Header with filters
  const ExerciseHeader = (
    <div className="space-y-4 mb-6 w-full">
      <div className='flex flex-row '>
        <div className=' bg-sidebar flex items-center shadow px-4 py-6 z-10 w-full justify-between h-18'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/'>
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Exercises</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div></div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Exercise Library</h2>
        </div>

        <div className="flex flex-row gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search exercises..."
              className="pl-8 w-full"
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined }))}
            />
          </div>
          <div className='flex flex-row gap-4'>
            <Select
              value={filters.difficulty?.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: Number(value) || undefined }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Difficulties</SelectItem>
                {difficultyOptions.map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} {level === 1 ? '(Easiest)' : level === 5 ? '(Hardest)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Exercise Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Types</SelectItem>
                {typeOptions.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Categories</SelectItem>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
              <Button
                variant="outline"
                onClick={() => setFilters({})}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  if (isLoading) {
    // Show skeletons during initial load
    return (
      <div className="space-y-6 w-full">
        {ExerciseHeader}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Render multiple skeletons */}
          {Array.from({ length: 8 }).map((_, index) => (
            <ExerciseCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 w-full">
        {ExerciseHeader}
        <div className="text-red-600">
          Error loading exercises: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {ExerciseHeader}

      {/* display the data, paginated 
     */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page?.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </React.Fragment>
        ))}

        {/* Show skeletons while fetching the *next* page for smoother loading */}
        {isFetchingNextPage && Array.from({ length: 4 }).map((_, index) => (
          <ExerciseCardSkeleton key={`loading-${index}`} />
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center pt-4">
        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        )}
        {!hasNextPage && data?.pages.length > 0 && (
          <p className="text-muted-foreground text-sm">You've reached the end!</p>
        )}
      </div>
    </div>
  );
}