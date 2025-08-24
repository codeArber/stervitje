// FILE: /src/routes/_layout/exercise/index.tsx

import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

// --- API & Types ---
import type { ExerciseFilters as ApiExerciseFilters } from '@/api/exercise/endpoint'; // Your main filter type

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  Search,
  Home,
  Swords,
  Settings2,
  ChevronDown,
} from 'lucide-react';

// --- Reusable Components ---
import { Breadcrumb as TopNavigation } from '@/components/new/TopNavigation';
import { ExerciseResultsGrid } from '@/components/new/exercise/list/ExerciseResultsGrid';
import { ExerciseFiltersPanel } from '@/components/new/exercise/list/ExerciseFiltersPanel';

// --- Local Type Definitions (Ideally move ExerciseFilters to api/exercise/endpoint.ts) ---
// This interface directly reflects the parameters accepted by your `get_filtered_exercises_with_details` RPC.
// It's placed here for immediate context, but should live with your API definitions.
export interface ExerciseFilters extends ApiExerciseFilters { }

export const Route = createFileRoute('/_layout/exercise/')({
  component: ExerciseListPage,
});

function ExerciseListPage() {
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false); // State to control filter panel visibility
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  // Construct the API filters payload using the debounced search term
  // and other filters from the state.
  const apiFilters: ExerciseFilters = {
    ...filters, // Spread all other filters (muscleGroups, tagIds, difficultyLevel)
    searchTerm: debouncedSearchTerm,
  };

  // Determine if any filters (excluding the search term) are active
  const hasActiveNonSearchFilters = React.useMemo(() => {
    return Object.keys(filters).some(key => {
      if (key === 'searchTerm') return false; // Ignore search term for "active filter" count
      const value = filters[key as keyof ExerciseFilters];
      // Check if value is not null/undefined, or if it's an array, check if it's not empty
      return value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);
    });
  }, [filters]);

  const handleClearNonSearchFilters = () => {
    setFilters(prev => ({ searchTerm: prev.searchTerm })); // Only keep the search term
    setFiltersOpen(false); // Close filters panel after clearing
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4">
        <TopNavigation
          items={[
            { label: 'Home', href: '/', icon: Home },
            { label: "Exercises", icon: Swords },
          ]}
          rightContent={
            <div className="flex items-center gap-2">
              {/* Search Input in TopNavigation */}
              <div className="relative">
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
                <Input
                  id="search"
                  placeholder="Search exercises"
                  value={filters.searchTerm || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined }))}
                  className='pl-10 w-[200px]'
                />
              </div>
              {/* --- FIX: CollapsibleTrigger now correctly controls the Collapsible outside this rightContent --- */}
              {/* This button will open/close the Collapsible located below the TopNavigation */}
              <Button
                variant="ghost"
                className="h-fit py-1 px-2 text-foreground/80 hover:text-foreground"
                onClick={() => setFiltersOpen(prev => !prev)} // Manually toggle state
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          }
        />
      </div>

  <div className="container mx-auto flex-1 overflow-y-auto">
        {/* --- FIX: Collapsible component wrapping the filters panel --- */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="w-full">
          {/* Note: The CollapsibleTrigger is conceptually in the TopNavigation,
             but the actual Collapsible component must be here to wrap its content.
             The button in TopNavigation manually toggles `filtersOpen`.
             This resolves the "CollapsibleTrigger must be used within Collapsible" error. */}
          <CollapsibleContent className="space-y-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pb-4 px-2">
            <Separator className="my-4" />
            <div className="mb-6 p-4 border rounded-lg bg-background/90 backdrop-blur-sm shadow-sm">
              <ExerciseFiltersPanel
                filters={filters}
                setFilters={setFilters}
              />
              {/* Reset Filters Button (only if non-search filters are active) */}
              {hasActiveNonSearchFilters && (
                <div className="flex justify-end pt-4">
                  <Button variant="ghost" onClick={handleClearNonSearchFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <main>
          <ExerciseResultsGrid filters={apiFilters} />
        </main>
      </div>
    </div>
  );
}