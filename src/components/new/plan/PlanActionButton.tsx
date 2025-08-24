// FILE: src/components/new/plan/PlanActionButton.tsx

import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react'; // Added Loader2 for loading state
import { toast } from 'sonner';

// --- API Hooks and Types ---
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { usePlanDetailsQuery, useStartPlanForUserMutation, useStartPlanWithBaselinesMutation } from '@/api/plan';
import { useAuthStore } from '@/stores/auth-store'; // Assuming you use an auth store for user ID
import { usePlanGoalsQuery } from '@/api/plan/usePlanGoals'; // To fetch plan goals to check for baselines

interface PlanActionButtonProps {
  planId: string;
}

export const PlanActionButton: React.FC<PlanActionButtonProps> = ({ planId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Get current user (for checking authentication)

  // 1. Get overall dashboard summary (to know if ANY plan is active)
  const { data: dashboardSummary, isLoading: isLoadingDashboard } = useDashboardSummaryQuery();
  const userHasAnyActivePlan = !!dashboardSummary?.active_plan_details;
  const currentActivePlanId = dashboardSummary?.active_plan_details?.plan.id;

  // 2. Get details for *this specific plan* (to know its status for the current user)
  const { data: fullPlan, isLoading: isLoadingPlanDetails } = usePlanDetailsQuery(planId);
  const thisPlanUserStatus = fullPlan?.user_plan_status?.status; // 'active', 'completed', 'abandoned', or undefined/null
  const isThisPlanActiveForUser = thisPlanUserStatus === 'active';
  const isThisPlanCompletedForUser = thisPlanUserStatus === 'completed';

  // 3. Check if this plan has goals requiring baselines
  const { data: planGoals, isLoading: isLoadingGoals } = usePlanGoalsQuery(planId, {
    enabled: !!planId && !isThisPlanActiveForUser && !isThisPlanCompletedForUser, // Only fetch goals if plan isn't active/completed
  });
  const goalsRequiringBaselines = planGoals?.filter(goal => goal.target_type === 'percent_change' || goal.target_type === 'absolute_change');
  const planNeedsBaselines = goalsRequiringBaselines && goalsRequiringBaselines.length > 0;

  // 4. Mutation hooks for starting plans
  const startPlanMutation = useStartPlanForUserMutation();
  const startPlanWithBaselinesMutation = useStartPlanWithBaselinesMutation();

  const isLoading = isLoadingDashboard || isLoadingPlanDetails || isLoadingGoals || startPlanMutation.isPending || startPlanWithBaselinesMutation.isPending;

  // Render logic
  if (!user) {
    // If not authenticated, prompt to log in or register
    return (
      <Button asChild>
        <Link to="/login">Login to Start Plan</Link>
      </Button>
    );
  }

  // If this plan is already active for the user, or some other plan is active
  if (isThisPlanActiveForUser || (userHasAnyActivePlan && currentActivePlanId === planId)) {
    return (
      <Button asChild disabled={isLoading}>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    );
  }

  // If this plan is completed, maybe offer to restart or go to history
  if (isThisPlanCompletedForUser) {
    return (
      <Button onClick={() => toast.info("Feature to restart completed plan coming soon!")} disabled={isLoading}>
        Restart Plan
      </Button>
    );
  }

  // If the user has *some other* active plan, but not this one
  if (userHasAnyActivePlan && currentActivePlanId !== planId) {
    return (
      <Button
        onClick={() => toast.warning("You already have an active plan. Complete or abandon it before starting a new one.")}
        disabled={isLoading}
      >
        Start Plan (Another Active)
      </Button>
    );
  }

  // --- Start Plan Logic (no other active plans, and this plan isn't active/completed) ---

  const handleStartPlan = async () => {
    if (!planId) return;

    try {
      if (planNeedsBaselines) {
        // Redirect to a baseline collection page/dialog
        // You'll need a route like `/plans/${planId}/baselines`
        navigate({ to: `/explore/plans/${planId}/baselines` });
      } else {
        // Start plan directly if no baselines are needed
        await startPlanMutation.mutateAsync(planId);
        toast.success("Plan started successfully!");
        navigate({ to: '/dashboard' }); // Navigate to dashboard after starting
      }
    } catch (error: any) {
      toast.error(`Failed to start plan: ${error.message}`);
      console.error('Error starting plan:', error);
    }
  };

  return (
    <Button onClick={handleStartPlan} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      Start Plan
    </Button>
  );
};