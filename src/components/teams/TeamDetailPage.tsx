import { TeamBreadcrumb } from "./Breadcrumb";
import { TeamInfoCard } from "./TeamInfoCard";
import { TeamMembersList } from "./TeamMembersList";
import { TeamPlansList } from "./TeamPlansList";
import { useFetchTeamDetail } from "@/api/teams";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreatePlanForm } from "./CreatePlanForm";

type TeamDetailPageProps = {
  teamId: string;
};

export function TeamDetailPage({ teamId }: TeamDetailPageProps) {
  // Fetch team details
  const { data: team, isLoading } = useFetchTeamDetail(teamId);


  console.log('team', team)
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <TeamBreadcrumb />
      </div>
      
      <div className="mb-6 flex justify-between items-center">
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
