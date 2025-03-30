import React, { useState } from 'react'; // Import useState
import { createFileRoute, Link } from '@tanstack/react-router';
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
import type { PlanDay, PlanExercise } from '@/types/type'; // Adjust path
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

export const Route = createFileRoute('/_layout/plans/$planId/$weekId/$dayId/')({
  component: DayDetailsPage,
})

interface PlanSessionExerciseItemProps {
  exerciseEntry: PlanSessionExercise;
  planId: string;
  // Remove onAddSet, onEditSet - handle internally now
  // onAddSet: (exerciseEntryId: string) => void;
  // onEditSet: (set: PlanExerciseSet) => void;
  onDeleteSet: (setId: string) => void; // Keep delete handler
  onEditEntry: (entry: PlanSessionExercise) => void;
  onDeleteEntry: (entryId: string) => void;
  isDeletingEntry?: boolean;
  isDeletingSetId?: string | null;
}

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

 // --- Render Page ---
 return (
   <div className="container py-6 space-y-6">
    
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
              <Link to="/plans/$planId/$weekId" params={{ planId: planId, weekId }} className="transition-colors hover:text-foreground">
            Week {week.week_number }
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{day?.title ? <>{day?.title} (Day {day?.day_number})</> : <>Day {day?.day_number}</>}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

     {/* Day Header */}
     <Card className="mb-6">
       {/* ... Day Title, Description, Rest Day Badge ... */}
     </Card>

     {/* Sessions Section Header */}
     <div className="flex justify-between items-center">
       <h2 className="text-xl font-semibold">Planned Sessions</h2>
        {/* Add Session Button + Dialog */}
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
     </div>

     <Accordion type="multiple" className="w-full space-y-4">
         {currentSessions.map((session, index) => {
            const nextExerciseOrderIndex = (session.plan_session_exercises?.length || 0) + 1;
            return (
              <AccordionItem value={`session-${session.id}`} key={session.id} className="border rounded-md px-4 bg-card">
                <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                  <div className='flex justify-between items-center w-full pr-4'>
                    <span>{session.title || `Session ${session.order_index}`}</span>
                    {/* Delete Session Button */}
                    <Button
                       variant="ghost"
                       size="icon"
                       className="h-7 w-7 text-destructive hover:text-destructive"
                       onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id);}} // Stop propagation to prevent accordion toggle
                       disabled={deleteSessionMutation.isPending && deleteSessionMutation.variables?.sessionId === session.id}
                       title="Delete Session"
                     >
                       <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-3">
                   {session.notes && <p className="text-sm text-muted-foreground italic border-b pb-2 mb-3">{session.notes}</p>}

                   {/* Exercises within this session */}
                   <div className='space-y-3'>
                       {(session.plan_session_exercises || []).length > 0 ? (
                            session.plan_session_exercises?.map(exerciseEntry => (
                               <PlanSessionExerciseItem
                                   key={exerciseEntry.id}
                                   exerciseEntry={exerciseEntry}
                                   planId={planId}
                                  //  onAddSet={handleAddSet}
                                  //  onEditSet={handleEditSet}
                                   onDeleteSet={handleDeleteSet}
                                   onEditEntry={handleEditExerciseEntry}
                                   onDeleteEntry={handleDeleteExerciseEntry}
                                   isDeletingEntry={deleteExerciseEntryMutation.isPending && deleteExerciseEntryMutation.variables?.exerciseEntryId === exerciseEntry.id}
                                   isDeletingSetId={deleteSetMutation.isPending ? deleteSetMutation.variables?.setId : null}
                               />
                            ))
                       ) : (
                            <p className="text-sm text-center text-muted-foreground py-3">No exercises added to this session yet.</p>
                       )}
                   </div>

                   {/* Add Exercise Button for THIS session */}
                   <div className="flex justify-center pt-2">
                        <Dialog open={addExerciseSessionId === session.id} onOpenChange={(isOpen) => !isOpen && setAddExerciseSessionId(null)}>
                            <DialogTrigger asChild>
                               <Button variant="secondary" size="sm" onClick={() => handleAddExerciseClick(session.id)}>
                                   <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise to Session
                               </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                               <DialogHeader>
                                   <DialogTitle>Add Exercise to "{session.title || `Session ${session.order_index}`}"</DialogTitle>
                               </DialogHeader>
                               {/* Ensure AddExerciseToSessionForm exists and takes correct props */}
                               <AddExerciseToSessionForm
                                   planId={planId}
                                   sessionId={session.id}
                                   nextOrderIndex={nextExerciseOrderIndex}
                                   onSuccess={() => setAddExerciseSessionId(null)}
                               />
                            </DialogContent>
                        </Dialog>
                   </div>
                </AccordionContent>
              </AccordionItem>
            );
           })}
       </Accordion>

     <Separator className="my-8" />
   </div>
 );
}