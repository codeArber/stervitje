import React from 'react';
import { Badge } from '@/components/ui/badge'; // Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // For collapsing sessions/exercises
import { useGetPlanDayDetails } from '@/api/plans/day';
import { PlanSetDetails } from '@/types/planTypes';
import { useInfiniteWorkoutHistory, useLogWorkout, useWorkoutLogDetails, useWorkoutLogDetailsFormatted } from '@/api/workouts';
import { useSession } from '@supabase/auth-helpers-react';
import { ExerciseStatus } from './ExerciseStatus';
import { Button } from './ui/button';
import { Link } from '@tanstack/react-router';

// Helper to format set details (customize as needed)
const formatSet = (set: PlanSetDetails): string => {
    const parts: string[] = [];
    if (set.target_reps) parts.push(`${set.target_reps} reps`);
    if (set.target_weight) parts.push(`${set.target_weight}${set.target_weight_unit || ''}`);
    if (set.target_duration_seconds) parts.push(`${set.target_duration_seconds}s`);
    if (set.target_distance_meters) parts.push(`${set.target_distance_meters}m`);
    if (parts.length === 0) return "Details TBD"; // Fallback
    let details = parts.join(' @ ');
    if (set.target_rest_seconds) details += ` | ${set.target_rest_seconds}s rest`;
    return details;
};


const WorkoutDayDetailsView = ({ planId }: { planId: string }) => {
    // Get planDayId from URL parameters (adjust based on your routing setup)
    const user = useSession()?.user
    const { data: dayDetails, isLoading, isError, error } = useGetPlanDayDetails(planId || '');
    const { data: a } = useWorkoutLogDetailsFormatted(user?.id || '')

    console.log(a)
    if (isError) {
        return <div className="text-red-600">Error loading workout: {error.message}</div>;
    }
    console.log(dayDetails)

    if (!dayDetails) {
        return <div>Workout day not found or you do not have access.</div>;
    }

    if (dayDetails.is_rest_day) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{dayDetails.title || `Day ${dayDetails.day_number}`}</h1>
                <p className="text-lg text-muted-foreground">Today is a rest day!</p>
                {dayDetails.description && <p className="mt-4">{dayDetails.description}</p>}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-2xl font-bold">{dayDetails.title || `Workout Day ${dayDetails.day_number}`}</h1>
            {dayDetails.description && <p className="text-muted-foreground">{dayDetails.description}</p>}

            {dayDetails.plan_sessions?.length === 0 && (
                <p>No workout sessions defined for this day yet.</p>
            )}

            {/* Use Accordion for better structure if many sessions/exercises */}
            <Accordion type="multiple" className="w-full space-y-4">
                {dayDetails?.plan_sessions?.map((session, sessionIndex) => {
                    return (
                        <div key={session.id} className="w-full">
                            <Link to='/$sessionId' params={{ sessionId: session.id }} className="w-full">
                            <Button variant={'secondary'} >Start</Button>
                            </Link>
                            <AccordionItem value={`session-${session.id}`} className="border rounded-lg overflow-hidden">
                                <AccordionTrigger className="bg-muted/50 px-4 py-3 text-lg font-semibold hover:no-underline">
                                    {session.title || `Session ${session.order_index}`}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 space-y-4">

                                    {/* Session Notes */}
                                    {session.notes && <p className="text-sm text-muted-foreground mb-4">{session.notes}</p>}

                                    {/* No exercises message */}
                                    {session.plan_session_exercises?.length === 0 && <p>No exercises in this session.</p>}

                                    {/* Loop through exercises */}
                                    {session.plan_session_exercises?.map((exerciseEntry) => (
                                        <ExerciseStatus {...exerciseEntry} sessionId={session.id} />
                                    ))}

                                </AccordionContent>
                            </AccordionItem>
                        </div>
                    )
                })}
            </Accordion>

        </div>
    );
};

export default WorkoutDayDetailsView;

