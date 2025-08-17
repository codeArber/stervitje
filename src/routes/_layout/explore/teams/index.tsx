// FILE: /src/routes/_layout/explore/teams.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

// API & Types
import { useRichTeamCardsQuery } from '@/api/team';
import type { RichTeamCardData } from '@/types/team';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Icons
import { Search, Users, Dumbbell, PlusCircle, ArrowRight } from 'lucide-react';
import { TeamFilters } from '@/api/team/endpoint';

export const Route = createFileRoute('/_layout/explore/teams/')({
  component: ExploreTeamsPage,
});

function ExploreTeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filters: TeamFilters = { searchTerm: debouncedSearchTerm };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <header className="mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Explore Teams</h1>
          <Button asChild>
            <Link to="/teams"> {/* Assuming you'll have a create team page */}
              <PlusCircle className="mr-2 h-4 w-4" /> Create Team
            </Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">
          Find a community, join a coach's group, or create your own.
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for teams by name..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Grid */}
      <main>
        <TeamResultsGrid filters={filters} />
      </main>
    </div>
  );
}

// --- Sub-components for the Page ---

function TeamResultsGrid({ filters }: { filters: TeamFilters }) {
  const { data: teams, isLoading, isError, error } = useRichTeamCardsQuery(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <TeamCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-center py-10">Error: {error.message}</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold">No Teams Found</h3>
        <p className="text-muted-foreground">Try a different search term or create a new team!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => <TeamCard key={team.id} team={team} />)}
    </div>
  );
}

function TeamCard({ team }: { team: RichTeamCardData }) {
  return (
    <Link to="/explore/teams/$teamId" params={{ teamId: team.id }}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
        <CardHeader>
          <div className="aspect-video w-full bg-muted rounded-md mb-4 flex items-center justify-center">
            {team.logo_url ? (
              <img src={team.logo_url} alt={`${team.name} logo`} className="h-full w-full object-cover rounded-md" />
            ) : (
              <Users className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {team.description || "No description available."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5" title="Members">
              <Users className="h-4 w-4" />
              <span>{team.members_count}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Public Plans">
              <Dumbbell className="h-4 w-4" />
              <span>{team.plans_count}</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </CardFooter>
      </Card>
    </Link>
  );
}

function TeamCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="aspect-video w-full rounded-md mb-4" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter className="bg-muted/50 p-3">
        <Skeleton className="h-5 w-full" />
      </CardFooter>
    </Card>
  );
}