import { createFileRoute, Link, Outlet, useLocation, useParams } from '@tanstack/react-router'
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
import { useEffect, useState } from 'react';
import { CreateWeekForm } from '@/components/CreateWeek';
import { PlanWeek } from '@/types/type';
import { usePlanDetails } from '@/api/plans/plan';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/store/useTeamStore';
import { useActiveMemberInTeam, useMemberInTeam } from '@/api/teams';

export const Route = createFileRoute('/_layout/plans/$planId/_layout')({
  component: PlanDetailsPage,

});

function PlanDetailsPage() {
  const { planId } = Route.useParams();
  const [isAddWeekDialogOpen, setIsAddWeekDialogOpen] = useState(false);

  const selectedTeamId = useTeamStore(state => state.selectedTeamId);

  const weekMatch = Route.useMatch({
    to: '/_layout/plans/$planId/_layout/$weekId/_layout',
    params: { planId: planId },
  });
  const weekId = weekMatch?.params.weekId;



  const location = useLocation();
  const hasMoreThanOneSlashes = (location.pathname.match(/\//g) || []).length > 2;
  console.log("Current location:", location);

  const { data: planData, isLoading, isError, error } = usePlanDetails(planId); // Get loading/error state too


  // --- Calculate next week number ---
  const currentWeeks = planData?.plan_weeks || [];
  const nextWeekNumber = currentWeeks.length + 1;
  const thisUser = useActiveMemberInTeam(selectedTeamId);

  // State for the "Add Week" dialog

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



  // --- Render Plan Details ---
  return (
    <div className={cn(" w-full")}>
      {/* Breadcrumbs */}
      {/* <div className="mb-6">
      
      </div> */}
      <div className='flex flex-row '>
        <div className=' bg-sidebar flex items-center shadow px-4 py-6 z-10 w-full justify-between h-18'>
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
                <BreadcrumbPage>{planData.title || 'Plan Details'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {/* <TeamDropdown /> */}
        </div>
      </div>

      <div className="flex flex-col p-4 ">

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Plan Weeks</h2>
          {/* Add Week Button + Dialog */}
          {(thisUser?.role === 'coach' || !selectedTeamId ) &&
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
          }
        </div>

        {/* Weeks List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {currentWeeks.length > 0 ? (
            currentWeeks.map((week: PlanWeek) => (
              <Link to='/plans/$planId/$weekId' params={{ planId: planId, weekId: week.id }} className="hover:underline">

                <Card key={week.id} className={cn("overflow-hidden", weekId === week.id ? "border-2 border-blue-300" : "border")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/50 p-2">
                    <CardTitle className="text-lg font-medium">
                      {/* Link the week title */}
                      Week {week.week_number}

                    </CardTitle>
                    <div>
                      {/* Placeholders for Edit/Delete Week buttons */}
                      <Button variant="ghost" size="icon" className="h-7 w-7 mr-1" title="Edit Week (coming soon)" disabled><AlertCircle className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>

                </Card>
              </Link>
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

        <Separator className="my-3" />

        <Outlet />
      </div>
    </div>
  );
}

