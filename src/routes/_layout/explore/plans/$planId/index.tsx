// FILE: src/routes/_layout/explore/plans/$planId.tsx

import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

// --- API & TYPES ---
import { usePlanDetailsQuery, useStartPlanForUserMutation } from '@/api/plan';
import type { FullPlan } from '@/types/plan';
import { toast } from 'sonner';

// --- DISPLAY COMPONENTS ---

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Dumbbell, PlusCircle, Star, Trophy, Users, ShieldCheck, Heart, GitFork, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PlanDisplay } from '@/components/new/plan/plan-display/PlanDisplay';
import { PlanCalendarView } from '@/components/new/plan/plan-display/PlanCalendarView';
import { PlanWeeklyNavigator } from '@/components/new/plan/plan-display/PlanWeeklyNavigator';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/explore/plans/$planId/')({
  component: PublicPlanDetailsPage,
});

function PublicPlanDetailsPage() {
  const { planId } = Route.useParams();
  const { data: planDetails, isLoading, isError, error } = usePlanDetailsQuery(planId);
  const { mutate: startPlan, isPending: isStartingPlan } = useStartPlanForUserMutation();

  if (isLoading) {
    return <PlanDetailsSkeleton />;
  }
  if (isError || !planDetails) {
    return <ErrorScreen message={error?.message || "The requested plan could not be loaded."} />;
  }

  const { plan, hierarchy, creator, goals, required_equipment, user_plan_status } = planDetails;

  const handleStartPlan = () => {
    // ... (this function's logic remains the same)
    const toastId = toast.loading('Starting this plan for you...');
    startPlan(plan.id, {
      onSuccess: () => {
        toast.success('Plan started! You can find it in your dashboard.', { id: toastId });
      },
      onError: (err) => toast.error(`Failed to start plan: ${err.message}`, { id: toastId }),
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* --- Header (No changes here) --- */}
      <header className="space-y-4">
        {/* ... */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/explore/plans">Explore Plans</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{plan.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">{plan.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <Link to="/users/$userId" params={{ userId: creator.id }} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-6 w-6"><AvatarImage src={creator.profile_image_url || undefined} /><AvatarFallback>{(creator.full_name || 'U').charAt(0)}</AvatarFallback></Avatar>
                <span>By {creator.full_name || creator.username}</span>
              </Link>
              | <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /><span>Level {plan.difficulty_level}/5</span></div>
            </div>
          </div>
          {user_plan_status ? (
            <Button size="lg" variant="secondary" asChild>
              <Link to="/dashboard">Go to My Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={handleStartPlan} disabled={isStartingPlan}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {isStartingPlan ? 'Starting...' : 'Start This Plan'}
            </Button>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{plan.description}</p>

        <div className="flex gap-4 pt-2 text-muted-foreground">
          <div className="flex items-center gap-1.5" title="Likes"><Heart className="h-4 w-4" /><span>{plan.like_count || 0} Likes</span></div>
          <div className="flex items-center gap-1.5" title="Forks"><GitFork className="h-4 w-4" /><span>{plan.fork_count || 0} Forks</span></div>
        </div>
      </header>

      {/* --- Info Cards (No changes here) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... */}
        <InfoCard title="Plan Goals" icon={<Trophy className="h-5 w-5 text-green-500" />}>
          {goals && goals.length > 0 ? (
            <ul className="space-y-3">{goals.map(goal => <li key={goal.id} className="flex items-start gap-3"><ShieldCheck className="h-4 w-4 mt-1 text-green-500 shrink-0" /><div><p className="font-semibold">{goal.title}</p><p className="text-sm text-muted-foreground">{goal.description}</p></div></li>)}</ul>
          ) : <p className="text-sm text-muted-foreground">No specific goals listed.</p>}
        </InfoCard>
        <InfoCard title="Required Equipment" icon={<Dumbbell className="h-5 w-5 text-blue-500" />}>
          {required_equipment && required_equipment.length > 0 ? (
            <div className="flex flex-wrap gap-2">{required_equipment.map(item => <Badge key={item.id} variant="secondary">{item.name}</Badge>)}</div>
          ) : <p className="text-sm text-muted-foreground">No specific equipment required.</p>}
        </InfoCard>
      </div>

      <Separator />

      {/* --- Plan Display Section (UPDATED with Tabs) --- */}
      <section>
        <Tabs defaultValue="compact" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold tracking-tight">Workout Schedule</h2>
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="compact">Compact</TabsTrigger>
              <TabsTrigger value="detailed">Detailed</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overall">

            <PlanCalendarView hierarchy={hierarchy} />
          </TabsContent>

          <TabsContent value="compact">
            <PlanWeeklyNavigator planDetails={planDetails} />
          </TabsContent>

          <TabsContent value="detailed">
            <PlanDisplay planDetails={planDetails} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}


// --- Reusable Sub-components for this page ---

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">{icon}<span>{title}</span></CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ErrorScreen = ({ message }: { message: string }) => (
  <div className="container py-16 text-center">
    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
    <h1 className="text-2xl font-bold mt-4 mb-2">Could Not Load Plan</h1>
    <p className="text-muted-foreground">{message}</p>
    <Button asChild className="mt-6">
      <Link to="/explore/plans">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
      </Link>
    </Button>
  </div>
);

const PlanDetailsSkeleton = () => (
  <div className="container mx-auto max-w-4xl py-8 space-y-8 animate-pulse">
    <header className="space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <div className="flex justify-between items-start">
        <div className="space-y-2"><Skeleton className="h-10 w-80" /><Skeleton className="h-5 w-64" /></div>
        <Skeleton className="h-12 w-40" />
      </div>
      <Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-2/3" />
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
    <Separator />
    <section><Skeleton className="h-8 w-1/3 mb-4" /><div className="space-y-4"><Skeleton className="h-64 w-full" /></div></section>
  </div>
);