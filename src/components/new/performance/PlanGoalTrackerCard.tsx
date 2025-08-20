// FILE: src/components/performance/PlanGoalTrackerCard.tsx

import React, { useState } from 'react';
import { useSetGoalBaselineMutation } from '@/api/performance';
import type { UserPlanPerformanceData } from '@/api/performance/endpoint'; // Assuming you'll have this type from a future drill-down page
import type { PlanGoal } from '@/types/plan'; // Assuming this type
import { useAuthStore } from '@/stores/auth-store';

// --- UI Components ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, TrendingUp, Edit, Save } from 'lucide-react';

// This is a placeholder type for the user's progress on a single goal
// In the real page, you'd fetch this data.
interface GoalProgress extends PlanGoal {
    // These come from the user_plan_goal_progress table
    progress_id: string;
    start_value: number | null;
    current_value: number | null;
    target_value: number | null; // This is the personalized target
    status: 'in_progress' | 'achieved' | 'pending_baseline';
}

interface PlanGoalTrackerCardProps {
  goalProgress: GoalProgress;
}

export const PlanGoalTrackerCard: React.FC<PlanGoalTrackerCardProps> = ({ goalProgress }) => {
  const { user } = useAuthStore();
  const { mutate: setBaseline, isPending: isSavingBaseline } = useSetGoalBaselineMutation(user!.id);
  const [baselineInput, setBaselineInput] = useState('');

  const handleSaveBaseline = () => {
    const value = parseFloat(baselineInput);
    if (!isNaN(value)) {
      setBaseline({ progressId: goalProgress.progress_id, baselineValue: value });
    }
  };

  const getProgressPercentage = () => {
    if (goalProgress.status === 'achieved') return 100;
    if (goalProgress.start_value == null || goalProgress.target_value == null || goalProgress.current_value == null) return 0;
    
    const totalChange = goalProgress.target_value - goalProgress.start_value;
    if (totalChange === 0) return 100;

    const currentChange = goalProgress.current_value - goalProgress.start_value;
    return Math.max(0, Math.min(100, (currentChange / totalChange) * 100));
  };

  // --- RENDER LOGIC for 'pending_baseline' status ---
  if (goalProgress.status === 'pending_baseline') {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <HelpCircle className="h-5 w-5" /> {goalProgress.title}
          </CardTitle>
          <CardDescription>Enter your current baseline to activate this goal.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Your current ${goalProgress.metric.replace(/_/g, ' ')}...`}
            value={baselineInput}
            onChange={(e) => setBaselineInput(e.target.value)}
          />
          <Button onClick={handleSaveBaseline} disabled={isSavingBaseline}>
            <Save className="mr-2 h-4 w-4" />
            {isSavingBaseline ? 'Saving...' : 'Set Baseline'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- RENDER LOGIC for 'in_progress' or 'achieved' status ---
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    {goalProgress.status === 'achieved' 
                        ? <CheckCircle className="h-5 w-5 text-green-500" />
                        : <TrendingUp className="h-5 w-5 text-blue-500" />
                    }
                    {goalProgress.title}
                </CardTitle>
                <CardDescription>{goalProgress.description}</CardDescription>
            </div>
            {goalProgress.status === 'achieved' && (
                <Badge className="bg-green-100 text-green-700">Achieved!</Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={getProgressPercentage()} />
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Start: {goalProgress.start_value}</span>
            <span className="text-foreground font-bold">Current: {goalProgress.current_value}</span>
            <span>Goal: {goalProgress.target_value}</span>
        </div>
      </CardContent>
    </Card>
  );
};