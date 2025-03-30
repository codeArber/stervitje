// src/components/PlansDashboard.tsx (Existing File)
import React, { useState } from 'react'; // Import useState
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Clock,
  Users,
  UserCircle,
  PlusCircle // Import icon for create button
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
// Remove useUserContext if not used elsewhere here
import type { Plan } from '@/types/type'; // Import your Plan type
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // Import if needed for form actions outside the form component
  DialogClose // Import if needed for manual close button
} from "@/components/ui/dialog";
import { CreatePlanForm } from './CreatePlanForm';
import { useUserCreatedPlans } from '@/api/plans/plan';

// --- TrainingPlanCard Component (Keep as is or refine) ---
// (Make sure it uses the Plan type from planTypes.ts)
const TrainingPlanCard = ({ plan }: { plan: Plan }) => {
  // Mock calculations - replace with actual data if available on Plan object
  const difficultyMap: { [key: number]: string } = { 1: 'Beginner', 2: 'Easy', 3: 'Intermediate', 4: 'Hard', 5: 'Advanced' };
  const difficultyText = plan.difficulty_level ? difficultyMap[plan.difficulty_level] : 'N/A';
  // const progressPercentage = 0; // Need actual progress data if displayed
  // const sessionCompletionPercentage = 0; // Need actual progress data if displayed

  return (
    <Card className="w-full flex flex-col"> {/* Ensure cards fill height */}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
          {/* Use visibility if available */}
          {plan.visibility && (
             <Badge variant={plan.visibility === 'public' ? 'secondary' : 'outline'} className="capitalize flex-shrink-0">
                {plan.visibility}
             </Badge>
          )}
        </div>
        <CardDescription>
          {plan.description ? `${plan.description.substring(0, 80)}...` : 'No description'} | {difficultyText}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow"> {/* Allow content to grow */}
        <div className="grid grid-cols-2 gap-2">
          {plan.duration_weeks && (
             <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                   {plan.duration_weeks} Weeks
                </span>
             </div>
          )}
           {/* Add other relevant info like sport, fork count etc. */}
           {plan.fork_count !== undefined && (
               <div className="flex items-center space-x-2">
                   <Users className="w-4 h-4 text-muted-foreground" />
                   <span className="text-sm">{plan.fork_count} Forks</span>
               </div>
           )}
        </div>
         {/* Display creator info if needed - requires joining profile data */}
         {/* <div className="flex items-center space-x-2 pt-2 border-t mt-2">
             <UserCircle className="w-4 h-4 text-muted-foreground" />
             <span className="text-sm text-muted-foreground">Created by...</span>
         </div> */}
      </CardContent>

      <CardFooter>
        {/* Ensure Link path is correct */}
        <Link to='/plans/$planId' params={{ planId: plan.id }} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// --- Skeleton Card ---
const PlanCardSkeleton = () => (
    <Card className="w-full flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
             <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
            <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-9 w-full" />
        </CardFooter>
    </Card>
);


// --- Main Dashboard Component ---
const TrainingPlansDashboard = () => {
  const { data: plans, isLoading, isError, error } = useUserCreatedPlans(); // Use hook results
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // State for dialog

  return (
    <div className="p-6 space-y-6"> {/* Increased spacing */}
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">My Training Plans</h1>
         {/* Dialog Trigger Button */}
         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
               <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]"> {/* Adjust width */}
               <DialogHeader>
                  <DialogTitle>Create New Training Plan</DialogTitle>
                  <DialogDescription>
                     Fill in the details below to create your new plan. You can add specific workouts later.
                  </DialogDescription>
               </DialogHeader>
               {/* Render the form inside */}
               <div className="py-4">
                  <CreatePlanForm onSuccess={() => setIsCreateDialogOpen(false)} />
               </div>
               {/* Optional: Footer with explicit close button if needed */}
               {/* <DialogFooter>
                   <DialogClose asChild>
                       <Button type="button" variant="secondary">Cancel</Button>
                   </DialogClose>
               </DialogFooter> */}
            </DialogContent>
         </Dialog>
      </div>

      {/* Display Plans or Loading/Error States */}
      {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)}
         </div>
      )}
      {isError && (
         <div className="text-red-600">Error loading plans: {error?.message}</div>
      )}
      {!isLoading && !isError && plans && (
         plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {plans.map(plan => (
                  <TrainingPlanCard key={plan.id} plan={plan} />
               ))}
            </div>
         ) : (
            <div className="text-center py-10 text-muted-foreground">
               You haven't created any training plans yet.
               <Button variant="link" className="ml-1" onClick={() => setIsCreateDialogOpen(true)}>Create one now!</Button>
            </div>
         )
      )}

    </div>
  );
};

export default TrainingPlansDashboard;