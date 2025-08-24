// FILE: src/components/team/PlanCardTeamManagement.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';

// --- Types ---
import type { TeamManagementPlanSummary, RecentTeamMemberActivity } from '@/types/team';
import type { PlanGoal } from '@/types/plan/planGoals';
import type { Profile, UserPlanStatus } from '@/types/index';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // For recent activity

// Icons
import {
   Goal, AlertCircle, Eye, EyeOff,
  Dumbbell, Target, Brain,
  Heart, GitFork,
  CalendarCheck, Clock, CheckCircle, // Added Clock for last activity
  Activity
} from 'lucide-react';
import PlanMuscleDiagramExplore from '../exercise/PlanMuscleDiagramExplore';

// --- Reusable Component ---

interface PlanCardTeamManagementProps {
  planData: TeamManagementPlanSummary;
  teamId: string; // The ID of the parent team, needed for the Link route
}

export const PlanCardTeamManagement = React.memo(function PlanCardTeamManagement({ planData, teamId }: PlanCardTeamManagementProps) {
  // --- Robust Guard Clause ---
  if (!planData || !planData.id || !planData.creator) { // Ensure creator is also present
    console.error("PlanCardTeamManagement received invalid planData or missing creator:", planData);
    return (
      <Card className="h-full flex flex-col items-center justify-center p-4 bg-destructive/10 border-destructive">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive text-center">Invalid Plan Data</p>
      </Card>
    );
  }

  // Destructure all fields from `planData` (TeamManagementPlanSummary)
  const {
    id,
    title,
    description,
    difficulty_level,
    private: isPrivatePlan,
    creator, // Creator is now directly embedded
    goals,
    total_exercises_count,
    muscle_activation_summary,
    tags,
    my_status_on_plan, // New: Current user's status
    team_active_users_count, // New: Team active users for this plan
    team_completed_users_count, // New: Team completed users for this plan
    recent_team_member_activity, // New: Recent activity
    fork_count, // From base Plan
    like_count, // From base Plan
  } = planData;

  // --- Helper Functions for UI Logic ---
  const getDifficultyColor = (level: number | null) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-700 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 3: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 4: return 'bg-red-100 text-red-700 border-red-200';
      case 5: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: number | null) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Moderate';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const primaryMuscles = muscle_activation_summary?.filter(m => m?.engagement === 'primary').map(m => m?.muscle?.replace(/_/g, ' ')).filter(Boolean);
  const secondaryMuscles = muscle_activation_summary?.filter(m => m?.engagement === 'secondary').map(m => m?.muscle?.replace(/_/g, ' ')).filter(Boolean);

  const creatorImageUrl = creator.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.username || 'user'}`;

  const equipmentTags = tags?.filter(t => t.tag_type === 'equipment');
  const movementPatternTags = tags?.filter(t => t.tag_type === 'movement_pattern');
  const mentalAttributeTags = tags?.filter(t => t.tag_type === 'mental_attribute');

  const hasGoalsToDisplay = goals && goals.length > 0;
  const hasTagsToDisplay = (equipmentTags && equipmentTags.length > 0) || (movementPatternTags && movementPatternTags.length > 0) || (mentalAttributeTags && mentalAttributeTags.length > 0);


  return (
    // Link to the plan's edit page within the team context
    <Link to="/workspace/$teamId/plans/$planId/edit" params={{ teamId: teamId, planId: id }} className="block h-full">
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex-grow">
          <div className="flex items-center gap-3 mb-3">
            {creator && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={creatorImageUrl} alt={creator.username || 'User'} />
                <AvatarFallback>{creator.username?.substring(0, 2).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-1 flex-grow">
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{creator.full_name || creator.username || 'Unknown Creator'}</CardTitle>
              <p className="text-sm text-muted-foreground">Created by {creator.username || 'Unknown'}</p>
            </div>
            {isPrivatePlan ? (
              <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                <EyeOff className="w-3 h-3" /> Private
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
                <Eye className="w-3 h-3" /> Public
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-bold line-clamp-2">{title}</CardTitle>

          {hasGoalsToDisplay ? (
            <div className="mt-2 space-y-2">
              <Label className="text-sm font-semibold text-foreground/80">Key Goals:</Label>
              <div className="flex flex-col gap-1">
                {goals?.slice(0, 2).map((goal: PlanGoal) => (
                  <div key={goal.id} className="flex items-center text-sm text-muted-foreground">
                    <Goal className="w-4 h-4 mr-2 text-primary" />
                    <span className="line-clamp-1">{goal.title}</span>
                  </div>
                ))}
                {goals && goals.length > 2 && (
                  <p className="text-xs text-muted-foreground mt-1">+ {goals.length - 2} more goals</p>
                )}
              </div>
            </div>
          ) : (
            <CardDescription className="line-clamp-3 mt-2">{description || 'No description available.'}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3 flex-grow flex flex-col">
          {difficulty_level && (
            <Badge className={`${getDifficultyColor(difficulty_level)} border font-semibold px-3 py-1`}>
              {getDifficultyLabel(difficulty_level)}
            </Badge>
          )}

          {total_exercises_count !== null && total_exercises_count !== undefined && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Dumbbell className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium text-foreground">{total_exercises_count}</span> Exercises
            </div>
          )}

          {/* Tags Display */}
          {hasTagsToDisplay ? (
            <div className="space-y-2 mt-3">
              <Label className="text-sm font-semibold text-foreground/80">Plan Focus:</Label>
              {equipmentTags && equipmentTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {equipmentTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-2 py-0.5 text-xs font-semibold">
                      <Dumbbell className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              {movementPatternTags && movementPatternTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {movementPatternTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold">
                      <Target className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              {mentalAttributeTags && mentalAttributeTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mentalAttributeTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20 px-2 py-0.5 text-xs font-semibold">
                      <Brain className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* --- Plan Muscle Diagram Display --- */}
          {muscle_activation_summary && muscle_activation_summary.length > 0 && (
            <div className="flex justify-center items-center mt-auto p-2">
              <PlanMuscleDiagramExplore
                muscles={muscle_activation_summary}
                className="w-full h-auto max-w-[200px]"
              />
            </div>
          )}

        </CardContent>

        <CardFooter className="bg-muted/50 p-4 flex flex-col items-start gap-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full justify-between">
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4 text-purple-500" />
              <span>{fork_count} Forks</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{like_count} Likes</span>
            </div>
          </div>

          <Separator />

          {/* NEW: Team-specific and user-specific stats for this plan */}
          <div className="flex flex-col gap-2 w-full">
            {team_active_users_count !== null && team_active_users_count !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground justify-between w-full">
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>{team_active_users_count} Active Team Users</span>
                </div>
                {/* My status on plan (variant 'sm' applied via text size and color) */}
                {my_status_on_plan && (
                  <div className="flex items-center gap-1 text-xs">
                    <CalendarCheck className="w-3 h-3 text-gray-500" />
                    <span className={`capitalize font-medium ${my_status_on_plan.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                      My Status: {my_status_on_plan.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {team_completed_users_count !== null && team_completed_users_count !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground w-full justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{team_completed_users_count} Team Members Completed</span>
                </div>
                {/* Recent activity summary (if any) */}
                {recent_team_member_activity && recent_team_member_activity.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                          <Clock className="w-3 h-3" />
                          <span>Last Active: {dayjs(recent_team_member_activity[0].date).fromNow()}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold mb-1">Recent Activity:</p>
                        {recent_team_member_activity.map((activity, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={activity.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${activity.username}`} alt={activity.username} />
                              <AvatarFallback className="text-[8px]">{activity.username?.substring(0,1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{activity.full_name || activity.username} on {dayjs(activity.date).format('MMM D')}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
});