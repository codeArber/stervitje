// FILE: src/routes/_layout/workspace/index.tsx

import { createFileRoute, redirect, Link, Outlet, useNavigate } from '@tanstack/react-router';
// Import supabaseClient directly for use in beforeLoad
import { supabase } from '@/lib/supabase/supabaseClient'; 

// Import components if the component part of the route is still used for fallback UI
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Building, PlusCircle } from 'lucide-react';

// Re-import the components for the fallback UI if no workspace is selected

// useDashboardSummaryQuery is used in the component, not beforeLoad
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { useAuthStore } from '@/stores/auth-store'; // For fallback UI logic if needed
import { WorkspaceCard, WorkspaceCardSkeleton } from '@/components/new/workspace/WorkspaceCard';

export const Route = createFileRoute('/_layout/')({
  component: WorkspacePage,
});

function WorkspacePage() {
  // These hooks will only run if beforeLoad does NOT redirect.
  // This means the user does NOT have a current_workspace_id set.
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();
  const currentWorkspaceId = summary?.current_workspace_id; // This will be null here if beforeLoad didn't redirect

  // The content of this page is now to guide the user to select a workspace.
  // We'll show the list of all teams, with the "Set as Current" option.

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <header className="mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-9 w-9" /> Select Your Workspace
          </h1>
          <Button asChild>
            <Link to="/teams/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
            </Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">
          You haven't selected a primary workspace. Please choose one to begin managing your plans and team activities.
        </p>
      </header>

      <Separator />

      {/* List of all teams/workspaces for selection */}
      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-bold tracking-tight">Your Available Workspaces</h2>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <WorkspaceCardSkeleton key={i} />)}
            </div>
        ) : isError ? (
            <div className="text-destructive text-center py-10">Error loading workspaces: {error.message}</div>
        ) : !summary?.my_teams || summary.my_teams.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">You're not on any teams yet!</h3>
                <p className="text-muted-foreground mt-1">Create your first personal workspace or join a team.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.my_teams.map(team => (
                    <WorkspaceCard key={team.id} team={team} currentWorkspaceId={currentWorkspaceId} />
                ))}
            </div>
        )}
      </section>
    </div>
  );
}