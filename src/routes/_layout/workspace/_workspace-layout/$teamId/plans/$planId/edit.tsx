// FILE: src/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { toast } from 'sonner';

// --- NEW STATE MANAGEMENT IMPORTS ---
import { PlanEditorProvider, usePlanEditor, usePlanEditorLoading, usePlanEditorOriginalPlan, usePlanEditorPlan } from '@/stores/editor/PlanEditorProvider';

// --- Standard UI Components & Icons ---
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';

// --- API Hooks & Skeletons ---
import { usePlanDetailsQuery, useSavePlanHierarchyMutation } from '@/api/plan';
import { useEffect, useRef } from 'react';
import { PlanEditorBasicDetailsForm } from '@/components/new/plan/plan-edit/PlanEditorBasicDetailsForm';
import { PlanEditPageSkeleton } from '@/components/new/plan/plan-edit/PlanEditorSkeleton';
import { PlanEditor } from '@/components/new/plan/plan-edit/PlanEditor';

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
  const { loadPlan, clearPlan } = usePlanEditor();
  const plan = usePlanEditorPlan();
  const isStoreLoading = usePlanEditorLoading();
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
          <Button onClick={handleSaveChanges} disabled={!plan.can_edit || isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </header>
      <Separator />

      <PlanEditorBasicDetailsForm />

      <Separator />

      <PlanEditor />
    </div>
  );
}