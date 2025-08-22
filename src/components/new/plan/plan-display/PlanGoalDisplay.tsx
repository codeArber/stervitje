// src/components/new/plan/PlanGoalsDisplay.tsx
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KanbanSquareDashed, Dumbbell, ArrowRight, Target } from 'lucide-react';
import { PlanGoal } from '@/types/plan';

interface PlanGoalsDisplayProps {
  goals: PlanGoal[];
  maxPreviewGoals?: number;
  className?: string;
}
export const PlanGoalsDisplay: React.FC<{
  goals: any[];
  maxPreviewGoals?: number;
  className?: string;
}> = ({
  goals,
  maxPreviewGoals = 3,
  className,
}) => {
  if (!goals || goals.length === 0) {
    return <p className="text-sm text-muted-foreground">No specific goals listed.</p>;
  }

  const previewGoals = goals.slice(0, maxPreviewGoals);
  const remainingGoalsCount = goals.length - previewGoals.length;

  return (
    <div className={className}>
      <ul className="space-y-2">
        {previewGoals.map((goal, index) => (
          <li key={goal.id || index} className="flex items-start gap-2 text-sm">
            {goal.exercise_id ? (
              <Dumbbell className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <KanbanSquareDashed className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <span className="font-medium">{goal.title}</span>
              <span className="text-muted-foreground ml-2">
                ({goal.metric} to {goal.target_value})
              </span>
            </div>
          </li>
        ))}
        {remainingGoalsCount > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 text-sm hover:underline">
                <ArrowRight className="h-4 w-4 mr-1" /> 
                {remainingGoalsCount} more goal{remainingGoalsCount > 1 ? 's' : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-4">
              <h4 className="font-medium mb-3">All Goals ({goals.length})</h4>
              <ul className="space-y-2">
                {goals.map((goal, index) => (
                  <li key={goal.id || index} className="flex items-start gap-2 text-sm">
                    {goal.exercise_id ? (
                      <Dumbbell className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <KanbanSquareDashed className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-muted-foreground ml-2">
                        ({goal.metric} to {goal.target_value})
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </ul>
    </div>
  );
};