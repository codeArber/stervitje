// FILE: src/components/plan-display/PlanDisplay.tsx

import React from 'react';
import type { FullPlan, PlanDay, PlanWeek } from '@/types/plan';

// --- Child Component ---
import { SessionDisplay } from './SessionDisplay';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
        <p>Go to the edit page to build the workout schedule.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hierarchy.weeks
        .sort((a, b) => a.week_number - b.week_number)
        .map(week => (
          <WeekDisplay key={week.id} week={week} isPlanStarted={isPlanStarted} />
        ))}
    </div>
  );
};


// --- Sub-components for organizing the display ---

const WeekDisplay: React.FC<{ week: PlanWeek, isPlanStarted: boolean }> = ({ week, isPlanStarted }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Week {week.week_number}</CardTitle>
        {week.description && (
          <CardDescription>{week.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent >
        {week.days && week.days.map((day) => (
          <DayDisplay key={day.id} day={day} isPlanStarted={isPlanStarted} />
        ))}
      </CardContent>
    </Card>
  );
};

const DayDisplay: React.FC<{ day: PlanDay, isPlanStarted: boolean }> = ({ day, isPlanStarted }) => {
  return (
        <div className="flex items-center gap-3 flex flex-col">
          <Calendar className="h-4 w-4" />
          <span>Day {day.day_number}: {day.title || 'Workout'}</span>
          {day.is_rest_day && (
            <span className="text-xs font-normal text-muted-foreground">(Rest Day)</span>
          )}
     {day.is_rest_day ? (
          <p className="text-muted-foreground italic">This is a scheduled rest day. Time to recover!</p>
        ) : (
          (day.sessions && day.sessions.length > 0) ? (
            day.sessions
              .sort((a, b) => a.order_index - b.order_index)
              .map(session => (
                <SessionDisplay
                  key={session.id}
                  session={session}
                  isPlanStarted={isPlanStarted}
                />
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No sessions defined for this day.</p>
          )
        )}
        </div>
  );
};