// FILE: src/components/plan-display/SetDisplayRow.tsx

import React from 'react';
import type { PlanSet } from '@/types/plan';

// UI Components & Icons
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Repeat, Route } from 'lucide-react';

interface SetDisplayRowProps {
  set: PlanSet;
}

export const SetDisplayRow: React.FC<SetDisplayRowProps> = ({ set }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
        {/* Set Number Badge */}
        <Badge variant="outline" className="font-mono w-16 justify-center h-7 text-xs">
          Set {set.set_number}
        </Badge>

        {/* Metrics Display */}
        <div className="flex flex-grow items-center gap-4 text-foreground font-medium">
          {set.target_reps != null && (
            <div className="flex items-center gap-1.5" title="Repetitions">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <span>{set.target_reps} reps</span>
            </div>
          )}
          {set.target_weight != null && (
            <div className="flex items-center gap-1.5" title="Weight">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <span>{set.target_weight} kg</span>
            </div>
          )}
          {set.target_duration_seconds != null && (
            <div className="flex items-center gap-1.5" title="Duration">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{set.target_duration_seconds}s</span>
            </div>
          )}
           {set.target_distance_meters != null && (
            <div className="flex items-center gap-1.5" title="Distance">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span>{set.target_distance_meters}m</span>
            </div>
          )}
        </div>

        {/* Set Type Badge (only if not 'normal') */}
        {set.set_type !== 'normal' && (
          <Badge variant="destructive" className="text-xs uppercase ml-auto">
            {set.set_type}
          </Badge>
        )}
      </div>

      {/* Optional Notes Display */}
      {/* {set.notes && (
        <p className="text-xs italic text-muted-foreground mt-1 pl-[76px] pr-2">
          Note: {set.notes}
        </p>
      )} */}
    </div>
  );
};