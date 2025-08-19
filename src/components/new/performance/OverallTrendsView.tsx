// FILE: src/components/performance/OverallTrendsView.tsx

import React from 'react';
// --- THIS IS THE KEY IMPORT ---
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useAuthStore } from '@/stores/auth-store';
import { useUserWorkoutDatesQuery, useUserPlanPerformanceListQuery } from '@/api/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Dumbbell, CheckCircle } from 'lucide-react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export const OverallTrendsView: React.FC = () => {
    const { user } = useAuthStore();

    const { data: dateData, isLoading: isLoadingDates } = useUserWorkoutDatesQuery(user?.id);
    const { data: summaryData, isLoading: isLoadingSummary } = useUserPlanPerformanceListQuery(user?.id);

    if (isLoadingDates || isLoadingSummary) {
        return <OverallTrendsSkeleton />;
    }

    const totalWorkouts = summaryData?.reduce((sum, item) => sum + item.performance_summary.logged_sessions_count, 0) || 0;
    const totalVolume = summaryData?.reduce((sum, item) => sum + item.performance_summary.total_volume_kg, 0) || 0;
    const totalPlansCompleted = summaryData?.filter(item => item.user_status_on_plan === 'completed').length || 0;

    // This part doesn't need to change. The `values` array shape is correct.
    const heatmapValues = dateData?.map(d => ({
        date: new Date(d.workout_date),
        count: 1,
    })) || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Workouts Logged" value={totalWorkouts.toLocaleString()} icon={TrendingUp} />
                <StatCard title="Lifetime Volume (kg)" value={totalVolume.toLocaleString()} icon={Dumbbell} />
                <StatCard title="Plans Completed" value={totalPlansCompleted.toLocaleString()} icon={CheckCircle} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workout Consistency</CardTitle>
                </CardHeader>
                <CardContent className="heatmap-container">
                    <CalendarHeatmap
                        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                        endDate={new Date()}
                        values={heatmapValues}
                        classForValue={(value) => {
                            if (!value || !value.count) {
                                return 'color-empty';
                            }
                            const count = Math.min(value.count, 4);
                            return `color-scale-${count}`;
                        }}
                        tooltipDataAttrs={(value: ReactCalendarHeatmapValue<Date> | undefined) => {
                            if (!value || !value.date || !value.count) {
                                return {
                                    'data-tip': 'No activity on this day',
                                };
                            }
                            const workoutLabel = value.count === 1 ? 'workout' : 'workouts';
                            return {
                                'data-tip': `${value.count} ${workoutLabel} on ${value.date.toLocaleDateString()}`,
                            };
                        }}

                    // And update your ReactTooltip component to:
                    // <ReactTooltip />
                    />
                    <ReactTooltip id="heatmap-tooltip" />
                    <style>{`
            .heatmap-container .color-empty { fill: hsl(var(--muted)); }
            .heatmap-container .color-scale-1 { fill: hsl(var(--primary) / 0.4); }
            .heatmap-container .color-scale-2 { fill: hsl(var(--primary) / 0.6); }
            .heatmap-container .color-scale-3 { fill: hsl(var(--primary) / 0.8); }
            .heatmap-container .color-scale-4 { fill: hsl(var(--primary)); }
          `}</style>
                </CardContent>
            </Card>
        </div>
    );
};

// ... (StatCard and Skeleton components remain the same)
const StatCard: React.FC<{ title: string, value: string, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const OverallTrendsSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
    </div>
);