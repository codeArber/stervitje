// FILE: src/components/exercise/ExerciseCardSkeleton.tsx

import React from 'react';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ExerciseCardSkeleton = React.memo(function ExerciseCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-48 w-full" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-2/4" />
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});