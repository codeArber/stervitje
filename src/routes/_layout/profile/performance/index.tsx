// FILE: src/routes/_layout/profile/performance.tsx

import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';

// --- API & TYPES ---
import { useUserPlanPerformanceListQuery } from '@/api/performance';
import type { UserPlanPerformanceData } from '@/api/performance/endpoint';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Calendar, CheckCircle, Dumbbell, Star, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

// FILE: src/routes/_layout/profile/performance.tsx

// ... (keep all existing imports)
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // <-- Add Tabs import
import { OverallTrendsView } from '@/components/new/performance/OverallTrendsView';
import { LogbookView } from '@/components/new/performance/LogbookOverview';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/profile/performance/')({
  component: PerformanceDashboardPage,
});

function PerformanceDashboardPage() {
  const { user } = useAuthStore();
  const { data: performanceData, isLoading, isError, error } = useUserPlanPerformanceListQuery(user?.id);

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">My Performance</h1>
        <p className="text-lg text-muted-foreground">
          Analyze your workout consistency, review plan progress, and browse your complete training history.
        </p>
      </header>
      
      {/* --- Main Content with Tabs --- */}
      <main>
        <Tabs defaultValue="compact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">Overall Trends</TabsTrigger>
            <TabsTrigger value="compact">By Plan</TabsTrigger>
            <TabsTrigger value="detailed">Logbook</TabsTrigger>
          </TabsList>
          
          {/* --- Tab 1: Overall View --- */}
         <TabsContent value="overall" className="mt-6">
            <OverallTrendsView />
          </TabsContent>

          {/* --- Tab 2: Compact View (By Plan) --- */}
          <TabsContent value="compact" className="mt-6">
            {isLoading ? (
              <PerformancePageSkeleton />
            ) : isError ? (
              <ErrorScreen message={error.message} />
            ) : !performanceData || performanceData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {performanceData.map(data => (
                  <PlanPerformanceCard key={data.user_plan_status_id} performanceData={data} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- Tab 3: Detailed View (Logbook) --- */}
          <TabsContent value="detailed" className="mt-6">
            <LogbookView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ... (All sub-components like PlanPerformanceCard, StatBox, EmptyState, etc., remain exactly the same)

// --- Sub-components for the Page ---

const PlanPerformanceCard: React.FC<{ performanceData: UserPlanPerformanceData }> = ({ performanceData }) => {
  const { plan_details, performance_summary, user_status_on_plan } = performanceData;
  const { total_sessions_in_plan, logged_sessions_count, total_volume_kg } = performance_summary;

  const completionPercentage = total_sessions_in_plan > 0
    ? Math.round((logged_sessions_count / total_sessions_in_plan) * 100)
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div>
          <Badge variant={user_status_on_plan === 'active' ? 'default' : 'secondary'} className="capitalize mb-2">
            {user_status_on_plan}
          </Badge>
          <CardTitle>{plan_details.title}</CardTitle>
          <CardDescription className="line-clamp-2">{plan_details.description}</CardDescription>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Adherence</p>
                <p className="text-2xl font-bold">{completionPercentage}%</p>
            </div>
            <Button asChild>
                <Link to={'/profile/performance/$planId'} params={{ planId: plan_details.id }} className="flex items-center gap-2">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatBox label="Workouts Logged" value={`${logged_sessions_count} / ${total_sessions_in_plan}`} icon={CheckCircle} />
            <StatBox label="Total Volume" value={`${total_volume_kg?.toLocaleString() || 0} kg`} icon={Dumbbell} />
            <StatBox label="First Workout" value={performance_summary.first_workout_date ? new Date(performance_summary.first_workout_date).toLocaleDateString() : 'N/A'} icon={Calendar} />
            <StatBox label="Last Workout" value={performance_summary.last_workout_date ? new Date(performance_summary.last_workout_date).toLocaleDateString() : 'N/A'} icon={Calendar} />
        </div>
      </CardContent>
    </Card>
  );
};

const StatBox: React.FC<{ label: string; value: string; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="p-4 bg-muted/50 rounded-lg">
        <Icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
);

const EmptyState = () => (
    <Card className="p-12 text-center text-muted-foreground border-2 border-dashed">
        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Performance Data Yet</h3>
        <p>Once you start and complete workouts from a plan, your performance summary will appear here.</p>
        <Button asChild className="mt-4"><Link to="/explore/plans">Explore Plans</Link></Button>
    </Card>
);

const ErrorScreen = ({ message }: { message: string }) => (
    <Card className="p-12 text-center text-destructive-foreground bg-destructive border-destructive">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Could Not Load Performance Data</h3>
        <p>{message}</p>
    </Card>
);

const PerformancePageSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
                <CardHeader className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);