// FILE: src/routes/_layout/workspace/index.tsx

import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase/supabaseClient';

// Components for the fallback UI (if no workspace is selected)
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Icons for the fallback UI
import { Building, PlusCircle } from 'lucide-react';

// --- UPDATED IMPORTS ---
import { useDashboardSummaryQuery } from '@/api/dashboard'; // Re-import dashboard summary hook
import { WorkspaceCard, WorkspaceCardSkeleton } from '@/components/new/workspace/WorkspaceCard';
import { CreateTeamDialog } from '@/components/new/team/CreateTeamDialog';
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_layout/workspace/')({
  beforeLoad: async () => { // Removed context param as userId is no longer passed explicitly to component
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('current_workspace_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile in beforeLoad for workspace index:', error);
      // Decide how to handle this error, e.g., show a generic error page, or let the component handle.
    }

    if (profile?.current_workspace_id) {
      throw redirect({ to: `/workspace/${profile.current_workspace_id}` });
    }

    // If no current_workspace_id is set, allow the component to render.
    return {}; // No specific data needed from beforeLoad if using dashboard summary
  },
  component: WorkspaceSelectionPage,
});

function WorkspaceSelectionPage() {
  // Use the DashboardSummaryQuery which now includes team counts
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();

  const myTeams = summary?.my_teams; // This will now be DashboardMyTeam[]
  const currentWorkspaceId = summary?.current_workspace_id;

  return (
    <div className="pb-6 h-full overflow-y-auto px-6">
      <Breadcrumb currentPath={location.pathname} rightContent={<CreateTeamDialog />} />
      <section className="space-y-4 mt-8">
        <Label variant='sectionTitle'>Your Available Workspaces</Label>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <WorkspaceCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-destructive text-center py-10">Error loading workspaces: {error?.message}</div>
        ) : !myTeams || myTeams.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">You're not on any teams yet!</h3>
            <p className="text-muted-foreground mt-1">Create your first personal workspace or join a team.</p>
            <div className="mt-6">
              <CreateTeamDialog>
              </CreateTeamDialog>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* WorkspaceCard now receives `DashboardMyTeam` which has the counts */}
            {myTeams.map(team => (
              <WorkspaceCard key={team.id} team={team} currentWorkspaceId={currentWorkspaceId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}