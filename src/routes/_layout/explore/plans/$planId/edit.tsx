// FILE: src/routes/_layout/plans/$planId/edit.tsx

import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  usePlanDetailsQuery,
  useDeleteSetMutation,
  useDeleteExerciseMutation,
  useDeleteSessionMutation,
  useAddSetMutation,
  useAddExerciseMutation,
  useAddSessionMutation
} from '@/api/plan';
import { useFilteredExercisesQuery } from '@/api/exercise';
import type { PlanDayInHierarchy, PlanHierarchy } from '@/types/plan';
import type { Exercise } from '@/types/index';
import { useDebounce } from '@/hooks/use-debounce';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Icons
import { ChevronDown, ChevronUp, X, Trash2, PlusCircle } from 'lucide-react';
import { AddSetDialog } from '@/components/new/AddSetDialog';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/plans/$planId/edit')({
  component: PlanEditorPage,
});


// --- The Main Page Component ---
function PlanEditorPage() {
  const { planId } = Route.useParams();
  const { data: planDetails, isLoading, isError } = usePlanDetailsQuery(planId);

  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const allWeekIds = useMemo(() => planDetails?.hierarchy.weeks?.map(w => `week-${w.id}`) || [], [planDetails]);
  const allDayIds = useMemo(() => planDetails?.hierarchy.weeks?.flatMap(w => w.days?.map(d => d.id)).filter(Boolean) || [], [planDetails]);

  const handleExpandAll = () => {
    setOpenWeeks(allWeekIds);
    setExpandedDays(allDayIds as string[]);
  };

  const handleCollapseAll = () => {
    setOpenWeeks([]);
    setExpandedDays([]);
  };

  if (isLoading) return <PlanEditorSkeleton />;
  if (isError || !planDetails) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Plan Not Found</h1>
        <p className="text-destructive">Could not load the details for this plan to edit.</p>
      </div>
    );
  }

  const { plan, hierarchy } = planDetails;

  return (
    <div className="container max-w-4xl py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/explore/plans">Plans</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{plan.title} (Editor)</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <main className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{plan.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Plan Editor</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExpandAll}>Expand All</Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll}>Collapse All</Button>
          </div>
        </div>
        <PlanHierarchyEditor
          hierarchy={hierarchy}
          openWeeks={openWeeks}
          setOpenWeeks={setOpenWeeks}
          expandedDays={expandedDays}
          setExpandedDays={setExpandedDays}
        />
      </main>
    </div>
  );
}


// --- Sub-components ---

