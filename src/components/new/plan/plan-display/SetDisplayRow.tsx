// FILE: src/components/plan-display/SetDisplayRow.tsx

import React from 'react';
import type { PlanSet } from '@/types/plan';
import type { Tables } from '@/types/database.types';


// UI Components & Icons
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Repeat, Route, Zap, ChevronsUp, ChevronsDown, PauseCircle, BrainCircuit } from 'lucide-react';

interface SetDisplayRowProps {
  set: PlanSet;
}

export const SetDisplayRow: React.FC<SetDisplayRowProps> = ({ set }) => {
  const setType = set.set_type as Tables<'plan_session_exercise_sets'>['set_type'];

  // Helper to get specific styling and text for each badge type
  const getBadgeDetails = () => {
    switch (setType) {
      case 'warmup':
        return { text: 'Warmup', className: 'bg-blue-100 text-blue-700' };
      case 'dropset':
        return { text: 'Dropset', className: 'bg-orange-100 text-orange-700' };
      case 'amrap':
        return { text: 'AMRAP', className: 'bg-red-100 text-red-700' };
      case 'emom':
        return { text: 'EMOM', className: 'bg-purple-100 text-purple-700' };
      case 'for_time':
        return { text: 'For Time', className: 'bg-indigo-100 text-indigo-700' };
      case 'tabata':
        return { text: 'Tabata', className: 'bg-pink-100 text-pink-700' };
      case 'pyramid':
        return { text: 'Pyramid', className: 'bg-yellow-100 text-yellow-700' };
      case 'failure':
        return { text: 'To Failure', className: 'bg-red-100 text-red-700 font-bold' };
      case 'rest_pause':
        return { text: 'Rest-Pause', className: 'bg-cyan-100 text-cyan-700' };
      case 'isometrics':
        return { text: 'Isometric Hold', className: 'bg-gray-100 text-gray-700' };
      case 'technique':
        return { text: 'Technique', className: 'bg-green-100 text-green-700' };
      default:
        return null;
    }
  };

  const badgeDetails = getBadgeDetails();

  // Helper to build the main metric string based on the set's data
  const renderMetrics = () => {
    const metrics = [];

    if (set.target_reps != null) {
      metrics.push(
        <div key="reps" className="flex items-center gap-1.5" title="Repetitions">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <span>{set.target_reps} reps</span>
        </div>
      );
    }
    if (set.target_weight != null) {
      metrics.push(
        <div key="weight" className="flex items-center gap-1.5" title="Weight">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <span>{set.target_weight} kg</span>
        </div>
      );
    }
    if (set.target_duration_seconds != null) {
      metrics.push(
        <div key="duration" className="flex items-center gap-1.5" title="Duration">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{set.target_duration_seconds}s</span>
        </div>
      );
    }
    if (set.target_distance_meters != null) {
      metrics.push(
        <div key="distance" className="flex items-center gap-1.5" title="Distance">
          <Route className="h-4 w-4 text-muted-foreground" />
          <span>{set.target_distance_meters}m</span>
        </div>
      );
    }

    // If no specific targets, show an icon based on type for clarity
    if (metrics.length === 0) {
        switch (setType) {
            case 'amrap':
            case 'failure':
                return <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-muted-foreground" /><span>Max Effort</span></div>;
            case 'pyramid':
                return <div className="flex items-center gap-1.5"><ChevronsUp className="h-4 w-4 text-muted-foreground" /><span>Pyramid Set</span></div>;
            case 'rest_pause':
                return <div className="flex items-center gap-1.5"><PauseCircle className="h-4 w-4 text-muted-foreground" /><span>Rest-Pause</span></div>;
            case 'technique':
                return <div className="flex items-center gap-1.5"><BrainCircuit className="h-4 w-4 text-muted-foreground" /><span>Focus on Form</span></div>;
            default:
                return <span className="text-muted-foreground italic">No specific target</span>;
        }
    }

    return metrics;
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
        {/* Set Number Badge */}
        <Badge variant="outline" className="font-mono w-16 justify-center h-7 text-xs shrink-0">
          Set {set.set_number}
        </Badge>

        {/* Metrics Display */}
        <div className="flex flex-grow items-center gap-4 text-foreground font-medium flex-wrap">
          {renderMetrics()}
        </div>

        {/* Set Type Badge (always visible if not 'normal') */}
        {badgeDetails && (
          <Badge className={`text-xs uppercase ml-auto shrink-0 ${badgeDetails.className}`}>
            {badgeDetails.text}
          </Badge>
        )}
      </div>

      {/* Optional Notes Display */}
      {set.notes && (
        <p className="text-xs italic text-muted-foreground mt-1.5 pl-[72px] pr-2">
          {set.notes}
        </p>
      )}
    </div>
  );
};