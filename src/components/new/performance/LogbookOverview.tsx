// FILE: src/components/performance/LogbookView.tsx

import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUserLogbookQuery } from '@/api/performance';
import type { LogbookEntry } from '@/api/performance/endpoint';
import { Link } from '@tanstack/react-router';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ArrowRight, Star } from 'lucide-react';

export const LogbookView: React.FC = () => {
  const { user } = useAuthStore();
  const { data: logbookEntries, isLoading } = useUserLogbookQuery(user?.id);

  if (isLoading) {
    return <LogbookSkeleton />;
  }

  if (!logbookEntries || logbookEntries.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-2 border-dashed">
        <BookOpen className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Your Logbook is Empty</h3>
        <p>Complete a workout to start building your training history.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Logbook</CardTitle>
        <CardDescription>A complete history of all your completed training sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {logbookEntries.map(entry => (
              <LogbookCard key={entry.log_id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// --- Sub-components for this view ---

const LogbookCard: React.FC<{ entry: LogbookEntry }> = ({ entry }) => {
  const workoutTitle = entry.session_title || entry.plan_title || 'Ad-hoc Workout';
  const workoutDate = new Date(entry.workout_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/profile/performance/log/${entry.log_id}`}>
      <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted transition-colors">
        <div className="flex-grow">
          <p className="font-semibold">{workoutTitle}</p>
          <p className="text-sm text-muted-foreground">{workoutDate}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            {entry.plan_title && <span>{entry.plan_title}</span>}
            {entry.duration_minutes && <span>{entry.duration_minutes} min</span>}
            {entry.overall_feeling && (
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{entry.overall_feeling} / 5 Feeling</span>
                </div>
            )}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
      </div>
    </Link>
  );
};

const LogbookSkeleton = () => (
    <Card className="animate-pulse">
        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
        <CardContent className="space-y-3 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </CardContent>
    </Card>
);