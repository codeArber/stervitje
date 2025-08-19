// FILE: src/routes/_layout/users/$userId.tsx

import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

// --- API & TYPES ---
import { useUserProfileDetailsQuery, useUserPlanHistoryQuery } from '@/api/user';
import type { UserTeamWithRelations, UserPlanHistoryItem } from '@/types/user';
import type { Plan } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Star, Users, ArrowLeft, AlertTriangle } from 'lucide-react';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/explore/users/$userId/')({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  
  // --- Data Fetching ---
  const { data: userDetails, isLoading, isError, error } = useUserProfileDetailsQuery(userId);
  // We also fetch the user's plan history separately
  const { data: planHistory, isLoading: isLoadingHistory } = useUserPlanHistoryQuery(userId);

  if (isLoading || isLoadingHistory) {
    return <UserProfileSkeleton />;
  }

  if (isError || !userDetails) {
    return <ErrorScreen message={error?.message || "This user could not be found."} />;
  }

  const { profile, teams, active_plan_details } = userDetails;

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="w-32 h-32 border-4">
          <AvatarImage src={profile.profile_image_url || undefined} alt={profile.username || 'User avatar'} />
          <AvatarFallback className="text-5xl">
            {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tighter">{profile.full_name || profile.username}</h1>
          <p className="text-lg text-muted-foreground">@{profile.username}</p>
          <p className="text-base text-foreground pt-2">{profile.bio || "No bio provided."}</p>
        </div>
      </header>

      <Separator />

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Teams & Active Plan */}
        <div className="md:col-span-1 space-y-6">
          <TeamsCard teams={teams} />
          <ActivePlanCard plan={active_plan_details?.plan} />
        </div>

        {/* Right Column: Plan History */}
        <div className="md:col-span-2">
          <PlanHistoryCard history={planHistory} />
        </div>
      </main>
    </div>
  );
}


// --- Sub-components for the Page ---

function TeamsCard({ teams }: { teams: UserTeamWithRelations[] | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Teams
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams && teams.length > 0 ? (
          teams.map(membership => (
            <Link key={membership.team.id} to="/explore/teams/$teamId" params={{ teamId: membership.team.id }}>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                <span className="font-semibold">{membership.team.name}</span>
                <Badge variant="secondary" className="capitalize">{membership.role}</Badge>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Not a member of any teams.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivePlanCard({ plan }: { plan: Plan | null | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" /> Currently Active Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plan ? (
          <Link to="/explore/plans/$planId" params={{ planId: plan.id }}>
            <div className="p-3 rounded-md border bg-background hover:border-primary transition-colors">
                <h4 className="font-semibold">{plan.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Star className="h-3 w-3" /> Level {plan.difficulty_level}/5
                </div>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">No active plan at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}

function PlanHistoryCard({ history }: { history: UserPlanHistoryItem[] | undefined }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Plan History
                </CardTitle>
                <CardDescription>A log of previously completed workout plans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {history && history.length > 0 ? (
                    history.map(item => (
                        <Link key={item.id} to="/explore/plans/$planId" params={{ planId: item.id }}>
                            <div className="p-3 rounded-md border bg-background hover:border-primary transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Last workout: {new Date(item.last_logged_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-8">
                        No plan history found.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// --- Skeleton and Error Components ---

const UserProfileSkeleton = () => (
    <div className="container mx-auto max-w-4xl py-8 space-y-8 animate-pulse">
      <header className="flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-80" />
        </div>
      </header>
      <Separator />
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
        <div className="md:col-span-2">
            <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
    <div className="container py-16 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold mt-4 mb-2">Could Not Load Profile</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link to="/explore/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore Users
        </Link>
      </Button>
    </div>
);