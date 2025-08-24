// FILE: src/routes/_layout/explore/plans/$planId/baselines/index.tsx

import React, { useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// --- UI Components ---
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- API Hooks and Types ---
import { usePlanGoalsQuery } from '@/api/plan/usePlanGoals';
import type { PlanGoal } from '@/types/plan/planGoals';
import { usePlanDetailsQuery, useStartPlanWithBaselinesMutation } from '@/api/plan/usePlan';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase/supabaseClient';
import { UserBaseline } from '@/types/plan';
import { getExerciseImageUrl } from '@/types/storage';

export const Route = createFileRoute('/_layout/explore/plans/$planId/baselines')(
  {
    beforeLoad: async ({ context }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw redirect({ to: '/login' });
      }
      return { userId: user.id };
    },
    component: PlanBaselinesPage,
  },
)

type BaselinesFormData = Record<string, number>;

function PlanBaselinesPage() {
  const { planId } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();

  const { data: fullPlan, isLoading: isLoadingPlanDetails, isError: isErrorPlanDetails, error: planDetailsError } = usePlanDetailsQuery(planId);
  const { data: planGoals, isLoading: isLoadingGoals, isError: isErrorGoals, error: goalsError } = usePlanGoalsQuery(planId, {
    enabled: !!planId && !!userId,
  });

  // Memoize goals requiring baselines to prevent unnecessary recalculations
  const goalsRequiringBaselines = useMemo(() => {
    return planGoals?.filter(
      goal => goal.target_type === 'percent_change' || goal.target_type === 'absolute_change'
    ) || [];
  }, [planGoals]);

  // Memoize the form schema to prevent recreation on every render
  const formSchema = useMemo(() => {
    if (goalsRequiringBaselines.length === 0) {
      return z.object({});
    }
    
    const schemaFields: Record<string, z.ZodNumber> = {};
    goalsRequiringBaselines.forEach(goal => {
      schemaFields[goal.id] = z.number({
        required_error: `Baseline for "${goal.title}" is required`
      }).min(0, `"${goal.title}" value must be positive`);
    });
    return z.object(schemaFields);
  }, [goalsRequiringBaselines]);

  // Memoize default values
  const defaultValues = useMemo(() => {
    const values: BaselinesFormData = {};
    goalsRequiringBaselines.forEach(goal => {
      values[goal.id] = 0;
    });
    return values;
  }, [goalsRequiringBaselines]);

  const form = useForm<BaselinesFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when goals change, but use stable dependencies
  useEffect(() => {
    if (goalsRequiringBaselines.length > 0) {
      form.reset(defaultValues);
    }
  }, [goalsRequiringBaselines.length, defaultValues, form]);

  const startPlanWithBaselinesMutation = useStartPlanWithBaselinesMutation();

  const onSubmit = async (values: BaselinesFormData) => {
    if (!planId) {
      toast.error("Plan ID is missing.");
      return;
    }

    const baselines: UserBaseline[] = Object.entries(values).map(([goalId, baselineValue]) => ({
      goal_id: goalId,
      baseline_value: baselineValue,
    }));

    try {
      await startPlanWithBaselinesMutation.mutateAsync({ planId, baselines });
      toast.success("Baselines saved! Plan started.");
      navigate({ to: `/dashboard` });
    } catch (error: any) {
      toast.error(`Failed to start plan with baselines: ${error.message}`);
      console.error("Baseline submission error:", error);
    }
  };

  const isLoading = isLoadingPlanDetails || isLoadingGoals || startPlanWithBaselinesMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading plan goals...</span>
      </div>
    );
  }

  if (isErrorPlanDetails || isErrorGoals) {
    return (
      <div className="p-4">
        <Breadcrumb currentPath={location.pathname} />
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load plan or its goals: {planDetailsError?.message || goalsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!fullPlan) {
    return (
      <div className="p-4">
        <Breadcrumb currentPath={location.pathname} />
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Plan Not Found</AlertTitle>
          <AlertDescription>
            The plan with ID "{planId}" could not be found or you do not have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check plan status and redirect if needed
  if (fullPlan.user_plan_status?.status === 'active') {
    toast.info("You already have this plan active. Redirecting to dashboard.");
    navigate({ to: `/dashboard` });
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Redirecting...</span>
      </div>
    );
  }

  if (fullPlan.user_plan_status?.status === 'completed') {
    toast.info("You have already completed this plan. Redirecting to dashboard.");
    navigate({ to: `/dashboard` });
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Redirecting...</span>
      </div>
    );
  }

  // If no baselines required, start plan directly
  if (goalsRequiringBaselines.length === 0) {
    if (!startPlanWithBaselinesMutation.isPending) {
      toast.info("No baselines required for this plan. Starting plan directly.");
      startPlanWithBaselinesMutation.mutate({ planId, baselines: [] });
      navigate({ to: `/dashboard` });
    }
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Starting plan...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Breadcrumb currentPath={location.pathname} />

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Set Baselines for "{fullPlan.plan.title}"</CardTitle>
          <CardDescription>
            Before starting this plan, please provide your current values for the following goals.
            These will be used to track your progress.
          </CardDescription>
          {fullPlan.plan.description && (
            <p className="text-sm text-muted-foreground mt-2">{fullPlan.plan.description}</p>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Exercise</TableHead>
                    <TableHead className="w-[150px]">Goal</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Your Baseline Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalsRequiringBaselines.map((goal) => (
                    <FormField
                      key={goal.id}
                      control={form.control}
                      name={goal.id}
                      render={({ field }) => (
                        <TableRow>
                          <TableCell className="w-[80px]">
                            {goal.exercise_details?.image_url && (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={getExerciseImageUrl(goal.exercise_details.image_url)} alt={goal.exercise_details.name || 'Exercise image'} />
                                <AvatarFallback>{goal.exercise_details.name?.substring(0,2).toUpperCase() || 'EX'}</AvatarFallback>
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {goal.title}
                            {goal.exercise_details?.name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ({goal.exercise_details.name})
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{goal.metric.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="text-right w-[150px]">
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 100"
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                      field.onChange(0);
                                    } else {
                                      const numValue = parseFloat(value);
                                      if (!isNaN(numValue)) {
                                        field.onChange(numValue);
                                      }
                                    }
                                  }}
                                  onBlur={field.onBlur}
                                  className={form.formState.errors[field.name] ? 'border-destructive' : ''}
                                />
                              </FormControl>
                              {form.formState.errors[field.name] && (
                                <FormMessage className="text-xs text-destructive text-right">
                                  {form.formState.errors[field.name]?.message?.toString()}
                                </FormMessage>
                              )}
                            </FormItem>
                          </TableCell>
                        </TableRow>
                      )}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                {startPlanWithBaselinesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Plan with Baselines
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}