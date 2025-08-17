// FILE: /src/routes/_layout/teams/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useDashboardSummaryQuery } from '@/api/dashboard'; // We can reuse the dashboard query for this data
import type { MyTeam } from '@/types/dashboard';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { Users, ArrowRight, PlusCircle, Home } from 'lucide-react';

export const Route = createFileRoute('/_layout/teams/')({
  component: MyTeamsPage,
});

function MyTeamsPage() {
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <header className="mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">My Teams & Workspaces</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/explore/teams">
                <Users className="mr-2 h-4 w-4" /> Find Teams
              </Link>
            </Button>
            <Button asChild>
              <Link to="/teams"> {/* Assuming a create team page */}
                <PlusCircle className="mr-2 h-4 w-4" /> Create Team
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
          Select a team or workspace to view its plans and members.
        </p>
      </header>

      {/* Results Grid */}
      <main>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <MyTeamCardSkeleton key={i} />)}
            </div>
        ) : isError ? (
            <div className="text-destructive text-center py-10">Error: {error.message}</div>
        ) : !summary?.my_teams || summary.my_teams.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">You're not on any teams yet!</h3>
                <p className="text-muted-foreground mt-1">Join a team to collaborate or create one to get started.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.my_teams.map(team => <MyTeamCard key={team.id} team={team} />)}
            </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-components for the Page ---

function MyTeamCard({ team }: { team: MyTeam }) {
  const Icon = team.is_personal_workspace ? Home : Users;

  return (
    <Link to="/teams/$teamId" params={{ teamId: team.id }}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
        <CardHeader>
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Icon className="h-5 w-5" />
            <span className="font-semibold text-sm">
                {team.is_personal_workspace ? "Personal Workspace" : "Collaborative Team"}
            </span>
          </div>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {team.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
            <Badge variant="secondary" className="capitalize">{team.role}</Badge>
            <div className="flex items-center text-muted-foreground font-medium">
                <span>Open Workspace</span>
                <ArrowRight className="ml-2 h-4 w-4" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function MyTeamCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-4" />
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