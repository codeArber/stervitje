// FILE: src/routes/_layout/explore/plans/$planId.tsx

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { usePlanDetailsQuery, useStartUserPlanMutation } from '@/api/plan';
import { useUserProfileDetailsQuery } from '@/api/user';
import { useStartWorkoutMutation } from '@/api/workout';
import { useAuthStore } from '@/stores/auth-store';
import type { PlanHierarchy, PlanPerformanceStat } from '@/types/plan';

// shadcn/ui components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import { Users, BarChart3, Copy, PlayCircle, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/_layout/explore/plans/$planId/')({
  component: PlanDetailPage,
});

function PlanDetailPage() {
  const { planId } = Route.useParams();
  const { user } = useAuthStore();

  const { data: planDetails, isLoading: isLoadingPlan } = usePlanDetailsQuery(planId);
  const { data: currentUserProfile, isLoading: isLoadingUser } = useUserProfileDetailsQuery(user?.id);
  
  const { mutate: startPlan, isPending: isStartingPlan } = useStartUserPlanMutation();

  const handleStartPlan = () => {
    startPlan({ planId });
  };

  const isPlanActiveForUser = currentUserProfile?.active_plan?.plan_details.id === planId;
  const isLoading = isLoadingPlan || (!!user && isLoadingUser);

  if (isLoading) {
    return <PlanDetailSkeleton />;
  }

  if (!planDetails) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Plan Not Found</h1>
        <p className="text-destructive">Could not load the details for this plan.</p>
      </div>
    );
  }

  const { plan, creator, team, hierarchy, performance_stats } = planDetails;
  const difficultyMap: { [key: number]: string } = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

  return (
    <div className="container max-w-5xl py-8">
      <TooltipProvider>
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/explore/plans">Plans</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{plan.title}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <main className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight">{plan.title}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{plan.description || 'No description provided.'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {plan.difficulty_level && <Badge variant="outline"><BarChart3 className="mr-1.5 h-3 w-3" />{difficultyMap[plan.difficulty_level]}</Badge>}
                {plan.sport && <Badge variant="secondary" className="capitalize">{plan.sport}</Badge>}
              </div>
            </div>
            {/* This is the fully activated "smart" button */}
            {isPlanActiveForUser ? (
                <Button className="shrink-0 w-full sm:w-auto" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Plan is Active
                </Button>
            ) : (
                <Button 
                    className="shrink-0 w-full sm:w-auto" 
                    onClick={handleStartPlan} 
                    disabled={isStartingPlan || !user}
                >
                    {isStartingPlan ? 'Starting...' : <><Copy className="mr-2 h-4 w-4" /> Start This Plan</>}
                </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Created By</CardTitle></CardHeader>
              <CardContent>
                <Link to="/explore/users/$userId" params={{ userId: creator.id }} className="flex items-center gap-3 group">
                  <Avatar>
                    <AvatarImage src={creator.profile_image_url || ''} />
                    <AvatarFallback>{creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold group-hover:underline">{creator.full_name || creator.username}</p>
                    <p className="text-sm text-muted-foreground">@{creator.username}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
            {team && (
              <Card>
                <CardHeader><CardTitle className="text-base font-semibold">Team</CardTitle></CardHeader>
                <CardContent>
                  <Link to="/explore/teams/$teamId" params={{ teamId: team.id }} className="flex items-center gap-3 group">
                    <Avatar>
                      <AvatarImage src={team.logo_url || ''} />
                      <AvatarFallback>{team.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold group-hover:underline">{team.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{team.sport || 'Community Team'}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <PlanHierarchyView hierarchy={hierarchy} isPlanActiveForUser={isPlanActiveForUser} />
            </div>
            <div className="lg:col-span-1">
              <PerformanceStatsView stats={performance_stats} />
            </div>
          </div>
        </main>
      </TooltipProvider>
    </div>
  );
}

const PlanHierarchyView = ({ hierarchy, isPlanActiveForUser }: { hierarchy: PlanHierarchy; isPlanActiveForUser: boolean | undefined }) => {
  const navigate = useNavigate();
  const { mutate: startWorkout, isPending } = useStartWorkoutMutation();
  const { user } = useAuthStore();

  const handleStartWorkout = (planSessionId: string) => {
    startWorkout(planSessionId, {
      onSuccess: (newSessionLog) => {
        navigate({ to: '/workout/$logId', params: { logId: newSessionLog.id } });
      },
      onError: (error) => {
        console.error("Failed to start planned workout:", error);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Schedule</CardTitle>
        <CardDescription>A week-by-week breakdown of the entire training plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {hierarchy.weeks?.map((week) => (
            <AccordionItem key={week.id} value={`week-${week.id}`}>
              <AccordionTrigger className="p-4 text-left hover:no-underline">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">Week {week.week_number}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {week.days?.map(day => (
                      <Badge key={day.id} variant={day.is_rest_day ? "outline" : "default"}>
                        {day.title || `Day ${day.day_number}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 space-y-4">
                {week.days?.map((day) => (
                  <div key={day.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-semibold flex-1">{day.title || `Day ${day.day_number}`}</h4>
                      {!day.is_rest_day && day.sessions && day.sessions.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleStartWorkout(day.sessions![0].id)}
                          disabled={isPending || !isPlanActiveForUser || !user}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Session
                        </Button>
                      )}
                    </div>
                    {day.is_rest_day ? (
                      <p className="text-sm text-muted-foreground italic mt-2">Rest Day</p>
                    ) : (
                      day.sessions?.map(session => (
                        <div key={session.id} className="mt-2">
                           {session.title && <p className="text-sm font-medium">{session.title}</p>}
                           <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground space-y-1">
                            {session.exercises?.map(exercise => (
                              <li key={exercise.id}>
                                {exercise.sets?.length || 0} x {exercise.exercise_details.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const PerformanceStatsView = ({ stats }: { stats: PlanPerformanceStat[] | null }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Leaderboard</span>
            </CardTitle>
            <CardDescription>How others have performed on this plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {stats && stats.length > 0 ? (
                stats.map(stat => (
                    <div key={stat.user_profile.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={stat.user_profile.profile_image_url || ''} />
                                <AvatarFallback>{stat.user_profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{stat.user_profile.full_name || stat.user_profile.username}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stat.unique_workouts_logged} of {stat.total_workouts_planned} workouts completed
                                </p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger className="w-full">
                                <Progress value={stat.completion_percentage} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Completion: {stat.completion_percentage}%</p>
                                <p>Adherence: {stat.adherence_percentage}%</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Be the first to complete this plan!</p>
            )}
        </CardContent>
    </Card>
);

const PlanDetailSkeleton = () => (
    <div className="container max-w-5xl py-8">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <main className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <div className="flex gap-4 mt-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-20" /></div>
                </div>
                <Skeleton className="h-10 w-full sm:w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
            </div>
        </main>
    </div>
);