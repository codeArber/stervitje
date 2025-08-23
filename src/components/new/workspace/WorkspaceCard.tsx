// FILE: src/components/workspace/workspace-card.tsx

import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSetCurrentUserWorkspaceMutation } from '@/api/user';
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Home, Users } from 'lucide-react';

// Types
import type { MyTeam } from '@/types/dashboard';

interface WorkspaceCardProps {
  team: MyTeam;
  currentWorkspaceId: string | null | undefined;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ team, currentWorkspaceId }) => {
  const navigate = useNavigate();
  const Icon = team.is_personal_workspace ? Home : Users;
  const { mutate: setCurrentWorkspace, isPending } = useSetCurrentUserWorkspaceMutation();

  const isCurrent = team.id === currentWorkspaceId;

  const handleCardClick = () => {
    const toastId = toast.loading('Setting current workspace...');
    setCurrentWorkspace(team.id, {
      onSuccess: () => {
        toast.success(`'${team.name}' set as current workspace!`, { id: toastId });
        navigate({ to: '/workspace/$teamId', params: { teamId: team.id } });
      },
      onError: (error) => {
        toast.error(`Error setting workspace: ${error.message}`, { id: toastId });
      }
    });
  };

  if (isCurrent) {
    // If this card represents the current workspace, it's displayed in CurrentWorkspaceOverview.
    // So, this component should not render itself if it's the current one.
    return null;
  }

  return (
    <Card 
      className={`h-full flex flex-col hover:border-primary transition-colors duration-200 cursor-pointer ${
        isPending ? 'opacity-50 pointer-events-none' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex-grow">
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
      <CardFooter className="bg-muted/50 p-3 flex justify-center items-center text-sm">
        <Badge variant="secondary" className="capitalize">{team.role}</Badge>
      </CardFooter>
    </Card>
  );
};

// Reusing MyTeamCardSkeleton for consistency, can be named WorkspaceCardSkeleton if preferred.
export const WorkspaceCardSkeleton: React.FC = () => {
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
};