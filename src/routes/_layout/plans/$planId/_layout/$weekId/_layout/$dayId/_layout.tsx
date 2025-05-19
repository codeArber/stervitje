import React, { useState } from 'react'; // Import useState
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, PlusCircle, Coffee, Trash2, Edit, Timer } from 'lucide-react'; // Added icons
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion"; // For collapsing sessions
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Import helper components
// Import types
import { usePlanDetails } from '@/api/plans/plan';
import { useDeleteExercise } from '@/api/exercises';
import { PlanExerciseSet, PlanSessionExercise } from '@/types/planTypes';
import { useCreatePlanSession, useDeletePlanSession } from '@/api/plans/plan_session';
import { useDeletePlanSessionExercise } from '@/api/plans/exercise_entry';
import { useCreatePlanSet, useDeletePlanSet } from '@/api/plans/session_set';
import { CreateSessionForm } from '@/components/CreateSession';
import { AddExerciseToSessionForm } from '@/components/AddExerciseToSession';
import { AddEditSetForm } from '@/components/AddEditSet';
import { PlanSessionExerciseItem } from '@/components/PlanSessionExercise';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/store/useTeamStore';
import { useActiveMemberInTeam, useMemberInTeam } from '@/api/teams';

export const Route = createFileRoute(
  '/_layout/plans/$planId/_layout/$weekId/_layout/$dayId/_layout',
)({
  component: DayDetailsPage,
})


// --- Main Page Component ---
function DayDetailsPage() {
  const { planId, weekId, dayId } = Route.useParams();
  const { data: planData, isLoading, isError, error } = usePlanDetails(planId);

  // --- States for Dialogs ---
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [addExerciseSessionId, setAddExerciseSessionId] = useState<string | null>(null); // Track which session to add exercise to
  // TODO: Add states for editing session, editing exercise entry, adding/editing sets

  // --- Mutation Hooks ---
  const createSessionMutation = useCreatePlanSession();
  const deleteSessionMutation = useDeletePlanSession();
  const deleteExerciseEntryMutation = useDeletePlanSessionExercise();
  const deleteSetMutation = useDeletePlanSet();
  const addSet = useCreatePlanSet()

  const weekMatch = Route.useMatch({
    to: '/_layout/plans/$planId/_layout/$weekId/_layout/$dayId/_layout/$sessionId',
    params: { planId: planId },
  });
  const sessionId = weekMatch?.params.sessionId;
  // TODO: Add hooks for create/update set, update session, update exercise entry

  // --- Find current data ---
  const week = !isLoading && !isError && planData?.plan_weeks?.find(w => w.id === weekId);
  const day = !isLoading && !isError && week?.plan_days?.find(d => d.id === dayId);
  const currentSessions = day?.plan_sessions || [];

  // --- Loading / Error / Not Found Checks (as before) ---
  if (isLoading) return <div className="container py-6">Loading...</div>;
  if (isError) return <div className="container py-6"><Alert variant="destructive">Error: {error?.message}</Alert></div>;
  if (!planData || !week || !day) return <div className="container py-6 text-center"><p>Not Found</p><Link to={`/plans/${planId}`}><Button>Back</Button></Link></div>;

  // --- Event Handlers ---
  const handleAddExerciseClick = (sessionId: string) => {
    setAddExerciseSessionId(sessionId);
    // Note: The Dialog open state might need manual management if trigger is inside map
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm("Delete this entire session and all its exercises?")) {
      deleteSessionMutation.mutate({ sessionId, planId });
    }
  };

  const handleDeleteExerciseEntry = (exerciseEntryId: string) => {
    if (window.confirm("Delete this exercise block and all its sets?")) {
      deleteExerciseEntryMutation.mutate({ exerciseEntryId, planId });
    }
  };

  const handleAddSet = (exerciseEntryId: string) => {
    // addSet.mutate({
    //   plan_session_exercise_id: exerciseEntryId,
    //   set_number: 0,
    //   planId: planId,

    // })
    // TODO: Open Add/Edit Set Dialog, pre-fill exerciseEntryId
    // Calculate next set number
  };
  const handleEditSet = (set: PlanExerciseSet) => {
    console.log("Edit set clicked:", set);
    // TODO: Open Add/Edit Set Dialog in edit mode, pre-fill with set data
  };
  const handleDeleteSet = (setId: string) => {
    if (window.confirm("Delete this set?")) {
      deleteSetMutation.mutate({ setId, planId });
    }
  };

  const handleEditExerciseEntry = (entry: PlanSessionExercise) => {
    console.log("Edit entry clicked:", entry);
    // TODO: Open Edit Entry Dialog (maybe a separate simpler form)
  };


  // --- Calculations ---
  const nextSessionOrderIndex = currentSessions.length + 1;
  const { selectedTeamId } = useTeamStore()
  const thisUser = useActiveMemberInTeam(selectedTeamId);


  // --- Render Page ---
  return (
    <div className="w-full py-2 space-y-2">


      <Separator />

      {/* Sessions Section Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Planned Sessions</h2>
        {/* Add Session Button + Dialog */}
        {thisUser?.role === 'coach' &&
          <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={day.is_rest_day}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Session to Day {day.day_number}</DialogTitle>
              </DialogHeader>
              <CreateSessionForm
                planId={planId}
                dayId={dayId}
                nextOrderIndex={nextSessionOrderIndex}
                onSuccess={() => setIsAddSessionDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

        {currentSessions.map((session) => (
          <Link key={session.id} to='/plans/$planId/$weekId/$dayId/$sessionId' params={{ planId: planId, weekId: weekId, dayId: dayId, sessionId: session.id }} className="w-full">
            <Card className={cn("overflow-hidden", session.id === sessionId ? "border-2  border-blue-300" : "border")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/50 p-2">
                <CardTitle className="text-lg font-medium">
                  {session.title || `Session ${session.order_index}`}
                </CardTitle>
              </CardHeader>
              {/* <CardContent className="p-4 pt-2"> */}
              {/* sda */}
              {/* </CardContent> */}
            </Card>
          </Link>

        ))}
      </div>


      <Separator className="my-8" />
      <Outlet />
    </div>
  );
}