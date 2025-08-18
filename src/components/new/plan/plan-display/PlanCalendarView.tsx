// FILE: src/components/plan-display/PlanCalendarView.tsx

import React from 'react';
import type { PlanHierarchy, PlanDay, PlanSession } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Dumbbell } from 'lucide-react';

interface PlanCalendarViewProps {
  hierarchy: PlanHierarchy | null;
}

export const PlanCalendarView: React.FC<PlanCalendarViewProps> = ({ hierarchy }) => {
  if (!hierarchy || !hierarchy.weeks || hierarchy.weeks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          This plan has no weekly structure defined.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hierarchy.weeks
        .sort((a, b) => a.week_number - b.week_number)
        .map(week => (
          <Card key={week.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>Week {week.week_number}</CardTitle>
              {week.description && (
                <CardDescription>{week.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-t border-l rounded-tl-lg overflow-hidden">
                {/* Create 7 day slots for the calendar grid */}
                {Array.from({ length: 7 }).map((_, i) => {
                  const dayNumber = i + 1;
                  const day = week.days?.find(d => d.day_number === dayNumber);
                  
                  return (
                    <DayCell key={dayNumber} dayNumber={dayNumber} dayData={day} />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};


// --- Sub-component for a single day in the calendar ---

const DayCell: React.FC<{ dayNumber: number; dayData?: PlanDay }> = ({ dayNumber, dayData }) => {
  const isWeekend = dayNumber === 6 || dayNumber === 7;

  return (
    <div className={`relative p-2 border-b border-r min-h-[120px] flex flex-col ${isWeekend ? 'bg-muted/50' : 'bg-background'}`}>
      <div className="text-xs font-semibold text-muted-foreground mb-2">
        Day {dayNumber}
      </div>
      
      <div className="flex-grow space-y-1.5">
        {dayData ? (
          dayData.is_rest_day ? (
            <Badge variant="secondary" className="flex items-center gap-1.5 w-full justify-center">
              <Bed className="h-3 w-3" />
              Rest Day
            </Badge>
          ) : (
            (dayData.sessions ?? []).map(session => (
              <div key={session.id} className="text-xs p-1.5 bg-primary/10 text-primary-foreground rounded-md flex items-start gap-1.5">
                 <Dumbbell className="h-3 w-3 mt-0.5 shrink-0" />
                 <span className="font-semibold">{session.title || 'Workout'}</span>
              </div>
            ))
          )
        ) : (
          // This is an empty day cell
          <div className="h-full w-full"></div>
        )}
      </div>
    </div>
  );
};