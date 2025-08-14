import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TeamBreadcrumb } from "./Breadcrumb";
import { TeamInfoCard } from "./TeamInfoCard";
import { TeamMembersList } from "./TeamMembersList";
import { TeamPlansList } from "./TeamPlansList";
import { useFetchTeamDetail } from "@/api/teams";
import { Skeleton } from "@/components/ui/skeleton";

type TeamDetailSimpleProps = {
  teamId: string;
};

export function TeamDetailSimple({ teamId }: TeamDetailSimpleProps) {
  // Fetch team details
  const { data: team, isLoading, isError } = useFetchTeamDetail(teamId);

  // Show skeleton while loading
  if (isLoading || !team) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1 lg:col-span-3" />
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-1" />
        </div>
      </div>
    );
  }

  // If team is not found, show error
  if (!team) {
    return (
      <div className="container mx-auto py-6">
        <TeamBreadcrumb />
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded">
          Team not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <TeamBreadcrumb />
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamInfoCard team={team} />
        </div>
        
        <div>
          <TeamPlansList team={team} />
        </div>
        
        <div className="lg:col-span-3">
          <TeamMembersList team={team} />
        </div>
      </div>
    </div>
  );
}
