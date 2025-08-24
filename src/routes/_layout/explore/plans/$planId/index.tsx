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
import { Dumbbell, PlusCircle, Star, Trophy, Users, ShieldCheck, Heart, GitFork, AlertTriangle, ArrowLeft, Home, Search, Calendar, Activity, KanbanSquareDashed } from 'lucide-react';
import { PlanDisplay } from '@/components/new/plan/plan-display/PlanDisplay';
import { PlanCalendarView } from '@/components/new/plan/plan-display/PlanCalendarView';
import { PlanWeeklyNavigator } from '@/components/new/plan/plan-display/PlanWeeklyNavigator';
import { StartPlanController } from '@/components/new/plan/plan-edit/StartPlanController';
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Label } from '@/components/ui/label';
import PlanMuscleDiagram from '@/components/new/exercise/PlanMuscleDiagram';
import { PlanGoalsDisplay } from '@/components/new/plan/plan-display/PlanGoalDisplay';
import { EquipmentBadge } from '@/components/new/plan/plan-display/Equipments';
import { PlanActionButton } from '@/components/new/plan/PlanActionButton';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/explore/plans/$planId/')({
  component: PublicPlanDetailsPage,
});

function PublicPlanDetailsPage() {
  const { planId } = Route.useParams();
  const { data: planDetails, isLoading, isError, error } = usePlanDetailsQuery(planId);
  const { mutate: startPlan, isPending: isStartingPlan } = useStartPlanForUserMutation();

  console.log(planDetails);
  if (isLoading) {
    return <PlanDetailsSkeleton />;
  }
  if (isError || !planDetails) {
    return <ErrorScreen message={error?.message || "The requested plan could not be loaded."} />;
  }

  const { plan, hierarchy, creator, goals, required_equipment, user_plan_status, muscle_activation_summary } = planDetails;

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
    <div className="flex flex-col gap-2 px-4 pb-4 overflow-y-auto h-full">
      {/* --- Header (No changes here) --- */}
      <header className="space-y-4 flex flex-col ">
        <Breadcrumb
          items={[
            { label: "Home", href: "/", icon: Home },
            { label: "Explore", href: "/explore", icon: Search },
            { label: "Plans", href: "/explore/plans", icon: Calendar },
            { label: plan.title } // Last item has no href (current page)
          ]}
        />
        <div className='flex flex-row justify-between w-full h-fit gap-4'>
          <div className="border-0 shadow-xl bg-muted backdrop-blur-sm overflow-hidden rounded-2xl">
            <div className="p-0 flex flex-col gap-0">
              <div className="flex justify-between items-start p-4 pb-2">
                <div className='flex flex-row justify-between w-full'>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-2 items-center">
                      <Label variant={'exerciseTitleBig'}>{plan.title}</Label>

                    </div>
                    <span className='text-muted-foreground text-xs flex flex-row gap-1'>By <Link to={'/explore/users/$userId'} params={{ userId: creator.id }} className="flex items-center gap-2 hover:underline">{creator.full_name || creator.username}</Link></span>
                  </div>
                  <div className='flex flex-row gap-4 items-center'>
                    <div className="flex flex-row gap-2 items-center">
                      <PlanActionButton planId={plan.id} />

                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Training Goals" icon={<KanbanSquareDashed className="h-5 w-5" />}>
                  <PlanGoalsDisplay goals={goals || []} maxPreviewGoals={3} />
                </InfoCard>

                <InfoCard title="Required Equipment" icon={<Dumbbell className="h-5 w-5" />}>
                  <EquipmentList equipment={required_equipment || []} />
                </InfoCard>
              </div>
              <p className="text-md text-muted-foreground px-4 py-3">{plan.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* Glassmorphism card */}
            <Card className="relative w-full max-w-md bg-background/80 dark:bg-background/20 backdrop-blur-lg border border-border/50 shadow-2xl overflow-hidden">
              {/* Animated gradient background inside card - subtle and theme-aware */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-muted/30 via-primary/10 to-secondary/20 opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-accent/15 via-muted/20 to-primary/15 opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

              {/* Moving gradient orbs inside card - very subtle */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce"></div>
              <div className="absolute top-8 -right-8 w-24 h-24 bg-gradient-to-r from-accent/20 to-muted/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
              <div className="absolute -bottom-8 left-8 w-28 h-28 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce" style={{ animationDelay: '4s' }}></div>
             
              <CardContent className="relative z-10 space-y-1 gap-1 pt-6">
                <div className="flex items-center gap-1 pb-2"><Star className="h-4 w-4 text-yellow-500" /><span>Level {plan.difficulty_level}/5</span></div>
                <PlanMuscleDiagram muscles={muscle_activation_summary} />
                <div className="flex flex-row justify-between w-full px-4">
                  {/* Like Count */}
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">{plan.like_count}</span>
                  </div>

                  {/* Fork Count with Button */}
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 bg-primary/20 hover:bg-primary/30 transition-all duration-200 px-2 py-1 rounded-md">
                      <GitFork className="w-4 h-4 text-foreground" />
                      <span className="text-sm text-foreground">{plan.fork_count}</span>
                    </button>
                  </div>

                  {/* Active Count */}
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </header>

      {/* --- Plan Display Section (UPDATED with Tabs) --- */}
      <section>
        <Tabs defaultValue="compact" className="w-full mt-2">
          <div className="flex justify-between items-center mb-4">
            <div>

            </div>
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

export const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className='p-4 border rounded-lg'>
    <div className='flex items-center gap-2 mb-3'>
      {icon}
      <span className='font-medium text-sm'>{title}</span>
    </div>
    <div>
      {children}
    </div>
  </div>
);
const EquipmentList: React.FC<{ equipment: any[] }> = ({ equipment }) => {

  if (!equipment || equipment.length === 0) {
    return <p className="text-sm text-muted-foreground">No specific equipment required.</p>;
  }

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {equipment.map((item, index) => (

        <EquipmentBadge key={item.id || index} equipmentName={item.name} />
      ))}
    </div>
  );
};

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