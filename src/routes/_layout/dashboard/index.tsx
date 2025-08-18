// FILE: /src/routes/_layout/teams/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { useSetCurrentUserWorkspaceMutation } from '@/api/user'; // <--- NEW IMPORT
import type { MyTeam } from '@/types/dashboard';
import { toast } from 'sonner'; // Import toast for feedback

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { Users, ArrowRight, PlusCircle, Home, CheckCircle } from 'lucide-react'; // Import CheckCircle

export const Route = createFileRoute('/_layout/dashboard/')({
  component: MyTeamsPage,
});

function MyTeamsPage() {
 
  return (
    <div>
      Dashboard
    </div>
  );
}

// --- Sub-components for the Page ---

function MyTeamCard({ team, currentWorkspaceId }: { team: MyTeam, currentWorkspaceId: string | null | undefined }) {
  const Icon = team.is_personal_workspace ? Home : Users;
  const { mutate: setCurrentWorkspace, isPending } = useSetCurrentUserWorkspaceMutation();

  const isCurrent = team.id === currentWorkspaceId;

  const handleSetAsCurrent = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to team details when clicking the button
    e.stopPropagation(); // Stop event propagation

    const toastId = toast.loading('Setting current workspace...');
    setCurrentWorkspace(team.id, {
      onSuccess: () => {
        toast.success(`'${team.name}' set as current workspace!`, { id: toastId });
      },
      onError: (error) => {
        toast.error(`Error setting workspace: ${error.message}`, { id: toastId });
      }
    });
  };

  return (
    <Link to="/dashboard/$teamId" params={{ teamId: team.id }}>
      <Card className={`h-full flex flex-col hover:border-primary transition-colors duration-200 ${isCurrent ? 'border-2 border-primary' : ''}`}>
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
            {isCurrent ? (
                <div className="flex items-center text-primary font-medium">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    <span>Current</span>
                </div>
            ) : (
                <Button variant="ghost" size="sm" onClick={handleSetAsCurrent} disabled={isPending}>
                    <span>Set as Current</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
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