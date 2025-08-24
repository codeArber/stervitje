// FILE: src/components/team/PlanCardTeam.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';

// --- Types ---
import type { TeamPlanSummary } from '@/types/team'; // NEW: Import TeamPlanSummary
import type { Profile } from '@/types/index'; // Centralized Profile type
import type { PlanGoal } from '@/types/plan/planGoals'; // For nested goals in TeamPlanSummary
import type { Tag } from '@/types/index'; // Tags are NOT in TeamPlanSummary data, so won't be displayed here yet.

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  Users, Goal, AlertCircle, Eye, EyeOff,
  Dumbbell, Target, Brain, // Icons for tags
  Heart, GitFork, // Icons for analytics
  Activity, // Icon for active users on plan
  CalendarCheck // Icon for plan status
} from 'lucide-react';
import PlanMuscleDiagramExplore from '../exercise/PlanMuscleDiagramExplore';

// --- Reusable Component ---

interface PlanCardTeamProps {
  planData: TeamPlanSummary;
  teamId: string; // The ID of the parent team, needed for the Link route
  // --- REMOVED: creatorProfile is no longer needed as a prop ---
  // creatorProfile?: Profile;
}

export const PlanCardTeam = React.memo(function PlanCardTeam({ planData, teamId }: PlanCardTeamProps) {
  // --- Robust Guard Clause ---
  if (!planData || !planData.id) {
    console.error("PlanCardTeam received invalid planData:", planData);
    return (
      <Card className="h-full flex flex-col items-center justify-center p-4 bg-destructive/10 border-destructive">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive text-center">Invalid Plan Data</p>
      </Card>
    );
  }

  // Destructure all new and existing fields from `planData` (TeamPlanSummary)
  const {
    id,
    title,
    description,
    difficulty_level,
    private: isPrivatePlan, // Renamed 'private' to avoid clash with JS keyword
    creator, // --- NEW: Destructure creator directly from planData ---
    goals, // Array of PlanGoal
    total_exercises_count,
    muscle_activation_summary, // Array of { muscle, engagement }
    tags, // Array of Tag
    current_user_plan_status, // UserPlanStatus | null
    plan_active_users_count, // number | null
  } = planData;

  // --- Helper Functions for UI Logic (can be reused) ---
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

  // --- Defensive filtering and mapping for muscle summaries ---

  // --- Creator Avatar Logic (now using embedded creator) ---
  const creatorImageUrl = creator?.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator?.username || 'user'}`;

  // --- Filter Tags by Type for Display ---
  const equipmentTags = tags?.filter(t => t.tag_type === 'equipment');
  const movementPatternTags = tags?.filter(t => t.tag_type === 'movement_pattern');
  const mentalAttributeTags = tags?.filter(t => t.tag_type === 'mental_attribute');

  const hasGoalsToDisplay = goals && goals.length > 0;
  const hasTagsToDisplay = (equipmentTags && equipmentTags.length > 0) || (movementPatternTags && movementPatternTags.length > 0) || (mentalAttributeTags && mentalAttributeTags.length > 0);


  return (
    <Link to="/workspace/$teamId/plans/$planId/edit" params={{ teamId: teamId, planId: id }} className="block h-full">
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex-grow">
          <div className="flex items-center gap-3 mb-3">
            {creator && ( // Only render avatar if creator object exists
              <Avatar className="h-10 w-10">
                <AvatarImage src={creatorImageUrl} alt={creator?.username || 'User'} />
                <AvatarFallback>{creator?.username?.substring(0, 2).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-1 flex-grow">
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{creator?.full_name || creator?.username || 'Unknown Creator'}</CardTitle>
              <p className="text-sm text-muted-foreground">Created by {creator?.username || 'Unknown'}</p>
            </div>
            <div className="flex flex-col gap-2">
              {isPrivatePlan ? (
                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                  <EyeOff className="w-3 h-3" /> Private
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
                  <Eye className="w-3 h-3" /> Public
                </Badge>
              )}
              {difficulty_level && (
                <Badge className={`${getDifficultyColor(difficulty_level)} border font-semibold px-3 py-1`}>
                  {getDifficultyLabel(difficulty_level)}
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold line-clamp-2">{title}</CardTitle>


          <div className="flex flex-row justify-between w-full">
            {hasGoalsToDisplay ? (
              <div className="mt-2 space-y-2 w-full">
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
            {hasTagsToDisplay ? (
              <div className="space-y-2 mt-3 w-full">
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

          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow flex flex-col">


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
              <span>{planData.fork_count} Forks</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{planData.like_count} Likes</span>
            </div>
          </div>

          <Separator />

          {plan_active_users_count !== null && plan_active_users_count !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground w-full justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{plan_active_users_count} Active Users</span>
              </div>
              {current_user_plan_status && (
                <div className="flex items-center gap-1">
                  <CalendarCheck className="w-4 h-4 text-gray-500" />
                  <span className={`capitalize font-medium ${current_user_plan_status.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {current_user_plan_status.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
});