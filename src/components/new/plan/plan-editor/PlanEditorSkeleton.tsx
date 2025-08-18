// FILE: src/components/plan-editor/PlanEditorSkeletons.tsx

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export const PlanEditPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <header className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>

      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-1/2" />

      <Separator />

      <h2 className="text-2xl font-bold mb-4"><Skeleton className="h-8 w-40" /></h2>
      <Skeleton className="h-10 w-32 mb-4" /> {/* Add Week button skeleton */}

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" /> {/* Add Day button skeleton */}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Card key={j} className="border-l-4 border-primary/20">
                    <CardHeader className="flex justify-between items-center">
                      <Skeleton className="h-6 w-1/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-24" /> {/* Add Session button skeleton */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// You can add more specific skeletons here if needed, e.g., for DayEditor, SessionEditor etc.