

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle, PlusCircle, CalendarDays, Users, GitFork, Heart, Eye, Target, Unlock, Lock, Milestone, CheckCircle, Info, Dumbbell, Clock, CheckSquare, Coffee, CalendarCheck, ClipboardList } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Import Dialog components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { CreateWeekForm } from '@/components/CreateWeek';
import { PlanWeek } from '@/types/planTypes';
import { usePlanDetails } from '@/api/plans/plan';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


// components/PlanDetailSummaryCard.tsx

import React from 'react';


// Helper function to format dates (adjust locale and options as needed)
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    } catch (e) {
        return 'Invalid Date';
    }
};

export const PlanDetailSummaryCard: React.FC<{ plan: any }> = ({ plan }) => {
    // --- Detailed Calculations ---
    const numWeeks = plan.plan_weeks?.length ?? 0;
    const totalDays = plan.plan_weeks?.reduce((sum, week) => sum + (week.plan_days?.length ?? 0), 0) ?? 0;
    const workoutDays = plan.plan_weeks?.reduce((sum, week) => sum + (week.plan_days?.filter(day => !day.is_rest_day)?.length ?? 0), 0) ?? 0;
    const restDays = totalDays - workoutDays;

    const totalExercises = plan.plan_weeks?.reduce((weekSum, week) =>
        weekSum + (week.plan_days?.reduce((daySum, day) =>
            daySum + (day.plan_sessions?.reduce((sessionSum, session) =>
                sessionSum + (session.plan_session_exercises?.length ?? 0), 0) ?? 0), 0) ?? 0), 0) ?? 0;

    // Creator Info
    const creatorName = plan.created_by.full_name || plan.created_by.username;
    const creatorInitials = creatorName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    // --- Component Rendering ---
    return (
        <Card className="w-full max-w-2xl hover:shadow-lg transition-shadow duration-200"> {/* Increased max-width */}
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">{plan.title || 'Untitled Plan'}</CardTitle>
                        {plan.description && (
                            <CardDescription className="mt-1 text-base"> {/* Allow more space for description */}
                                {plan.description}
                            </CardDescription>
                        )}
                    </div>
                    {plan.is_featured && <Badge variant="destructive">Featured</Badge>}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {/* Difficulty Badge */}
                    {plan.difficulty_level && (
                        <Badge variant="secondary">{plan.difficulty_level}</Badge>
                    )}
                    {/* Sport Badge */}
                    {plan.sport && (
                        <Badge variant="secondary">{plan.sport}</Badge>
                    )}
                    {/* Visibility Badge */}
                    <Badge variant={plan.visibility === 'public' ? 'default' : 'outline'} className="flex items-center gap-1">
                        {plan.visibility === 'public' ? <Unlock size={14} /> : <Lock size={14} />}
                        {plan.visibility.charAt(0).toUpperCase() + plan.visibility.slice(1)}
                    </Badge>
                    {/* Forking Badge */}
                    {plan.visibility === 'public' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <GitFork size={14} />
                            {plan.allow_public_forking ? 'Forking Allowed' : 'Forking Disabled'}
                        </Badge>
                    )}
                    {/* Origin Type Badge */}
                    {plan.origin_type && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Milestone size={14} />
                            {plan.origin_type.charAt(0).toUpperCase() + plan.origin_type.slice(1)} Origin
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <Separator className="my-2" />

            <CardContent className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold mb-2">Plan Structure</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {/* Weeks */}
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{numWeeks}</span> Week{numWeeks !== 1 ? 's' : ''}
                        </div>
                    </div>
                    {/* Total Days */}
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{totalDays}</span> Total Day{totalDays !== 1 ? 's' : ''}
                        </div>
                    </div>
                    {/* Workout Days */}
                    <div className="flex items-center gap-2">
                        <Target className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{workoutDays}</span> Workout Day{workoutDays !== 1 ? 's' : ''}
                        </div>
                    </div>
                    {/* Rest Days */}
                    <div className="flex items-center gap-2">
                        <Info className="text-muted-foreground" size={18} /> {/* Using Info icon for rest */}
                        <div>
                            <span className="font-medium">{restDays}</span> Rest Day{restDays !== 1 ? 's' : ''}
                        </div>
                    </div>
                    {/* Total Exercises */}
                    <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                        <Dumbbell className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{totalExercises}</span> Total Exercise{totalExercises !== 1 ? 's' : ''} Entrie{totalExercises !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-muted-foreground pt-4 gap-3">
                {/* Creator & Team Info */}
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={plan.created_by.profile_image_url ?? undefined} alt={creatorName} />
                        <AvatarFallback>{creatorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div>Created by <span className="font-medium text-primary">{creatorName}</span></div>
                        {plan.team && <div className="flex items-center gap-1"><Users size={14} /> Team: <span className="font-medium text-primary">{plan.team.name}</span></div>}
                    </div>
                </div>

                {/* Engagement & Dates */}
                <div className="flex flex-col items-start sm:items-end gap-1">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1" title="Views">
                            <Eye size={14} /> {plan.view_count}
                        </span>
                        <span className="flex items-center gap-1" title="Likes">
                            <Heart size={14} /> {plan.like_count}
                        </span>
                        <span className="flex items-center gap-1" title="Forks">
                            <GitFork size={14} /> {plan.fork_count}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                        <Clock size={12} /> Last Updated: {formatDate(plan.updated_at)}
                    </div>
                    {/* Optionally show created date */}
                    {/* <div className="flex items-center gap-1 text-xs">
                         <Clock size={12} /> Created: {formatDate(plan.created_at)}
                    </div> */}
                </div>
            </CardFooter>
        </Card>
    );
};

export const PlanOverviewWithWeeks: React.FC<{ plan: any }> = ({ plan }) => {
    // --- Calculations for Overall Plan Summary ---
    const numTotalWeeks = plan.plan_weeks?.length ?? 0;
    const totalDaysOverall = plan.plan_weeks?.reduce((sum, week) => sum + (week.plan_days?.length ?? 0), 0) ?? 0;
    const workoutDaysOverall = plan.plan_weeks?.reduce((sum, week) => sum + (week.plan_days?.filter(day => !day.is_rest_day)?.length ?? 0), 0) ?? 0;
    const restDaysOverall = totalDaysOverall - workoutDaysOverall;
    const totalExercisesOverall = plan.plan_weeks?.reduce((weekSum, week) =>
        weekSum + (week.plan_days?.reduce((daySum, day) =>
            daySum + (day.plan_sessions?.reduce((sessionSum, session) =>
                sessionSum + (session.plan_session_exercises?.length ?? 0), 0) ?? 0), 0) ?? 0), 0) ?? 0;
    const creatorName = plan.created_by.full_name || plan.created_by.username;
    const creatorInitials = creatorName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    // Sort weeks for display
    const sortedWeeks = plan.plan_weeks ? [...plan.plan_weeks].sort((a, b) => a.week_number - b.week_number) : [];

    // --- Component Rendering ---
    return (
        <div className="space-y-6"> {/* Container for the whole view */}

            {/* === Overall Plan Summary === */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Overall Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{numTotalWeeks}</span> Week{numTotalWeeks !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{workoutDaysOverall}</span> Workout Day{workoutDaysOverall !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Coffee className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{restDaysOverall}</span> Rest Day{restDaysOverall !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <Dumbbell className="text-muted-foreground" size={18} />
                        <div>
                            <span className="font-medium">{totalExercisesOverall}</span> Exercise Entrie{totalExercisesOverall !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                <Separator className="my-4" />
            </div>

            {/* === Weekly Breakdown Section === */}


        </div> // End container for the whole view
    );
};


<div>
    <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Weekly Breakdown
    </h2>

    {sortedWeeks && sortedWeeks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWeeks.map((week) => {
                // --- Calculations specific to this week within the loop ---
                const numDaysWeek = week.plan_days?.length ?? 0;
                const workoutDaysWeek = week.plan_days?.filter(day => !day.is_rest_day)?.length ?? 0;
                const restDaysWeek = numDaysWeek - workoutDaysWeek;
                const numSessionsWeek = week.plan_days?.reduce((daySum, day) => daySum + (day.plan_sessions?.length ?? 0), 0) ?? 0;
                const numExercisesWeek = week.plan_days?.reduce((daySum, day) =>
                    daySum + (day.plan_sessions?.reduce((sessionSum, session) =>
                        sessionSum + (session.plan_session_exercises?.length ?? 0), 0) ?? 0), 0) ?? 0;

                // --- Rendering the Card for this week ---
                return (
                    <Card key={week.id} className="w-full hover:shadow-md transition-shadow duration-150">
                        <CardHeader className="pb-2"> {/* Reduced padding */}
                            <CardTitle className="text-lg font-semibold">Week {week.week_number}</CardTitle>
                            {week.description && (
                                <CardDescription className="text-sm pt-1">
                                    {week.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <Separator className="my-2" />
                        <CardContent className="text-sm pt-3"> {/* Reduced padding */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="text-muted-foreground" size={16} />
                                    <div><span className="font-medium">{numDaysWeek}</span> Day{numDaysWeek !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="text-green-600" size={16} />
                                    <div><span className="font-medium">{workoutDaysWeek}</span> Workout</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coffee className="text-blue-600" size={16} />
                                    <div><span className="font-medium">{restDaysWeek}</span> Rest</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="text-muted-foreground" size={16} />
                                    <div><span className="font-medium">{numSessionsWeek}</span> Session{numSessionsWeek !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <Dumbbell className="text-muted-foreground" size={16} />
                                    <div><span className="font-medium">{numExercisesWeek}</span> Exercise Entrie{numExercisesWeek !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    ) : (
        <p className="text-muted-foreground italic">No weeks defined for this plan yet.</p>
    )}
</div>