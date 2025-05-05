import { useGetTodaysPlanSummary } from '@/api/schedule'
import { MarqueeDemo } from '@/components/MarqueExample';
import WorkoutDayDetailsView from '@/components/WorkoutTodayDetails';
import { useSession } from '@supabase/auth-helpers-react';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
    component: TodaysWorkoutWidget,
})

function TodaysWorkoutWidget() {
    const user = useSession()?.user; // Get the current session and any errors

    const { data: todaysSummaries, isLoading, isError, error } = useGetTodaysPlanSummary(user?.id || '');

    // Handle loading state specifically for this query
    if (isLoading) {
        return <div className="p-4 border rounded shadow-sm animate-pulse">Loading today's schedule...</div>;
    }

    // Handle error state
    if (isError) {
        return <div className="p-4 border rounded shadow-sm text-red-600">Error loading schedule: {error.message}</div>;
    }

    // Handle case where user is logged out (query disabled) or no workout scheduled
    if (!todaysSummaries || todaysSummaries.length === 0) {
        return (
            <div className="p-4 border rounded shadow-sm">
                <h3 className="font-semibold mb-2">Today's Workout</h3>
                <p className="text-sm text-muted-foreground">No workout scheduled for today. Enjoy your rest!</p>
                <MarqueeDemo />

            </div>
        );
    }

    // Display the scheduled workout(s)
    return (
        <div className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold mb-2">Today's Workout{todaysSummaries.length > 1 ? 's' : ''}</h3>
            <ul className="space-y-2">
                {todaysSummaries.map(summary => (
                    <li key={summary.plan_day_id}>
                        <Link
                            // Example link - adjust path to your workout detail page
                            to='/$sessionId' params={{ sessionId: summary.plan_day_id }}
                            className="text-blue-600 hover:underline"
                        >
                            {summary.day_title || `Workout Day ${summary.day_number}`}
                        </Link>
                        <span className="text-sm text-muted-foreground ml-2">
                            (from: {summary.plan_title}, W{summary.week_number} D{summary.day_number})
                        </span>
                    </li>
                ))}
            </ul>
            <div>

                {todaysSummaries.map((day) => {
                    return (
                        <div key={day.plan_id}>

                            <WorkoutDayDetailsView planId={day.plan_day_id} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};