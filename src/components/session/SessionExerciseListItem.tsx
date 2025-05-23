import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from 'lucide-react';
import { SessionSetListItem } from './SessionSetListItem';
import type { PlanSessionExercise } from '@/types/planTypes';
import { cn } from '@/lib/utils';

interface SessionExerciseListItemProps {
    sessionExercise: PlanSessionExercise;
    imageUrl?: string;
    className?: string;
    onClick?: () => void;
}

// Helper to format rest time nicely (can be shared)
const formatRest = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return null;
    if (seconds < 60) return `${seconds}s Rest`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m${secs > 0 ? ` ${secs}s` : ''} Rest`;
};


export function SessionExerciseListItem({ sessionExercise, imageUrl, className, onClick }: SessionExerciseListItemProps) {
    const exerciseDetails = sessionExercise.exercise;
    const sets = sessionExercise.plan_session_exercise_sets || []; // Ensure sets is an array
    const restAfterExercise = formatRest(sessionExercise.target_rest_seconds);

    return (
        <Card className={cn("overflow-hidden", className)} onClick={onClick}>
            <CardHeader className="flex flex-row items-start gap-4 p-4 bg-muted/30">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                    <img
                        src={imageUrl || '/placeholder.svg'}
                        className="object-cover w-full h-full"
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                    />
                </div>
                 {/* Title and Notes */}
                <div className="flex-grow">
                    <CardTitle className="text-lg mb-1">{exerciseDetails?.name || 'Unknown Exercise'}</CardTitle>
                    {sessionExercise.notes && (
                         <CardDescription className="text-xs italic">Notes: {sessionExercise.notes}</CardDescription>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0"> {/* Remove padding to allow set items to span width */}
                {sets.length > 0 ? (
                    sets.map((set, index) => (
                        <SessionSetListItem key={set.id} set={set} setIndex={index} />
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground px-4 py-3 text-center">No sets planned for this exercise.</p>
                )}
                 {/* Display rest AFTER exercise block */}
                 {restAfterExercise && (
                    <div className="flex justify-end items-center gap-1 p-3 border-t text-sm text-muted-foreground bg-muted/20">
                        <Timer className="h-4 w-4" /> <span>{restAfterExercise} before next exercise</span>
                    </div>
                 )}
            </CardContent>
            {/* CardFooter could be used for actions later if needed */}
        </Card>
    );
}