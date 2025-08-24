import React from 'react';
import type { PlanGoal } from '@/types/plan';
import { Link } from '@tanstack/react-router'; // <-- Import Link

// --- UI Components & Icons ---
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowUp, ArrowDown, Target } from 'lucide-react'; // <-- Import Target
import { findMetricByValue } from '@/utils/goal-metrics';

interface GoalCardProps {
  goal: PlanGoal;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, canEdit, onEdit, onDelete, isDeleting }) => {
  const generateGoalDescription = (): string => {
    const metricInfo = findMetricByValue(goal.metric);
    const metricLabel = metricInfo?.label || goal.metric.replace(/_/g, ' ');
    const unit = metricInfo?.unit || '';
    
    let action = goal.direction === 'increase' ? 'Increase' : 'Decrease';
    let targetString = `${goal.target_value}${unit}`;

    switch (goal.target_type) {
      case 'absolute_value':
        action = `${action} to`;
        break;
      case 'percent_change':
        action = `${action} by`;
        targetString = `${goal.target_value}%`;
        break;
      case 'absolute_change':
        action = `${action} by`;
        break;
    }
    
    return `${action} ${metricLabel} ${targetString}`;
  };

  return (
    <div className="p-3 border rounded-md flex justify-between items-start">
      <div className="flex-grow">
        <p className="font-semibold">{goal.title}</p>
        <p className="text-sm text-muted-foreground">{goal.description}</p>
        
        <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">
                {goal.direction === 'increase'
                    ? <ArrowUp className="h-3 w-3 mr-1.5" />
                    : <ArrowDown className="h-3 w-3 mr-1.5" />
                }
                {generateGoalDescription()}
            </Badge>
            
            {/* --- THIS IS THE NEW PART --- */}
            {goal.exercise_details?.name && goal.exercise_details && (
              <Link to="/exercise/$exerciseId" params={{ exerciseId: goal.exercise_id! }}>
                <Badge variant="outline" className="hover:bg-muted">
                    <Target className="h-3 w-3 mr-1.5" />
                    {goal.exercise_details.name}
                </Badge>
              </Link>
            )}
            {/* --- END OF NEW PART --- */}
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-1 shrink-0 ml-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Goal</span>
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Goal</span>
          </Button>
        </div>
      )}
    </div>
  );
};