// FILE: src/routes/_layout/workspace/index.tsx

import { createFileRoute, redirect, Link } from '@tanstack/react-router';
// Import supabaseClient directly for use in beforeLoad (no hooks here)
import { supabase } from '@/lib/supabase/supabaseClient';

// Components for the fallback UI (if no workspace is selected)
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Icons for the fallback UI
import { Building, PlusCircle } from 'lucide-react';

// You might still need these components if you list teams on the fallback page
import { useDashboardSummaryQuery } from '@/api/dashboard'; // Used only if the component renders
import { WorkspaceCard, WorkspaceCardSkeleton } from '@/components/new/workspace/WorkspaceCard';
import { CreateTeamDialog } from '@/components/new/team/CreateTeamDialog';
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_layout/workspace/')({
  beforeLoad: async ({ context }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: '/login' }); // Redirect to login if not authenticated
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('current_workspace_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile in beforeLoad for workspace index:', error);
      // Allow component to render with an error state or a prompt
    }

    if (profile?.current_workspace_id) {
      // If a current workspace is set, redirect to its specific management page
      throw redirect({ to: `/workspace/${profile.current_workspace_id}` });
    }

    // If no current_workspace_id is set, allow the component to render (to show selection prompt)
    return {}; // Return an empty object or context if no redirect
  },
  component: WorkspaceSelectionPage, // Renamed for clarity: this page is about selection
});

function WorkspaceSelectionPage() {
  // These hooks will only run if beforeLoad does NOT redirect (i.e., current_workspace_id is null).
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();
  const currentWorkspaceId = summary?.current_workspace_id; // Will be null or undefined here

  return (
    <div className="pb-6">
      <Breadcrumb currentPath={location.pathname} rightContent={<CreateTeamDialog />} />
      {/* List of all teams/workspaces for selection */}
      <section className="space-y-4 mt-8">
        <Label variant='sectionTitle'>Your Available Workspaces</Label>
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
            {/* WorkspaceCard has the "Set as Current" logic */}
            {summary.my_teams.map(team => (
              <WorkspaceCard key={team.id} team={team} currentWorkspaceId={currentWorkspaceId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}