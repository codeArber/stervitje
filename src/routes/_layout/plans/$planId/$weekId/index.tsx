
import { usePlanDetails } from '@/api/plans/plan';
import { CreateDayForm } from '@/components/CreateDay';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlanDay } from '@/types/type';
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Coffee, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_layout/plans/$planId/$weekId/')({
  component: WeekDetailsPage,
})


// --- Main Page Component ---
function WeekDetailsPage() {
  const { planId, weekId } = Route.useParams();
  const { data: planData, isLoading, isError, error } = usePlanDetails(planId);

  // State for the "Add Day" dialog
  const [isAddDayDialogOpen, setIsAddDayDialogOpen] = useState(false);

  // Find the specific week data AFTER loading/error checks
  const week = !isLoading && !isError && planData
    ? planData.plan_weeks?.find((w) => w.id === weekId)
    : undefined;

  // --- Handle Loading ---
  if (isLoading) {
    // Render basic loading state or a more detailed skeleton
    return <div className="container py-6">Loading week details...</div>;
    // return <WeekLoadingSkeleton />;
  }

  // --- Handle Error ---
  if (isError) {
    // Render error state or delegate to route's errorComponent
    return (
       <div className="container py-6">
         <Alert variant="destructive">...</Alert>
         <Link to={`/plans/${planId}`}><Button>Back to Plan</Button></Link>
       </div>
     );
     // return <WeekErrorComponent error={error} />;
  }

  // --- Handle Plan or Week Not Found ---
  if (!planData || !week) {
     return (
        <div className="container py-6 text-center">
           <p>{!planData ? 'Plan not found.' : 'Week not found within this plan.'}</p>
            <Link to={planData ? `/plan/${planId}` : '/plan'} params={{planId: planData?.id}} className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </Link>
        </div>
     );
  }

  // --- Calculate next day number ---
  const currentDays = week.plan_days || [];
  const nextDayNumber = currentDays.length + 1;
  const canAddDay = nextDayNumber <= 7; // Check if week is full

  // --- Render Week Details ---
  return (
    <div className="container py-6">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to="/plans" className="transition-colors hover:text-foreground">Plans</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to="/plans/$planId" params={{ planId: planId }} className="transition-colors hover:text-foreground">
                {planData?.title || 'Plan'}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Week {week?.week_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Week Header */}
      <div className="mb-4 rounded-lg border bg-card text-card-foreground shadow-sm p-4">
         <h1 className="text-xl font-semibold leading-none tracking-tight">Week {week.week_number}</h1>
         {week.description && <p className="text-sm text-muted-foreground mt-1">{week.description}</p>}
      </div>

      {/* Days Section Header */}
      <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Days</h2>
          {/* Add Day Button + Dialog */}
          <Dialog open={isAddDayDialogOpen} onOpenChange={setIsAddDayDialogOpen}>
            <DialogTrigger asChild>
               <Button size="sm" variant="outline" disabled={!canAddDay} title={!canAddDay ? 'A week can only have 7 days' : 'Add a new day'}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Day
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Add New Day</DialogTitle>
                  <DialogDescription>
                     Adding Day {nextDayNumber} to Week {week.week_number}. Fill in the details below.
                  </DialogDescription>
               </DialogHeader>
            </DialogContent>
         </Dialog>
      </div>

      {/* Days List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentDays.length > 0 ? (
          currentDays.map((day: PlanDay) => (
            <Card key={day.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                   <CardTitle className="text-base font-medium">
                      {/* Link Day Title */}
                      <Link
                        to='/plans/$planId/$weekId/$dayId'
                        params={{ planId, weekId, dayId: day.id }}
                        className="hover:underline"
                       >
                        {day.title || `Day ${day.day_number}`}
                      </Link>
                   </CardTitle>
                    {day.is_rest_day && (
                        <Badge variant="outline" className="text-xs flex-shrink-0"><Coffee className="h-3 w-3 mr-1" /> Rest</Badge>
                    )}
                </div>
                 {/* Optionally show day number if title is missing */}
                 {!day.title && <CardDescription>Day {day.day_number}</CardDescription>}
                 {/* Show description if title is present */}
                 {day.title && day.description && <CardDescription className="text-xs pt-1 line-clamp-2">{day.description}</CardDescription>}

              </CardHeader>
              <CardContent className="flex-grow pt-2">
                 {/* Placeholder for Exercise list summary within the day card */}
                 <div className="text-center text-xs text-gray-400 py-4 border border-dashed rounded-md">
                    [Exercises for Day {day.day_number} will go here]
                 </div>
              </CardContent>
               <CardFooter className="p-3 pt-0">
                  {/* Link to view full day details */}
                  <Link
                    to='/plans/$planId/$weekId/$dayId'
                    params={{ planId, weekId, dayId: day.id }}
                    className="w-full"
                   >
                     <Button variant="outline" size="sm" className="w-full text-xs">View Day Details</Button>
                  </Link>
                  {/* Add Edit/Delete Day buttons later */}
               </CardFooter>
            </Card>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-6 border border-dashed rounded-md">
            This week doesn't have any days defined yet.
            {/* Add Day button for empty state */}
             <Dialog open={isAddDayDialogOpen} onOpenChange={setIsAddDayDialogOpen}>
                <DialogTrigger asChild>
                   <Button size="sm" variant="secondary" className="mt-2 ml-2" disabled={!canAddDay}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add First Day
                   </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    {/* ... same DialogHeader and CreateDayForm ... */}
                     <DialogHeader>...</DialogHeader>
                     <div className="py-4">
                     <CreateDayForm
                           planId={planId}
                           weekId={weekId}
                           nextDayNumber={nextDayNumber}
                           onSuccess={() => setIsAddDayDialogOpen(false)}
                        />
                     </div>
                 </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

    </div>
  );
}