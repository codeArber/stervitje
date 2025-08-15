import { MarqueeDemo } from '@/components/MarqueExample';
import { useSession } from '@supabase/auth-helpers-react';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
    component: TodaysWorkoutWidget,
})

function TodaysWorkoutWidget() {
    const user = useSession()?.user; // Get the current session and any errors


    // Display the scheduled workout(s)
    return (
        <div className="p-4 border rounded shadow-sm">
          <h3 className="font-semibold mb-2">Today's Workout</h3>
          <p className="text-sm text-muted-foreground">No workout scheduled for today. Enjoy your rest!</p>
          <MarqueeDemo />
        </div>
    );
};