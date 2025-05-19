import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle, PlusCircle,  BarChartIcon, CalendarIcon, DumbbellIcon, EyeIcon, GitForkIcon, CheckSquare, CalendarCheck, Coffee, ClipboardList, Dumbbell } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { PlanWeek, Plan } from '@/types/planTypes';
import { usePlanDetails } from '@/api/plans/plan';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/store/useTeamStore';
import { useActiveMemberInTeam } from '@/api/teams';
import { TeamDropdown } from '@/components/TeamDropdown';
import { formatDistanceToNow } from 'date-fns';
import { PlanInfoBadge } from '@/components/plan/PlanCard';

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
      <div className='flex flex-row w-full justify-between'>
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
          <TeamDropdown />
        </div>
      </div>

      <div className="flex flex-col p-4 ">
        <div className='flex flex-col gap-4 py-2'>
          <h2 className="text-xl font-semibold">Plan Info</h2>
          <div className='flex flex-row gap-4 w-full border border-blue-300 rounded-md p-2'>
            <PlanInfoSection plan={planData} />
          </div>
        </div>
        <div className="mb-4 flex justify-between items-center p-2">
          <h2 className="text-lg ">Weeks</h2>
          {/* Add Week Button + Dialog */}
          {(thisUser?.role === 'coach' || !selectedTeamId) &&
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
        <div className="flex flex-row gap-6">
          {currentWeeks.length > 0 ? (
            currentWeeks.map((week: PlanWeek) => {
              const numDaysWeek = week.plan_days?.length ?? 0;
              const workoutDaysWeek = week.plan_days?.filter(day => !day.is_rest_day)?.length ?? 0;
              const restDaysWeek = numDaysWeek - workoutDaysWeek;
              const numSessionsWeek = week.plan_days?.reduce((daySum, day) => daySum + (day.plan_sessions?.length ?? 0), 0) ?? 0;
              const numExercisesWeek = week.plan_days?.reduce((daySum, day) =>
                  daySum + (day.plan_sessions?.reduce((sessionSum, session) =>
                      sessionSum + (session.plan_session_exercises?.length ?? 0), 0) ?? 0), 0) ?? 0;
  
              return(
              <Link to='/plans/$planId/$weekId' params={{ planId: planId, weekId: week.id }} className="hover:underline">
                <Card key={week.id} className="w-full hover:shadow-md transition-shadow duration-150">
                    <CardHeader className="pb-2"> {/* Reduced padding */}
                        <CardTitle className="text-lg font-semibold">Week {week.week_number}</CardTitle>
                        {week.description && (
                            <CardDescription className="text-sm pt-1">
                                {week.description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <Separator className="my-2" />
                    <CardContent className="text-sm pt-3"> {/* Reduced padding */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="text-muted-foreground" size={16} />
                                <div><span className="font-medium">{numDaysWeek}</span> Day{numDaysWeek !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="text-green-600" size={16} />
                                <div><span className="font-medium">{workoutDaysWeek}</span> Workout</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Coffee className="text-blue-600" size={16} />
                                <div><span className="font-medium">{restDaysWeek}</span> Rest</div>
                            </div>
                             <div className="flex items-center gap-2">
                                <ClipboardList className="text-muted-foreground" size={16} />
                                <div><span className="font-medium">{numSessionsWeek}</span> Session{numSessionsWeek !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <Dumbbell className="text-muted-foreground" size={16} />
                                <div><span className="font-medium">{numExercisesWeek}</span> Exercise Entrie{numExercisesWeek !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </Link>
            )})
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




// Component to organize plan info badges
const PlanInfoSection = ({ plan }: { plan: Plan }) => {
  // Format the date
  const formattedDate = plan.created_at
    ? formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })
    : '';

  return (
    <Link className="flex flex-row gap-4 w-full h-full p-4" to={'/plans/$planId'} params={{ planId: plan.id }}>
      <PlanInfoBadge
        icon={BarChartIcon}
        label="Difficulty"
        value={plan.difficulty_level}
      />
      <PlanInfoBadge
        icon={DumbbellIcon}
        label="Sport"
        value={plan.sport}
      />
      <PlanInfoBadge
        icon={EyeIcon}
        label="Visibility"
        value={plan.visibility}
      />
      <PlanInfoBadge
        icon={GitForkIcon}
        label="Public Forking"
        value={plan.allow_public_forking}
      />
      <PlanInfoBadge
        icon={GitForkIcon}
        label="Form Count"
        value={plan.fork_count}
      />
      {plan.forked_from && (
        <PlanInfoBadge
          icon={GitForkIcon}
          label="Forked From"
          value={plan.forked_from}
        />
      )}
      <PlanInfoBadge
        icon={CalendarIcon}
        label="Created"
        value={formattedDate}
        className="col-span-2"
      />
    </Link>
  );
};
