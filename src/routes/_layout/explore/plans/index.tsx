// FILE: src/routes/_layout/explore/plans/index.tsx

import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useFilteredPlansQuery } from '@/api/plan';
import { useDebounce } from '@/hooks/use-debounce';
import { allMuscleGroups } from '@/types/exercise'; // Reusing from our exercise types
import type { Plan } from '@/types/index';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

// Icons
import { ChevronsUpDown, Check, X, BarChart } from 'lucide-react';
import { PlanCard } from '@/components/new/PlanCard';
import { CreatePlanDialog } from '@/components/new/CreatePlanDialog';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/plans/')({
  component: PlanListPage,
});


// --- The Main Page Component ---
function PlanListPage() {
  // State for our filters
  const [sportFilter, setSportFilter] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const debouncedSportFilter = useDebounce(sportFilter, 300);

  const filters = useMemo(() => ({
    sport_filter: debouncedSportFilter || undefined,
    muscle_groups_filter: selectedMuscles.length > 0 ? selectedMuscles : undefined,
    difficulty_level: selectedDifficulty ? parseInt(selectedDifficulty, 10) : undefined,
  }), [debouncedSportFilter, selectedMuscles, selectedDifficulty]);

  const { data: plans, isLoading, isError } = useFilteredPlansQuery(filters);

  const resetFilters = () => {
    setSportFilter('');
    setSelectedMuscles([]);
    setSelectedDifficulty('');
  };

  const hasActiveFilters = sportFilter || selectedMuscles.length || selectedDifficulty;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Discover Plans</h1>
          <p className="text-muted-foreground">
            Find the perfect training plan designed by our community and coaches.
          </p>
        </div>
        {/* ADD THE BUTTON HERE */}
        <CreatePlanDialog />
      </div>

      {/* Filter Controls */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by sport (e.g., Football)"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          />
          <MultiSelectFilter
            title="Muscles"
            options={allMuscleGroups}
            selectedValues={selectedMuscles}
            setSelectedValues={setSelectedMuscles}
          />
          <div className="flex items-center gap-4">
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
          </div>
        </div>
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground h-auto p-1">
            <X className="h-4 w-4 mr-1" />
            Reset Filters
          </Button>
        ) : null}
      </div>


      {/* Content Display */}
      <div>
        {isLoading && <PlanListSkeleton />}
        {isError && <p className="text-destructive text-center py-10">Failed to load plans. Please try again.</p>}
        {!isLoading && !isError && plans && plans.length === 0 && (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold">No Plans Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
          </div>
        )}
        {!isLoading && !isError && plans && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Reusable Multi-select Filter Component
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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

export const PlanListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex justify-between items-start"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-5 w-16" /></div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-5/6 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/3" />
        </CardFooter>
      </Card>
    ))}
  </div>
);