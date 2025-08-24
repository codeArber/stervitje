// FILE: src/routes/_layout/explore/plans.tsx

import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react'; // Explicitly import React
// CORRECTED: Import your own useDebounce hook
import { useDebounce } from '@/hooks/use-debounce';

// --- API & Types ---
// Import PlanFilters from its centralized location
import type { PlanFilters } from '@/types/plan';

// shadcn/ui components - Only those directly used in this route file
import { Button } from '@/components/ui/button'; // For the clear filters button
import { Separator } from '@/components/ui/separator'; // For visual separation

// Icons - Only those directly used in this route file
import { Home, Swords } from 'lucide-react';

// --- Reusable Components ---
import { Breadcrumb as TopNavigation } from '@/components/new/TopNavigation';
import { PlanResultsGrid } from '@/components/new/explore/plans/PlanResultsGrid';
import { PlanFiltersPanel } from '@/components/new/explore/plans/PlanFiltersPanel';

// Main Route Component
export const Route = createFileRoute('/_layout/explore/plans/')({
  component: ExplorePlansPage,
});

function ExplorePlansPage() {
  // State to hold the current filters selected by the user.
  // This state directly maps to the parameters expected by the RPC.
  const [filters, setFilters] = useState<PlanFilters>({});

  // Debounce the search term to avoid excessive API calls while typing.
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  // Construct the API filters payload using the debounced search term
  // and other filters from the state.
  const apiFilters: PlanFilters = {
    ...filters, // Spread all other filters (tagIds, difficultyLevel, pageLimit, pageOffset)
    searchTerm: debouncedSearchTerm,
  };

  // Determine if any filters (excluding the search term) are active
  const hasActiveNonSearchFilters = React.useMemo(() => {
    return Object.keys(filters).some(key => {
      if (key === 'searchTerm') return false; // Ignore search term for "active filter" count
      const value = filters[key as keyof PlanFilters];
      // Check if value is not null/undefined, or if it's an array, check if it's not empty
      return value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);
    });
  }, [filters]);

  const handleClearNonSearchFilters = () => {
    setFilters(prev => ({ searchTerm: prev.searchTerm })); // Only keep the search term
  };

  return (
    <div className="flex h-full flex-col">
      <TopNavigation
        items={[
          { label: 'Home', href: '/', icon: Home },
          { label: "Explore Plans", icon: Swords }, // Changed icon to be more fitting
        ]}
      />
      <div className='flex flex-col md:flex-row h-full'> {/* Changed to flex-col for mobile, then row for md+ */}
        {/* Filters Sidebar */}
        <aside className="w-full md:w-80 border-b md:border-r p-4 overflow-y-auto flex-shrink-0 " style={{ height: 'calc(100% )' }}> {/* Adjusted width, border, and height */}
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <PlanFiltersPanel filters={filters} setFilters={setFilters} />
          {/* Reset Filters Button (only if non-search filters are active) */}
          {hasActiveNonSearchFilters && (
            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={handleClearNonSearchFilters}>
          Clear all filters
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 "> {/* Remove overflow-y-auto, add flex flex-col min-h-0 */}
          <PlanResultsGrid filters={apiFilters} />
        </main>
      </div>
    </div>
  );
}