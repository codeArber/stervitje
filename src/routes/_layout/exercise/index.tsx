// FILE: src/routes/_layout/exercise/index.tsx
// Make sure you have these installed: npm install lucide-react clsx tailwind-merge

import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useFilteredExercisesQuery } from '@/api/exercise';
import { useDebounce } from '@/hooks/use-debounce'; // Assumes you created this file
import { allMuscleGroups, allCategories, allTypes } from '@/types/exercise'; // Assumes you updated this file

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils'; // Your utility for merging tailwind classes

// Icons
import { ChevronsUpDown, Check, X } from 'lucide-react';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/exercise/')({
  component: ExerciseListPage,
});


// --- The Main Page Component ---
function ExerciseListPage() {
  // State for all our filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(''); // string for ToggleGroup

  // Debounce the search term to avoid excessive API calls while typing
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize the filters object to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
    muscleGroups: selectedMuscles.length > 0 ? selectedMuscles : undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    difficultyLevel: selectedDifficulty ? parseInt(selectedDifficulty, 10) : undefined,
  }), [debouncedSearchTerm, selectedMuscles, selectedCategories, selectedTypes, selectedDifficulty]);

  const { data: exercises, isLoading, isError } = useFilteredExercisesQuery(filters);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMuscles([]);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedDifficulty('');
  };

  const hasActiveFilters = searchTerm || selectedMuscles.length || selectedCategories.length || selectedTypes.length || selectedDifficulty;

  return (
    <div className="container p-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of exercises to build your perfect workout.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by exercise name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MultiSelectFilter
            title="Muscles"
            options={allMuscleGroups}
            selectedValues={selectedMuscles}
            setSelectedValues={setSelectedMuscles}
          />
          <MultiSelectFilter
            title="Categories"
            options={allCategories}
            selectedValues={selectedCategories}
            setSelectedValues={setSelectedCategories}
          />
          <MultiSelectFilter
            title="Types"
            options={allTypes}
            selectedValues={selectedTypes}
            setSelectedValues={setSelectedTypes}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
          <ToggleGroup
            type="single"
            value={selectedDifficulty}
            onValueChange={(value) => setSelectedDifficulty(value)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="1" aria-label="Beginner">1</ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Intermediate">2</ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="Advanced">3</ToggleGroupItem>
          </ToggleGroup>
          {hasActiveFilters ? (
             <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-2" />
                Reset Filters
            </Button>
          ) : null}
        </div>
      </div>


      {/* Content Display */}
      <div>
        {isLoading && <ExerciseListSkeleton />}
        {isError && <p className="text-destructive text-center py-10">Failed to load exercises. Please try again.</p>}
        {!isLoading && !isError && exercises && exercises.length === 0 && (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold">No Exercises Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
          </div>
        )}
        {!isLoading && !isError && exercises && exercises.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// --- Sub-components for better organization ---

// A single Exercise Card to display in the grid
const ExerciseCard = ({ exercise }: { exercise: any }) => (
  <Link
    to="/exercise/$exerciseId"
    params={{ exerciseId: exercise.id }}
    className="group"
  >
    <Card className="h-full flex flex-col overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
      <div className="aspect-video overflow-hidden border-b">
        <img
          src={exercise.image_url || 'https://placehold.co/400x300?text=No+Image'}
          alt={exercise.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate leading-tight">{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Badge variant="secondary" className="capitalize">
          {exercise.environment?.replace(/-/g, ' ')}
        </Badge>
      </CardContent>
    </Card>
  </Link>
);

// The reusable Multi-select Filter Component using Popover and Command
const MultiSelectFilter = ({ title, options, selectedValues, setSelectedValues }: { title: string; options: readonly string[], selectedValues: string[], setSelectedValues: (values: string[]) => void }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: string) => {
    setSelectedValues(
      selectedValues.includes(currentValue)
        ? selectedValues.filter((value) => value !== currentValue)
        : [...selectedValues, currentValue]
    );
  };

  const formattedTitle = selectedValues.length > 0 ? `${selectedValues.length} selected` : `Select ${title}...`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{formattedTitle}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={handleSelect}
                  className="capitalize"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.replace(/-/g, ' ')}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// A skeleton component for a better loading experience
const ExerciseListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i}>
        <Skeleton className="aspect-video w-full" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-1/3" />
        </CardContent>
      </Card>
    ))}
  </div>
);