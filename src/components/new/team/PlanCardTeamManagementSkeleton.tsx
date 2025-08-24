// FILE: src/components/team/PlanCardTeamManagementSkeleton.tsx

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export const PlanCardTeamManagementSkeleton = React.memo(function PlanCardTeamManagementSkeleton() {
  return (
    <Card className="h-full flex flex-col animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" /> {/* Creator Avatar */}
          <div className="space-y-1 flex-grow">
            <Skeleton className="h-5 w-40" /> {/* Creator Name */}
            <Skeleton className="h-4 w-24" /> {/* Created By */}
          </div>
          <Skeleton className="h-6 w-20" /> {/* Private/Public Badge */}
        </div>
        <Skeleton className="h-8 w-3/4 mb-2" /> {/* Plan Title */}
        <Skeleton className="h-4 w-full" /> {/* Description/Goal 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Description/Goal 2 */}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0 flex flex-col">
        <Skeleton className="h-6 w-20" /> {/* Difficulty Badge */}
        <Skeleton className="h-4 w-1/2" /> {/* Total Exercises */}
        
        <div className="space-y-1"> {/* Primary Muscles Label */}
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        
        <div className="space-y-1"> {/* Secondary Muscles Label */}
          <Skeleton className="h-3 w-32" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-18 rounded-full" />
          </div>
        </div>

        <div className="space-y-2 mt-3"> {/* Plan Focus (Tags) */}
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        
        {/* Muscle Diagram Placeholder */}
        <div className="flex justify-center items-center mt-auto p-2">
          <Skeleton className="h-24 w-full max-w-[200px] rounded-lg" />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 border-t flex flex-col items-start gap-3">
        <div className="flex justify-between w-full">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator className="w-full" />
        <div className="flex justify-between w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between w-full">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardFooter>
    </Card>
  );
});