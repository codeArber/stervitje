// FILE: src/components/plan-display/PlanDisplay.tsx

import React from 'react';
import type { FullPlan, PlanDay, PlanWeek } from '@/types/plan';

// --- Child Component ---
import { SessionDisplay } from './SessionDisplay';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removed Accordion components as per instructions
import { Calendar } from 'lucide-react';

interface PlanDisplayProps {
  // Pass the entire rich plan object
  planDetails: FullPlan;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ planDetails }) => {
  const { hierarchy, user_plan_status } = planDetails;
  const isPlanStarted = !!user_plan_status;

  if (!hierarchy || !hierarchy.weeks || hierarchy.weeks.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold">This plan is empty.</h3>
        <p className="text-sm mt-2">Go to the edit page to build the workout schedule.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hierarchy.weeks
        .sort((a, b) => a.week_number - b.week_number)
        .map(week => (
          <WeekDisplay key={week.id} week={week} isPlanStarted={isPlanStarted} planId={planDetails.plan.id} />
        ))}
    </div>
  );
};


// --- Sub-components for organizing the display ---

const WeekDisplay: React.FC<{ week: PlanWeek, isPlanStarted: boolean, planId: string }> = ({ week, isPlanStarted, planId }) => {
  return (
    <Card className="rounded-md shadow-sm border-l-4 border-primary/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-lg font-semibold leading-tight">Week {week.week_number}</CardTitle>
        {week.description && (
          <CardDescription className="text-sm text-muted-foreground leading-snug">{week.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {week.days && week.days.length > 0 ? (
          week.days.sort((a,b) => a.day_number - b.day_number).map((day, index) => (
            <React.Fragment key={day.id}>
              <DayDisplay day={day} isPlanStarted={isPlanStarted} planId={planId} />
              {index < week.days.length - 1 && (
                <div className="border-t border-border mx-4 my-2" />
              )}
            </React.Fragment>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4 px-4">
            No days defined for this week.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const DayDisplay: React.FC<{ day: PlanDay, isPlanStarted: boolean, planId: string }> = ({ day, isPlanStarted, planId }) => {
  return (
    <div className="w-full">
      <div className="py-0.5 space-y-3 ">
        {day.is_rest_day ? (
          <div className="rounded px-2 py-1 bg-muted my-2">
            <p className="text-sm text-muted-foreground italic">This is a scheduled rest day. Time to recover!</p>
          </div>
        ) : (
          (day.sessions && day.sessions.length > 0) ? (
            day.sessions
              .sort((a, b) => a.order_index - b.order_index)
              .map(session => (
                <SessionDisplay
                  key={session.id}
                  planId={planId}
                  session={session}
                  isPlanStarted={isPlanStarted}
                />
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No sessions defined for this day.</p>
          )
        )}
      </div>
    </div>
  );
};