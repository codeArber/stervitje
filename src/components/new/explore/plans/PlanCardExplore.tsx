// FILE: src/components/explore/plans/PlanCardExplore.tsx

import React from 'react'; // Explicitly import React
import { Link } from '@tanstack/react-router';

// --- Types ---
import type { FilteredPlanRich, PlanGoal } from '@/types/plan';
import type { Tag } from '@/types/index'; // Centralized Tag type

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

// Icons
import { GitFork, Heart, Users, AlertCircle, Dumbbell, Target, Brain } from 'lucide-react'; // Added Barbell back for total exercises count icon
import PlanMuscleDiagramExplore from '../../exercise/PlanMuscleDiagramExplore';
import { GoalCard } from '../../plan/GoalCard';

// --- Utility Function ---

// --- Reusable Component ---
// --- NEW IMPORT: PlanMuscleDiagramExplore ---

interface PlanCardExploreProps {
  planData: FilteredPlanRich;
}

export const PlanCardExplore = React.memo(function PlanCardExplore({ planData }: PlanCardExploreProps) {
  // --- Robust Guard Clause ---
  if (!planData || !planData.id) {
    console.error("PlanCardExplore received invalid planData:", planData);
    return (
      <Card className="h-full flex flex-col items-center justify-center p-4 bg-destructive/10 border-destructive">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive text-center">Invalid Plan Data</p>
      </Card>
    );
  }

  const {
    id,
    title,
    description,
    difficulty_level,
    creator,
    analytics,
    total_exercises_count,
    muscle_activation_summary, // Destructure muscle_activation_summary
    tags,
    goals
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

  // --- Defensive filtering and mapping for muscle summaries ---
  const primaryMuscles = muscle_activation_summary?.filter(m => m?.engagement === 'primary').map(m => m?.muscle?.replace(/_/g, ' ')).filter(Boolean);
  const secondaryMuscles = muscle_activation_summary?.filter(m => m?.engagement === 'secondary').map(m => m?.muscle?.replace(/_/g, ' ')).filter(Boolean);

  // --- Creator Avatar Logic ---
  const creatorImageUrl = creator?.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator?.username || 'user'}`;

  // --- Filter Tags by Type for Display ---
  const equipmentTags = tags?.filter(t => t.tag_type === 'equipment');
  const movementPatternTags = tags?.filter(t => t.tag_type === 'movement_pattern');
  const mentalAttributeTags = tags?.filter(t => t.tag_type === 'mental_attribute');

  const hasGoalsToDisplay = goals && goals.length > 0;

  return (
    <Link to="/explore/plans/$planId" params={{ planId: id }} className="block h-full">
      <Card className="h-[450px] flex flex-col group hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex-grow pb-0">
          <div className="flex items-center gap-3 mb-3">
            {creator && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={creatorImageUrl} alt={creator?.username || 'User'} />
                <AvatarFallback>{creator?.username?.substring(0, 2).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{creator?.full_name || creator?.username || 'Unknown Creator'}</CardTitle>
              <p className="text-sm text-muted-foreground">Created by {creator?.username || 'Unknown'}</p>

            </div>
            {difficulty_level && (
              <Badge className={`${getDifficultyColor(difficulty_level)} border font-semibold px-3 py-1`}>
                {getDifficultyLabel(difficulty_level)}
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-bold line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-3 mt-2 flex flex-row ">
            {hasGoalsToDisplay ? (
              <div className="mt-2 space-y-2">
                <Label className="text-sm font-semibold text-foreground/80">Goals:</Label>
                <div className="flex flex-col gap-1">
                  {goals.slice(0, 2).map((goal: PlanGoal) => ( // Show first 2 goals
                    <div key={goal.id} className="flex items-center text-sm text-muted-foreground">
                      <GoalCard goal={goal} canEdit={false} onEdit={function (): void {
                        throw new Error('Function not implemented.');
                      } } onDelete={function (): void {
                        throw new Error('Function not implemented.');
                      } } isDeleting={false} />
                    </div>
                  ))}
                  {goals.length > 2 && (
                    <p className="text-xs text-muted-foreground mt-1">+ {goals.length - 2} more goals</p>
                  )}
                </div>
              </div>
            ) : (
              <CardDescription className="line-clamp-3 mt-2">{description || 'No description available.'}</CardDescription>
            )}
            {muscle_activation_summary && muscle_activation_summary.length > 0 && (
              <div className="flex justify-center items-center mt-auto p-2"> {/* Added p-2 for internal padding */}
                <PlanMuscleDiagramExplore
                  muscles={muscle_activation_summary}
                  className="w-full h-auto max-w-[200px]" // Adjust size as needed for card
                />
              </div>
            )}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-1 flex-grow">
          {/* Tags Display */}
          {((equipmentTags && equipmentTags.length > 0) || (movementPatternTags && movementPatternTags.length > 0) || (mentalAttributeTags && mentalAttributeTags.length > 0)) ? (
            <div className="space-y-4 mt-3">
              <Label className="text-sm font-semibold text-foreground/80">Plan Focus:</Label>
              {equipmentTags && equipmentTags.length > 0 && (
                <div className="flex overflow-x-auto gap-1 pb-2 flex-nowrap">
                  {equipmentTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-2 py-0.5 text-xs font-semibold flex-shrink-0">
                      <Dumbbell className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              {/* {movementPatternTags && movementPatternTags.length > 0 && (
                <div className="flex overflow-x-auto gap-1 pb-2 flex-nowrap">
                  {movementPatternTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold flex-shrink-0">
                      <Target className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )} */}
              {mentalAttributeTags && mentalAttributeTags.length > 0 && (
                <div className="flex overflow-x-auto gap-1 pb-2 flex-nowrap">
                  {mentalAttributeTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20 px-2 py-0.5 text-xs font-semibold flex-shrink-0">
                      <Brain className="w-2.5 h-2.5 mr-1" />{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {analytics?.fork_count !== null && analytics?.fork_count !== undefined && (
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4 text-purple-500" />
                <span>{analytics.fork_count}</span>
              </div>
            )}
            {analytics?.like_count !== null && analytics?.like_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{analytics.like_count}</span>
              </div>
            )}
            {analytics?.active_users_count !== null && analytics?.active_users_count !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{analytics.active_users_count}</span>
              </div>
            )}
          </div>
          {/* Action button if needed */}
        </CardFooter>
      </Card>
    </Link>
  );
});