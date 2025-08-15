// Example of a new component you could add to a profile page

import { useUserPlanHistoryQuery } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // A great library for formatting dates

export const PlanHistoryCard = ({ userId }: { userId: string }) => {
  const { data: history, isLoading } = useUserPlanHistoryQuery(userId);

  if (isLoading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history && history.length > 0 ? (
          history.map(plan => (
            <div key={plan.id} className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-start">
                  <p className="font-semibold">{plan.title}</p>
                  <Badge variant="outline">
                    {format(new Date(plan.last_logged_date), 'MMM yyyy')}
                  </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                First workout: {format(new Date(plan.first_logged_date), 'do MMM yyyy')}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No completed plan history found.
          </p>
        )}
      </CardContent>
    </Card>
  );
};