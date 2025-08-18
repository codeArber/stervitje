// FILE: src/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { toast } from 'sonner';

// --- NEW STATE MANAGEMENT IMPORTS ---
import { PlanEditorProvider, usePlanEditor, usePlanEditorLoading, usePlanEditorOriginalPlan, usePlanEditorPlan } from '@/stores/editor/PlanEditorProvider';

// --- NEW REUSABLE EDITOR COMPONENTS ---
// We will create PlanEditorBasicDetailsForm in a moment
// import { PlanEditorBasicDetailsForm } from '@/ui/plan/edit/PlanEditorBasicDetailsForm'; 

// --- Standard UI Components & Icons ---
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ArrowLeft, PlusCircle, Save } from 'lucide-react';

// --- API Hooks & Skeletons ---
import { usePlanDetailsQuery, useSavePlanChangesMutation, useSavePlanHierarchyMutation } from '@/api/plan';
import { useEffect, useRef } from 'react';
import { WeekEditor } from '@/components/new/plan/plan-edit/WeekEditor';
import { PlanEditorBasicDetailsForm } from '@/components/new/plan/plan-edit/PlanEditorBasicDetailsForm';
import { PlanWeek } from '@/types/plan';
import { PlanEditPageSkeleton } from '@/components/new/plan/plan-edit/PlanEditorSkeleton';

// --- Main Route Component ---
// Wraps the actual page component with our state Provider.
export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit')({
  component: () => (
    <PlanEditorProvider>
      <PlanEditPage />
    </PlanEditorProvider>
  ),
});


function PlanEditPage() {
 const { teamId, planId } = Route.useParams();

  // Step 1: Fetch initial data
  const { data: planDetails, isLoading: isLoadingApi, isError, error } = usePlanDetailsQuery(planId);

  // Step 2: Use hooks correctly at the top level
  const { loadPlan, clearPlan, addWeek } = usePlanEditor();
  const plan = usePlanEditorPlan();
  const isStoreLoading = usePlanEditorLoading();
  const originalPlan = usePlanEditorOriginalPlan(); // <-- We already have this!
  const currentPlan = usePlanEditorPlan(); // <-- We already have this!  
  const { mutate: saveHierarchy, isPending: isSaving } = useSavePlanHierarchyMutation();
  const hasLoaded = useRef(false);

  // Step 3: Load data into the store ONLY ONCE
  useEffect(() => {
    if (planDetails && !hasLoaded.current) {
      loadPlan(planDetails);
      hasLoaded.current = true;
    }
    return () => {
      clearPlan();
      hasLoaded.current = false;
    };
  }, [planDetails, loadPlan, clearPlan]);

  // --- Fixed handleAddWeek function (with corrected type for newWeek) ---
  const handleAddWeek = () => {
    if (!plan) return;
    let currentMaxWeekNumber;
    if(plan.hierarchy.weeks)
    {
        currentMaxWeekNumber = plan.hierarchy.weeks.length > 0
        ? Math.max(...plan.hierarchy.weeks.map(w => w.week_number))
        : 0;
    }else{
      currentMaxWeekNumber = 0;
    }
    const nextWeekNumber = currentMaxWeekNumber + 1;

    // To satisfy the PlanWeek type for our optimistic update
    const newWeek: PlanWeek = {
      id: `temp-week-${Math.random()}`,
      plan_id: planId,
      week_number: nextWeekNumber,
      description: null,
      days: [],
    };

    addWeek(newWeek);
    toast.info(`Optimistically added Week ${nextWeekNumber}.`);
  };


  const handleSaveChanges = () => {
    if (!plan) {
      toast.error("Cannot save, no plan is loaded.");
      return;
    }

    const toastId = toast.loading("Saving your plan...");
    
    // The payload is now just the plan ID and the current hierarchy from the store.
    saveHierarchy({
      planId: plan.plan.id,
      hierarchy: plan.hierarchy,
    }, {
      onSuccess: () => {
        toast.success("Plan saved successfully!", { id: toastId });
        // The mutation hook's onSuccess already handles invalidating the query,
        // which will cause the store to reload with the fresh, correct data.
      },
      onError: (err) => {
        toast.error(`Save failed: ${err.message}`, { id: toastId });
      }
    });
  };

  // --- Render Logic ---
  if (isLoadingApi || isStoreLoading || !plan) {
    return <PlanEditPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 text-destructive text-center">
        Error loading plan for editing: {error?.message || "Plan not found."}
      </div>
    );
  }

  // We can now safely access plan and its properties
  const { weeks } = plan.hierarchy;

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Edit Plan</h1>
          <p className="text-lg text-muted-foreground">{plan.plan.title}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/workspace/$teamId/plans/$planId" params={{ teamId, planId }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Link>
          </Button>
          <Button onClick={handleSaveChanges} disabled={!plan.can_edit}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </header>
      <Separator />

      <PlanEditorBasicDetailsForm />

      <Separator />

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Plan Structure</h2>
          <Button onClick={handleAddWeek} disabled={!plan.can_edit}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Week
          </Button>
        </div>

        {weeks && 
        <>
         {weeks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No weeks added yet.</h3>
            <p>Click "Add Week" to start building your plan's structure.</p>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {weeks.map((week, weekIndex) => (
              <WeekEditor
                key={week.id}
                weekIndex={weekIndex}
                canEdit={plan.can_edit}
              />
            ))}
          </Accordion>
        )}
        </>
        }
       
      </section>
    </div>
  );
}