import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle, PlusCircle, CalendarDays, Users } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { CreateWeekForm } from '@/components/CreateWeek';
import { PlanWeek } from '@/types/type';
import { usePlanDetails } from '@/api/plans/plan';

export const Route = createFileRoute('/_layout/plans/$planId/')({
  component: PlanDetailsPage,
})
function PlanDetailsPage() {
  const { planId } = Route.useParams();
  const { data: planData, isLoading, isError, error } = usePlanDetails(planId); // Get loading/error state too

  // State for the "Add Week" dialog
  const [isAddWeekDialogOpen, setIsAddWeekDialogOpen] = useState(false);

  // --- Handle Loading State ---
  if (isLoading) {
     // Render a loading skeleton (ensure PlanLoadingSkeleton is defined)
     // return <PlanLoadingSkeleton />;
     return (
         <div className="container py-6 text-center">Loading plan details...</div>
     );
  }

  // --- Handle Error State ---
   if (isError) {
     // Render an error message (ensure PlanErrorComponent is defined or handle inline)
     // return <PlanErrorComponent error={error} />;
      return (
         <div className="container py-6">
            <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading Plan</AlertTitle>
               <AlertDescription>
                  {error?.message || "An unexpected error occurred."}
               </AlertDescription>
            </Alert>
            <Link to="/plans" className="mt-4 inline-block">
               <Button variant="outline" size="sm">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans List
               </Button>
            </Link>
         </div>
      );
   }

  // --- Handle Not Found State ---
  if (!planData) {
     return (
        <div className="container py-6 text-center">
           <p>Plan not found.</p>
            <Link to="/plans" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans List
                </Button>
            </Link>
        </div>
     );
  }

  // --- Calculate next week number ---
  const currentWeeks = planData.plan_weeks || [];
  const nextWeekNumber = currentWeeks.length + 1;

  // --- Render Plan Details ---
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
              <Link to="/plans" className="transition-colors hover:text-foreground">Training Plans</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{planData.title || 'Plan Details'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Plan Header Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{planData.title}</CardTitle>
          {planData.description && <CardDescription>{planData.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
           {planData.difficulty_level && (
               <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4"/> Difficulty: {planData.difficulty_level}</span>
           )}
           {planData.duration_weeks && (
                <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Duration: {planData.duration_weeks} weeks</span>
           )}
           {planData.visibility && (
                <span className="flex items-center gap-1 capitalize"><Users className="h-4 w-4"/> Visibility: {planData.visibility}</span>
           )}
        </CardContent>
      </Card>


      {/* Weeks Section */}
      <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Plan Weeks</h2>
          {/* Add Week Button + Dialog */}
          <Dialog open={isAddWeekDialogOpen} onOpenChange={setIsAddWeekDialogOpen}>
            <DialogTrigger asChild>
               <Button size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Week
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Add New Week</DialogTitle>
                  <DialogDescription>
                    Adding Week {nextWeekNumber} to "{planData.title}". Add an optional description.
                  </DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  <CreateWeekForm
                    planId={planId}
                    nextWeekNumber={nextWeekNumber}
                    onSuccess={() => setIsAddWeekDialogOpen(false)} // Close dialog on success
                   />
               </div>
            </DialogContent>
         </Dialog>
      </div>

      {/* Weeks List */}
      <div className="space-y-4">
        {currentWeeks.length > 0 ? (
          currentWeeks.map((week: PlanWeek) => (
            <Card key={week.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 p-4">
                <CardTitle className="text-lg font-medium">
                  {/* Link the week title */}
                  <Link to='/plans/$planId/$weekId' params={{ planId: planId, weekId: week.id }} className="hover:underline">
                     Week {week.week_number}
                  </Link>
                </CardTitle>
                <div>
                     {/* Placeholders for Edit/Delete Week buttons */}
                     <Button variant="ghost" size="icon" className="h-7 w-7 mr-1" title="Edit Week (coming soon)" disabled><AlertCircle className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Delete Week (coming soon)" disabled><AlertCircle className="h-4 w-4"/></Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {week.description && (
                  <p className="text-sm text-muted-foreground mb-4">{week.description}</p>
                )}
                 {/* Placeholder for Day details */}
                 <div className="text-center text-xs text-gray-400 py-4 border border-dashed rounded-md">
                    [Days for Week {week.week_number} will go here]
                 </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-6 border border-dashed rounded-md">
            This plan doesn't have any weeks defined yet.
            {/* Use the same DialogTrigger as the button above for consistency */}
             <Dialog open={isAddWeekDialogOpen} onOpenChange={setIsAddWeekDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="mt-2 ml-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add First Week
                    </Button>
                </DialogTrigger>
                 {/* DialogContent is the same as above */}
                 <DialogContent className="sm:max-w-[425px]">
                    {/* ... same DialogHeader and CreateWeekForm ... */}
                     <DialogHeader>...</DialogHeader>
                     <div className="py-4">
                         <CreateWeekForm
                            planId={planId}
                            nextWeekNumber={nextWeekNumber}
                            onSuccess={() => setIsAddWeekDialogOpen(false)}
                         />
                     </div>
                 </DialogContent>
             </Dialog>
          </div>
        )}
      </div>

      <Separator className="my-8" />
    </div>
  );
}
export default PlanDetailsPage