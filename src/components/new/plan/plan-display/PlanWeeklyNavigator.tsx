// FILE: src/components/plan-display/PlanWeeklyNavigator.tsx

import React, { useState } from 'react';
import type { FullPlan, PlanWeek } from '@/types/plan';

// --- Reusable Child Component ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { DayDisplay } from './PlanDisplay'; // Make sure DayDisplay is exported
import WeekIndicator from './WeekIndicator';
import DayLevelWeekIndicator from './WeekIndicator';

// This WeekDisplay can be refactored into its own file later for better organization.
const WeekDisplay: React.FC<{ week: PlanWeek, isPlanStarted: boolean, planId: string, planDetails: FullPlan }> = ({ week, isPlanStarted, planId, planDetails }) => {
  // Find the first day to default the accordion to open, if days exist
  const firstDayId = (week.days ?? []).slice().sort((a, b) => a.day_number - b.day_number)[0]?.id;
  const { hierarchy, user_plan_status } = planDetails;
  const weeks = hierarchy?.weeks ?? [];
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  // Memoize activeWeek to prevent re-calculating on every render
  const activeWeek = React.useMemo(() => weeks[activeWeekIndex], [weeks, activeWeekIndex]);
  // Calculate week day data for the indicator
  const { currentDay, weekDayData } = React.useMemo(() => {
    if (!activeWeek) {
      return { currentDay: 1, weekDayData: [] };
    }

    // Transform the week's days into the format needed by the indicator
    const weekDayData = activeWeek.days.map(day => ({
      day_number: day.day_number,
      is_rest_day: day.is_rest_day,
      has_sessions: day.sessions && day.sessions.length > 0
    }));

    // For now, just show day 1 as current (you can modify this logic)
    // You could calculate this based on plan start date, current date, etc.
    const currentDay = 1;

    return {
      currentDay,
      weekDayData
    };
  }, [activeWeek]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week {week.week_number}</CardTitle>
        {week.description && (
          <CardDescription>{week.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className='gap-0'>

        {(week.days && week.days.length > 0) ? (
          <Accordion  type="single" collapsible className="w-full" defaultValue={firstDayId ? `day-${firstDayId}` : undefined}>
            {week.days
              .slice().sort((a, b) => a.day_number - b.day_number)
              .map(day => (
                <div className='flex flex-col items-start justify-start py-3.5'>
                  <div className="flex">
                    <DayLevelWeekIndicator
                      currentDay={day.day_number}
                      weekDays={weekDayData}
                      weekNumber={activeWeek.week_number}
                      size="sm"
                      showLabels={false}
                      className="w-full"
                    />
                  </div>
                  <DayDisplay key={day.id} day={day} isPlanStarted={isPlanStarted} planId={planId} />
                </div>
              ))}
          </Accordion>
        ) : (
          <p className="text-sm text-muted-foreground">No days defined for this week.</p>
        )}
      </CardContent>
    </Card>
  );
};


interface PlanWeeklyNavigatorProps {
  planDetails: FullPlan;
}

export const PlanWeeklyNavigator: React.FC<PlanWeeklyNavigatorProps> = ({ planDetails }) => {
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  console.log(planDetails)
  const { hierarchy, user_plan_status } = planDetails;
  const weeks = hierarchy?.weeks ?? [];
  const isPlanStarted = !!user_plan_status;

  // Memoize activeWeek to prevent re-calculating on every render
  const activeWeek = React.useMemo(() => weeks[activeWeekIndex], [weeks, activeWeekIndex]);

  if (weeks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          This plan has no weekly structure defined.
        </CardContent>
      </Card>
    );
  }

  // Calculate week day data for the indicator
  const { currentDay, weekDayData } = React.useMemo(() => {
    if (!activeWeek) {
      return { currentDay: 1, weekDayData: [] };
    }

    // Transform the week's days into the format needed by the indicator
    const weekDayData = activeWeek.days.map(day => ({
      day_number: day.day_number,
      is_rest_day: day.is_rest_day,
      has_sessions: day.sessions && day.sessions.length > 0
    }));

    // For now, just show day 1 as current (you can modify this logic)
    // You could calculate this based on plan start date, current date, etc.
    const currentDay = 1;

    return {
      currentDay,
      weekDayData
    };
  }, [activeWeek]);

  return (
    // The main container is now just for the scrolling content.
    <div className="space-y-4">

      {/* --- The Active Week Display --- */}
      {/* We add a key to the outer div to ensure React's diffing algorithm correctly
          re-renders the component and its children (like the Accordion) when the week changes. */}


      <div key={activeWeek?.id} className="animate-in fade-in duration-300">
        {activeWeek && (
          <WeekDisplay
            week={activeWeek}
            isPlanStarted={isPlanStarted}
            planId={planDetails.plan.id}
            planDetails={planDetails}
          />
        )}
      </div>

      {/* --- The FIXED Week Map Navigator --- */}
      {/* It is now outside the main flow of the component. */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border shadow-lg rounded-lg flex flex-col">
        {weeks
          .sort((a, b) => a.week_number - b.week_number)
          .map((week, index) => (
            <button
              key={week.id}
              onClick={() => setActiveWeekIndex(index)}
              className={`
                w-16 h-10 text-center font-semibold text-sm rounded-md transition-all duration-200
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                ${activeWeekIndex === index
                  ? 'bg-primary text-primary-foreground shadow-inner'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              title={`Go to Week ${week.week_number}`}
            >
              W{week.week_number}
            </button>
          ))}
      </div>
    </div>
  );
};