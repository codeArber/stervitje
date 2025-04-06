// src/components/sessions/SessionSetListItem.tsx (New File)
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Timer, Weight, Repeat, Route as RouteIcon } from 'lucide-react'; // Icons
import type { PlanExerciseSet } from '@/types/planTypes'; // Assuming your set type is defined here

interface SessionSetListItemProps {
    set: PlanExerciseSet; // Pass the set data object
    setIndex: number; // Pass the 0-based index for display (Set 1, Set 2...)
}

// Helper to format rest time nicely
const formatRest = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return null;
    if (seconds < 60) return `${seconds}s Rest`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m${secs > 0 ? ` ${secs}s` : ''} Rest`;
};

export function SessionSetListItem({ set, setIndex }: SessionSetListItemProps) {
    const restTime = formatRest(set.target_rest_seconds);

    return (
        <div className="flex justify-between items-center border-t py-2 px-1 first:border-t-0">
            {/* Left side: Set Number and Params */}
            <div className='flex items-center gap-3'>
                <Badge variant="secondary" className="text-xs w-10 justify-center py-1">
                    Set {setIndex + 1}
                </Badge>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {set.target_reps != null && (
                        <span className='flex items-center gap-1'><Repeat className='h-3.5 w-3.5'/> {set.target_reps} reps</span>
                    )}
                    {set.target_weight != null && (
                        <span className='flex items-center gap-1'><Weight className='h-3.5 w-3.5'/> {set.target_weight}{set.target_weight_unit || ''}</span>
                    )}
                     {set.target_duration_seconds != null && (
                        <span className='flex items-center gap-1'><Timer className='h-3.5 w-3.5'/> {set.target_duration_seconds}s</span>
                    )}
                     {set.target_distance_meters != null && (
                        <span className='flex items-center gap-1'><RouteIcon className='h-3.5 w-3.5'/> {set.target_distance_meters}m</span>
                    )}
                </div>
            </div>

            {/* Right side: Rest Time */}
            {restTime && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {restTime}
                </Badge>
            )}
             {/* Display set notes if they exist */}
            {set.notes && (
                <p className="text-xs italic text-muted-foreground mt-1 w-full col-span-full pl-12"> {/* Indent notes slightly */}
                    Notes: {set.notes}
                </p>
            )}
        </div>
    );
}