// FILE: src/routes/_layout/explore/plans.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
// CORRECTED: Import your own useDebounce hook
import { useDebounce } from '@/hooks/use-debounce';

// API & Types
import { useRichPlanCardsQuery, useTagsQuery } from '@/api/plan';
import type { RichPlanCardData } from '@/types/plan';

// shadcn/ui components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import { Search, Star, GitFork, Heart, Users } from 'lucide-react';
import { PlanFilters } from '@/api/plan/endpoint';

// Main Route Component
export const Route = createFileRoute('/_layout/explore/plans/')({
  component: ExplorePlansPage,
});

function ExplorePlansPage() {
  const [filters, setFilters] = useState<PlanFilters>({});
  // This now uses your custom hook. The debounce logic is slightly different
  // as your hook directly debounces the value.
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  // We combine the debounced term with the instant filters for the API call
  const apiFilters = {
    ...filters,
    searchTerm: debouncedSearchTerm,
  };

  return (
    <div className="flex h-full">
      {/* Filters Sidebar */}
      <aside className="w-80 h-full border-r p-4 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <PlanFiltersPanel filters={filters} setFilters={setFilters} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Explore Plans</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Find the perfect training plan designed by our community of expert coaches.
          </p>
        </header>
        <PlanResultsGrid filters={apiFilters} />
      </main>
    </div>
  );
}


// --- Sub-components for the Page ---

// Filters Panel Component
function PlanFiltersPanel({ filters, setFilters }: { filters: PlanFilters; setFilters: React.Dispatch<React.SetStateAction<PlanFilters>> }) {
    const { data: equipmentTags, isLoading: isLoadingEquipment } = useTagsQuery('equipment');
  
    const handleTagChange = (tagId: number, isChecked: boolean) => {
      setFilters(prev => {
        const currentTags = prev.tagIds || [];
        const newTags = isChecked
          ? [...currentTags, tagId]
          : currentTags.filter(id => id !== tagId);
        // We set pageOffset back to 0 when filters change
        return { ...prev, tagIds: newTags.length > 0 ? newTags : undefined, pageOffset: 0 };
      });
    };
  
    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="search">Search by Name</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="e.g., Strength Builder"
              className="pl-9"
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value, pageOffset: 0 }))}
            />
          </div>
        </div>
        
        <Accordion type="multiple" defaultValue={['equipment']} className="w-full">
          <AccordionItem value="equipment">
            <AccordionTrigger className="font-semibold">Equipment</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {isLoadingEquipment ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                equipmentTags?.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tagIds?.includes(tag.id)}
                      onCheckedChange={(checked) => handleTagChange(tag.id, !!checked)}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="font-normal cursor-pointer">{tag.name}</Label>
                  </div>
                ))
              )}
            </AccordionContent>
          </AccordionItem>
          {/* Add more AccordionItems for other filter types like 'primary_physical_intent' later */}
        </Accordion>
      </div>
    );
  }
  
// Results Grid Component
function PlanResultsGrid({ filters }: { filters: PlanFilters }) {
  const { data: plans, isLoading, isError, error } = useRichPlanCardsQuery(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <PlanCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-center py-10">Error: {error.message}</div>;
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold">No Plans Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to find more plans.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map(plan => <PlanCard key={plan.id} planData={plan} />)}
    </div>
  );
}

// Single Plan Card Component
function PlanCard({ planData }: { planData: RichPlanCardData }) {
    // UPDATED: Destructure plan from planData, which is the whole object
    const { analytics, creator } = planData;
    const plan = planData; // For clarity, the root object is the plan
  
    return (
      <Link to="/plans/$planId" params={{ planId: plan.id }}>
        <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={creator.profile_image_url || undefined} alt={creator.full_name || 'Creator'} />
                <AvatarFallback>{(creator.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{creator.full_name || creator.username}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{plan.description}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline"><Star className="h-3 w-3 mr-1" /> Level {plan.difficulty_level}/5</Badge>
              {/* Add more badges for primary intent or equipment later */}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-3 flex justify-around text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1" title="Likes"><Heart className="h-3 w-3" /><span>{analytics?.like_count || 0}</span></div>
            <div className="flex items-center gap-1" title="Forks"><GitFork className="h-3 w-3" /><span>{analytics?.fork_count || 0}</span></div>
            <div className="flex items-center gap-1" title="Active Users"><Users className="h-3 w-3" /><span>{analytics?.active_users_count || 0}</span></div>
            <div className="flex items-center gap-1 font-semibold text-primary" title="Average Goal Success Rate"><Star className="h-3 w-3" /><span>{Math.round(analytics?.avg_goal_success_rate || 0)}% Success</span></div>
          </CardFooter>
        </Card>
      </Link>
    );
  }
  

// Skeleton for the Plan Card
function PlanCardSkeleton() {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3">
            <Skeleton className="h-5 w-full" />
        </CardFooter>
      </Card>
    );
  }