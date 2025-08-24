// FILE: src/routes/_layout/workspace/$teamId/plans/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useState } from 'react'; // Import React explicitly
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Icons
import { FileText, PlusCircle, Home, BuildingIcon, Settings, Search } from 'lucide-react'; // Added Search for plan filters

// Types
import type { TeamManagementPlanFilters } from '@/types/team'; // Import new filters type
import dayjs from 'dayjs'; // Still useful for general date formatting
import { CreatePlanDialog } from '@/components/new/plan/CreatePlanDialog';
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Label } from '@/components/ui/label';
import { useTeamDetailsQuery } from '@/api/team';
import { PlanCardTeamManagementSkeleton } from '@/components/new/team/PlanCardTeamManagementSkeleton';
import { Input } from '@/components/ui/input';
import { TeamManagementPlanGrid } from '@/components/new/team/TeamManagementPlanGrid';


export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/plans/')({
  component: WorkspacePlansPage,
});

function WorkspacePlansPage() {
  const { teamId } = Route.useParams();
  // We still need teamDetails for overall team info, name for breadcrumbs, and current_user_role
  const { data: teamDetails, isLoading: isLoadingTeamDetails, isError: isErrorTeamDetails, error: teamDetailsError } = useTeamDetailsQuery(teamId);
  const { user: authUser } = useAuthStore();

  // --- NEW: State for plan-specific filters ---
  const [planFilters, setPlanFilters] = useState<TeamManagementPlanFilters>({});


  if (isLoadingTeamDetails) return <WorkspacePlansSkeleton />; // Use the skeleton for the whole page
  if (isErrorTeamDetails || !teamDetails || !teamDetails.team) return (
    <div className="container mx-auto py-8 text-destructive text-center">
      Error loading workspace details: {teamDetailsError?.message || "Workspace not found."}
    </div>
  );

  const { team, current_user_role } = teamDetails;

  const canCreatePlans = current_user_role === 'admin' || current_user_role === 'coach';

  return (
    <div className='relative h-screen'>
      <Breadcrumb items={[
        { label: 'Home', href: '/', icon: Home },
        { label: 'Workspace', href: `/workspace/${team.id}`, icon: BuildingIcon },
        { label: team.name, icon: Settings, href: `/workspace/${team.id}` },
        { label: 'Plans', icon: FileText }
      ]} className='absolute -top-[68.5px] pl-4' /> {/* Adjust top offset if your header height changes */}
      <div className="pb-6 relative px-4 h-full  py-4 w-full">
        <div className='flex flex-col justify-between w-full h-full gap-4 relative'>
         
          {/* --- NEW: Plans List (Using TeamManagementPlanGrid) --- */}
          <section className='pb-20 h-full'>
            <TeamManagementPlanGrid teamId={teamId} filters={planFilters} />
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Removed old WorkspacePlanCard as it's replaced by PlanCardTeamManagement ---
// function WorkspacePlanCard...

// --- Updated WorkspacePlansSkeleton to use new skeleton card ---
function WorkspacePlansSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex justify-end mt-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </header>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlanCardTeamManagementSkeleton key={i} /> // Use the new skeleton
          ))}
        </div>
      </section>
    </div>
  );
}