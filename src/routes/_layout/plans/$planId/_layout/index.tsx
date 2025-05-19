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
import { ArrowLeft, AlertCircle, PlusCircle, CalendarDays, Users, GitFork, Heart, Eye, Target } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlanWeek } from '@/types/planTypes';
import { usePlanDetails } from '@/api/plans/plan';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlanDetailSummaryCard, PlanOverviewWithWeeks, PlanSummaryCard } from '@/components/PlanSummaryCard';

export const Route = createFileRoute('/_layout/plans/$planId/_layout/')({
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
  console.log(planData)

  // --- Render Plan Details ---
  return (
    <div className="py-6 w-full items-center flex flex-col">
      Select a week to view or edit its details.
      <pre className="text-left p-4 rounded w-full overflow-auto">
         <PlanOverviewWithWeeks plan={planData}/>
      </pre>
    </div>
  );
}
export default PlanDetailsPage