const PlanHierarchyEditor = ({ hierarchy, openWeeks, setOpenWeeks, expandedDays, setExpandedDays }: {
  hierarchy: PlanHierarchy;
  openWeeks: string[];
  setOpenWeeks: (value: string[]) => void;
  expandedDays: string[];
  setExpandedDays: (value: string[]) => void;
}) => {
  return (
    <Accordion type="multiple" value={openWeeks} onValueChange={setOpenWeeks} className="w-full space-y-4">
      {hierarchy.weeks?.map((week) => (
        <AccordionItem key={week.id} value={`week-${week.id}`} className="border rounded-lg">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-xl font-semibold">Week {week.week_number}</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {week.days?.map(day => (
                  <Badge key={day.id} variant={day.is_rest_day ? "outline" : "default"}>
                    {day.title || `Day ${day.day_number}`}
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0 border-t">
            <div className="space-y-4">
              {week.days?.map(day => (
                <DayCard
                  key={day.id}
                  day={day}
                  isExpanded={expandedDays.includes(day.id)}
                  onToggleExpand={() => {
                    setExpandedDays(
                      expandedDays.includes(day.id)
                        ? expandedDays.filter(id => id !== day.id)
                        : [...expandedDays, day.id]
                    );
                  }}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const DayCard = ({ day, isExpanded, onToggleExpand }: {
  day: PlanDayInHierarchy;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { planId } = Route.useParams();

  const { mutate: deleteSet, isPending: isDeletingSet } = useDeleteSetMutation();
  const { mutate: deleteExercise, isPending: isDeletingExercise } = useDeleteExerciseMutation();
  const { mutate: deleteSession, isPending: isDeletingSession } = useDeleteSessionMutation();
  const { mutate: addSet } = useAddSetMutation();
  const { mutate: addSession } = useAddSessionMutation();

  const handleDeleteSet = (setId: string) => deleteSet({ planId, setId });
  const handleDeleteExercise = (id: string) => deleteExercise({ planId, planSessionExerciseId: id });
  const handleDeleteSession = (id: string) => deleteSession({ planId, sessionId: id });

  const handleAddSession = () => {
    addSession({ planId, plan_day_id: day.id, title: `New Session`, order_index: (day.sessions?.length || 0) + 1 });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>{day.title || `Day ${day.day_number}`}</CardTitle>
          {day.is_rest_day && <CardDescription className="italic">Rest Day</CardDescription>}
        </div>
        {!day.is_rest_day && (
          <Button variant="ghost" size="sm" onClick={onToggleExpand}>
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        )}
      </CardHeader>

      {isExpanded && !day.is_rest_day && (
        <CardContent>
          <div className="space-y-6">
            {day.sessions?.map(session => (
              <div key={session.id} className="group relative pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-md flex-grow">{session.title}</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 absolute top-0 right-0"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Session?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{session.title}" and all its exercises.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSession(session.id)} disabled={isDeletingSession}>{isDeletingSession ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {session.exercises?.map(exercise => (
                    <div key={exercise.id} className="text-sm p-3 border rounded-md group/exercise relative">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover/exercise:opacity-100"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete Exercise?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{exercise.exercise_details.name}" and all sets.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)} disabled={isDeletingExercise}>{isDeletingExercise ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <span className="font-medium text-primary">{exercise.exercise_details.name}</span>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        {exercise.sets?.map(set => (
                          <li key={set.id} className="flex justify-between items-center group/set">
                            <span>Set {set.set_number}: {set.target_reps || 'N/A'} reps @ {set.target_weight || 'N/A'} kg</span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover/set:opacity-100"><X className="h-4 w-4" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete Set {set.set_number}.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSet(set.id)} disabled={isDeletingSet}>{isDeletingSet ? 'Continue' : 'Continue'}</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </li>
                        ))}
                      </ul>
                      <AddSetDialog
                        planId={planId}
                        planSessionExerciseId={exercise.id}
                        nextSetNumber={(exercise.sets?.length || 0) + 1}
                      />
                    </div>
                  ))}
                  <AddExerciseDialog planSessionId={session.id} planId={planId} nextOrderIndex={(session.exercises?.length || 0) + 1} />
                </div>
              </div>
            ))}
            <Button variant="secondary" className="w-full" onClick={handleAddSession}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Session to Day {day.day_number}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const AddExerciseDialog = ({ planSessionId, planId, nextOrderIndex }: { planSessionId: string; planId: string; nextOrderIndex: number; }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: exercises, isLoading } = useFilteredExercisesQuery({ searchTerm: debouncedSearchTerm, pageLimit: 5 });
  const { mutate: addExercise, isPending } = useAddExerciseMutation();
  const handleSelectExercise = (exerciseId: string) => {
    addExercise({ planId, plan_session_id: planSessionId, exercise_id: exerciseId, order_index: nextOrderIndex }, {
      onSuccess: () => { setOpen(false); setSearchTerm(''); },
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full h-full min-h-[120px]"><PlusCircle className="mr-2 h-4 w-4" />Add Exercise</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Exercise to Session</DialogTitle><DialogDescription>Search for an exercise to add it to this session.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Search exercises..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
            {exercises?.map((exercise: Exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                <span>{exercise.name}</span>
                <Button size="sm" onClick={() => handleSelectExercise(exercise.id)} disabled={isPending}>Add</Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PlanEditorSkeleton = () => (
  <div className="container max-w-4xl py-8">
    <Skeleton className="h-6 w-1/3 mb-6" />
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><Skeleton className="h-10 w-64" /><Skeleton className="h-6 w-32" /></div>
        <div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </main>
  </div>
);