// FILE: src/components/exercise/ExerciseCard.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';

// --- Types ---
import type { ExerciseWithMusclesAndTags } from '@/types/exercise';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Icons
import {
  ArrowRight,
  Dumbbell, // For Equipment tag icon
  Target,   // For Movement Pattern tag icon
  Brain,    // For Mental Attribute tag icon
} from 'lucide-react';
import { getExerciseImageUrl } from '@/types/storage';
import ExerciseMuscleDiagram from '../ExerciseMuscleDiagram';

// --- Utility Function ---

// --- Reusable Component ---

interface ExerciseCardProps {
  exercise: ExerciseWithMusclesAndTags;
}

export const ExerciseCard = React.memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
  const movementPatternTags = exercise.tags?.filter(t => t.tag_type === 'movement_pattern');
  const equipmentTags = exercise.tags?.filter(t => t.tag_type === 'equipment' && t.name !== 'None');
  const mentalTags = exercise.tags?.filter(t => t.tag_type === 'mental_attribute');

  const imageUrl = getExerciseImageUrl(exercise.image_url);

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

  return (
    <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.id }}>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-muted/90 backdrop-blur-sm hover:scale-[1.02] overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 overflow-hidden">
            {/* Background layer */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-md scale-110 "
              style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>

            {/* Main image */}
            <img
              src={imageUrl}
              alt={exercise.name}
              className="relative z-10 w-full h-full object-contain"
            />

            {/* Glass Panel for Muscles - Only show if muscles exist */}
            {exercise.muscles && exercise.muscles.length > 0 && (
              <div className="absolute top-1/2 transform right-2 -translate-y-1/2 w-fit h-fit z-30">
                <div className="w-full h-full bg-white/15 backdrop-blur-md rounded-lg border border-white/30 shadow-lg">
                  <div className='w-full h-full p-1 flex items-center justify-center'>
                    <ExerciseMuscleDiagram muscles={exercise.muscles} />
                  </div>
                </div>
              </div>
            )}

            {/* Difficulty Badge */}
            {exercise.difficulty_level !== null && (
              <div className="absolute top-4 left-4 z-20">
                <Badge className={`${getDifficultyColor(exercise.difficulty_level)} border font-semibold px-3 py-1`}>
                  {getDifficultyLabel(exercise.difficulty_level)}
                </Badge>
              </div>
            )}

            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Title and Arrow */}
            <div className="flex items-start justify-between">
              <Label className='group-hover:text-white transition-colors line-clamp-2' variant={'sectionTitle'}>
                {exercise.name}
              </Label>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </div>
            {/* Tags Section */}
            <div className="flex flex-col gap-1">
              {movementPatternTags && movementPatternTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>Movement Patterns</Label>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {movementPatternTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold"
                      >
                        <Target className="w-2.5 h-2.5 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {equipmentTags && equipmentTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>Equipment</Label>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {equipmentTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-2 py-0.5 text-xs font-semibold"
                      >
                        <Dumbbell className="w-2.5 h-2.5 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mentalTags && mentalTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>Mental Attributes</Label>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {mentalTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20 px-2 py-0.5 text-xs font-semibold"
                      >
                        <Brain className="w-2.5 h-2.5 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});