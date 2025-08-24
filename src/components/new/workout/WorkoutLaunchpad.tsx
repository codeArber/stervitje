// FILE: src/components/new/workout/WorkoutLaunchpad.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, CalendarClock, PlusCircle, Sparkles } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workout-store';

// Extend dayjs with plugins
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

// --- 1. DUMMY DATA (Replace with your actual data from the store) ---
const dummyUpcomingSession = {
  id: 'session_123',
  title: 'Push Day - Phase 2',
  date: dayjs().add(1, 'day').toISOString(), // Set to tomorrow for demonstration
  exercises: [
    { name: 'Bench Press' },
    { name: 'Incline Dumbbell Press' },
    { name: 'Skull Crushers' },
    { name: 'Lateral Raises' },
  ],
};

// --- 2. THE SUB-COMPONENTS ---

/**
 * @description Displays the user's next scheduled workout.
 */
const UpcomingWorkoutCard = ({ session, onStart }) => {
  const getRelativeDate = (date) => {
    if (dayjs(date).isToday()) return "Today's Workout";
    if (dayjs(date).isTomorrow()) return "Tomorrow's Session";
    return `Next up: ${dayjs(date).format('dddd, MMM D')}`;
  };

  return (
    <Card className="border-primary border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          Upcoming Workout
        </CardTitle>
        <CardDescription>{getRelativeDate(session.date)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="text-xl font-semibold">{session.title}</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          {session.exercises.slice(0, 3).map((ex, index) => (
            <li key={index}>{ex.name}</li>
          ))}
          {session.exercises.length > 3 && <li>...and more</li>}
        </ul>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={() => onStart(session.id)}>
          <Dumbbell className="mr-2 h-5 w-5" />
          Start Planned Workout
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * @description Provides the option to start a blank, unplanned workout.
 */
const AdHocWorkoutCard = () => {
  const { startAdHocSession } = useWorkoutStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Freestyle Session
        </CardTitle>
        <CardDescription>
          Don't have a plan for today? Log your exercises as you go.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" onClick={startAdHocSession}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Start Ad-Hoc Workout
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * @description A prompt for users without a plan to go find one.
 */
const FindPlanPrompt = () => (
  <Card className="text-center bg-muted/50">
    <CardHeader>
      <CardTitle>Looking for a structured plan?</CardTitle>
      <CardDescription>
        Following a plan is the best way to guarantee progress and stay consistent.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild>
        <Link to="/explore/plans">Browse Workout Plans</Link>
      </Button>
    </CardContent>
  </Card>
);


// --- 3. THE MAIN "LAUNCHPAD" COMPONENT ---
// This will replace your old NoActiveWorkoutScreen

interface WorkoutLaunchpadProps {
  upcomingSession: typeof dummyUpcomingSession | null;
  hasActivePlan: boolean;
  onStartPlannedSession: (sessionId: string) => void;
  onStartAdHocSession: () => void;
}

export function WorkoutLaunchpad({
  upcomingSession,
  hasActivePlan,
  onStartPlannedSession,
  onStartAdHocSession,
}: WorkoutLaunchpadProps) {
  return (
    <div className="container mx-auto max-w-2xl py-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Workout</h1>
        <p className="text-lg text-muted-foreground mt-1">
          {hasActivePlan
            ? "Your next session is ready. Let's get to it."
            : "Start a workout or find a new plan to follow."}
        </p>
      </header>

      {/* If there's an upcoming session, it's the main focus */}
      {upcomingSession && (
        <UpcomingWorkoutCard session={upcomingSession} onStart={onStartPlannedSession} />
      )}

      {/* The AdHoc card is always available as an alternative */}
      <AdHocWorkoutCard />

      {/* If they have no plan, add a clear prompt to find one */}
      {!hasActivePlan && (
        <FindPlanPrompt />
      )}
    </div>
  );
}