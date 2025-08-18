// FILE: src/components/workspace/current-workspace-overview.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // To fetch detailed team info
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, LayoutDashboard, Calendar, Lock, Unlock } from 'lucide-react'; // Icons
import dayjs from 'dayjs';

interface CurrentWorkspaceOverviewProps {
  currentWorkspaceId: string | undefined;
}

export const CurrentWorkspaceOverview: React.FC<CurrentWorkspaceOverviewProps> = ({ currentWorkspaceId }) => {
  // Fetch details for the current workspace
const { data: teamDetails, isLoading, isError, error } = useTeamDetailsQuery(currentWorkspaceId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </Card>
    );
  }

  if (isError || !teamDetails || !teamDetails.team) {
    // If there's an error fetching details, or no details, or no current workspace selected
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <h3 className="font-semibold text-lg">No Current Workspace Selected or Found</h3>
        <p>Please select a workspace from the list below or create a new one.</p>
        {isError && <p className="text-destructive text-sm mt-2">Error: {error?.message}</p>}
      </Card>
    );
  }

  const { team, members, plans } = teamDetails;

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold">{team.name}</CardTitle>
          {/* Action buttons for the current workspace */}
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/workspace/$teamId" params={{ teamId: team.id }}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
              </Link>
            </Button>
            {/* You could add a button here to create a new plan within this workspace context */}
            {/* <Button asChild>
              <Link to="/workspace/$teamId/plans/new" params={{ teamId: team.id }}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Plan
              </Link>
            </Button> */}
          </div>
        </div>
        <CardDescription>{team.description || 'Your active workspace for managing plans and members.'}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{members?.length || 0} Members</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{plans?.length || 0} Plans</span>
          </div>
          <div className="flex items-center gap-2">
            {team.is_private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <span>{team.is_private ? 'Private' : 'Public'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Created: {dayjs(team.created_at).format('MMM D, YYYY')}</span>
          </div>
        </div>
      </CardContent>
      {/* You can add a quick summary of plans or recent activity here if desired */}
    </Card>
  );
};