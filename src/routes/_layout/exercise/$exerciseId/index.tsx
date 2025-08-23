// FILE: /src/routes/_layout/exercise/$exerciseId.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useExerciseDetailsQuery } from '@/api/exercise';
import type { ExerciseMuscleWithEngagement, Tag } from '@/types/exercise';

// shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  Youtube,
  Dumbbell,
  Zap,
  BrainCircuit,
  Atom,
  Heart,
  Activity,
  Target,
  ArrowLeft,
  Star,
  Trophy,
  Sparkles,
  Play,
  User,
  Search,
  Home,
  Swords
} from 'lucide-react';
import { Breadcrumb as TopNavigation } from '@/components/new/TopNavigation';

// Body Highlighter
import Model from 'react-body-highlighter';
import { getExerciseImageUrl } from '@/types/storage';
import { Label } from '@/components/ui/label';
import ExerciseMuscleDiagramDetailed from '@/components/new/exercise/ExerciseMuscleDiagramDetailed';
import { InstructionsFormatterCompact } from '@/components/new/exercise/ExerciseInstructions';

export const Route = createFileRoute('/_layout/exercise/$exerciseId/')({
  component: ExerciseDetailPage,
});

// --- The Main Page Component ---
function ExerciseDetailPage() {
  const { exerciseId } = Route.useParams();
  const { data: exerciseData, isLoading, isError, error } = useExerciseDetailsQuery(exerciseId);

  if (isLoading) {
    return <ExerciseDetailSkeleton />;
  }

  if (isError || !exerciseData) {
    return (
      <div className="min-h-screen container items-center flex w-full">
        <div className="container max-w-4xl py-16">
          <Card className="border-red-200 bg-blue-50/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-blue-800">Exercise Not Found</h1>
              <p className="text-blue-600 text-lg">{error?.message || "The requested exercise could not be loaded."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { exercise, muscles, tags, references } = exerciseData;
  const imageUrl = getExerciseImageUrl(exercise.image_url);

  // Helper to filter tags by their type for clean rendering
  const getTagsByType = (type: string) => tags?.filter(tag => tag.tag_type === type) || [];
  const equipmentTags = getTagsByType('equipment');
  const movementTags = getTagsByType('movement_pattern');
  const mentalTags = getTagsByType('mental_attribute');

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-700 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 3: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 4: return 'bg-red-100 text-red-700 border-red-200';
      case 5: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: number) => {
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
    <div className="min-h-screen ">
      <TopNavigation
        items={[
        { label: 'Home', href: '/', icon: Home },
          { label: "Exercises", href: "/exercise", icon: Swords },
          { label: exercise?.name } // Last item has no href (current page)
        ]}
      />

      <div className="w-full" >
        <main className="space-y-8">
          {/* Hero Section */}
          <Card className="border-0 shadow-xl bg-muted backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0 ">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 ">
                {/* Image Section */}
                <div className="relative h-80 lg:h-96 bg-gradient-to-br from-slate-100 to-slate-200">
                  <img
                    src={imageUrl}
                    alt={`Image of ${exercise.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-6 right-6">
                    <Badge className={`${getDifficultyColor(exercise.difficulty_level)} border-2 font-bold px-4 py-2 text-lg shadow-lg`}>
                      <Trophy className="w-4 h-4 mr-2" />
                      {getDifficultyLabel(exercise.difficulty_level)}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="py-4 pl-4 pr-1 lg:py-8 lg:pl-8 lg:pr-2 space-y-4 h-full ">
                  <div className="flex flex-row justify-between gap-2 h-full">
                    <div className="flex flex-col ">

                      <div className="space-y-4 pb-4">
                        <Label variant={'exerciseTitleBig'}>{exercise.name}</Label>
                        <div>
                          {exercise.description && (
                            <Label variant={'exerciseTitle'} className='font-normal text-md'>
                              {exercise.description}
                            </Label>
                          )}
                        </div>

                      </div>
                      <InstructionsFormatterCompact instructions={exercise.instructions} />

                    </div>

                    {muscles && muscles.length > 0 && (
                      <ExerciseMuscleDiagramDetailed muscles={muscles} />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          {exercise.instructions && (
            <Card className="border-0 shadow-xl bg-muted backdrop-blur-sm">
              <CardHeader className='pt-1.5'>

              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-4'>
                <div>

                  {/* Quick Tags */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <Label variant={'exerciseTitle'}>Movement Pattern</Label>
                      <div className="flex flex-row gap-2 items-center">
                        {movementTags.slice(0, 2).map(tag => (
                          <Badge key={tag.id} className="bg-emerald-100 w-fit text-emerald-700 border-emerald-200 px-3 py-1">
                            <Target className="w-3 h-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label variant={'exerciseTitle'}>Equipment</Label>
                      <div className="flex flex-row gap-2 items-center">
                        {equipmentTags.slice(0, 2).map(tag => (
                          <Badge key={tag.id} className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                            <Dumbbell className="w-3 h-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label variant={'exerciseTitle'}>Mental Tags</Label>
                      <div className="flex flex-row gap-2 items-center">
                        {mentalTags.slice(0, 1).map(tag => (
                          <Badge key={tag.id} className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                            <BrainCircuit className="w-3 h-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label variant={'sectionTitle'} className='text-md'>
                    Video References
                  </Label>
                  {references && references.length > 0 && (
                    <div className="space-y-2">
                      {references.map((ref) => (
                        <a
                          key={ref.id}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex w-fit items-center gap-4 p-4 rounded-xl border border-slate-200/50 bg-transparent backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/50"
                        >
                          <div className="p-2 rounded-lg transition-colors">
                            <Youtube className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Label>
                              {ref.title || 'Watch on YouTube'}
                            </Label>
                            <p className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                              Click to watch tutorial
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Enhanced Sub-components ---

// Helper function to map your database muscle names to react-body-highlighter muscle names
function mapMuscleToHighlighter(muscleName: string): string | null {
  const muscleMap: Record<string, string> = {
    // Head/Neck
    'head': 'head',
    'neck': 'neck',

    // Upper Body
    'chest': 'chest',
    'upper-back': 'upper-back',
    'lower-back': 'lower-back',
    'trapezius': 'trapezius',
    'front-deltoids': 'front-deltoids',
    'back-deltoids': 'back-deltoids',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'forearm': 'forearm',

    // Core
    'abs': 'abs',
    'obliques': 'obliques',

    // Lower Body
    'gluteal': 'gluteal',
    'adductor': 'adductor',
    'hamstring': 'hamstring',
    'quadriceps': 'quadriceps',
    'abductors': 'abductors',
    'calves': 'calves'
  };

  return muscleMap[muscleName] || null;
}

function EnhancedMusclesCard({ muscles }: { muscles: ExerciseMuscleWithEngagement[] }) {
  const primary = muscles.filter(m => m.engagement === 'primary');
  const secondary = muscles.filter(m => m.engagement === 'secondary');
  const stabilizers = muscles.filter(m => m.engagement === 'stabilizer');

  // Create muscle data for the body highlighter
  const createMuscleData = () => {
    const muscles: string[] = [];

    // Add all muscles to the muscles array
    [...primary, ...secondary, ...stabilizers].forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        muscles.push(mappedMuscle);
      }
    });

    // Return the data structure expected by react-body-highlighter
    return {
      muscles,
    };
  };

  const muscleData = createMuscleData();

  // Create custom styles for different muscle types
  const createCustomStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    primary.forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        styles[`[data-name="${mappedMuscle}"]`] = {
          fill: '#ef4444 !important', // red-500
          stroke: '#dc2626 !important', // red-600
          strokeWidth: '2px !important'
        };
      }
    });

    secondary.forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        styles[`[data-name="${mappedMuscle}"]`] = {
          fill: '#f97316 !important', // orange-500
          stroke: '#ea580c !important', // orange-600
          strokeWidth: '1.5px !important'
        };
      }
    });

    stabilizers.forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        styles[`[data-name="${mappedMuscle}"]`] = {
          fill: '#6b7280 !important', // gray-500
          stroke: '#4b5563 !important', // gray-600
          strokeWidth: '1px !important'
        };
      }
    });

    return styles;
  };

  return (
    <div className="space-y-8">
      {/* Body Diagram Card */}
      {muscleData.muscles && muscleData.muscles.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              Muscle Activation Map
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                Interactive Diagram
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Body Diagram */}
              <div className="flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mx-auto">
                <div className="muscle-diagram-container flex flex-row">
                  <Model
                    data={muscleData}
                    style={{
                      width: "300px",
                      height: "400px"
                    }}

                  />
                  <Model
                    data={muscleData}
                    style={{
                      width: "300px",
                      height: "400px"
                    }}
                    type='posterior'
                  />
                  <style jsx>{`
                    .muscle-diagram-container svg [data-name] {
                      cursor: pointer;
                      transition: all 0.2s ease;
                    }
                    .muscle-diagram-container svg [data-name]:hover {
                      filter: brightness(1.1);
                      stroke-width: 3px !important;
                    }
                    ${primary.map(muscle => {
                    const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
                    return mappedMuscle ? `
                        .muscle-diagram-container svg [data-name="${mappedMuscle}"] {
                          fill: #ef4444 !important;
                          stroke: #dc2626 !important;
                          stroke-width: 2px !important;
                        }
                      ` : '';
                  }).join('')}
                    ${secondary.map(muscle => {
                    const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
                    return mappedMuscle ? `
                        .muscle-diagram-container svg [data-name="${mappedMuscle}"] {
                          fill: #f97316 !important;
                          stroke: #ea580c !important;
                          stroke-width: 1.5px !important;
                        }
                      ` : '';
                  }).join('')}
                    ${stabilizers.map(muscle => {
                    const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
                    return mappedMuscle ? `
                        .muscle-diagram-container svg [data-name="${mappedMuscle}"] {
                          fill: #6b7280 !important;
                          stroke: #4b5563 !important;
                          stroke-width: 1px !important;
                        }
                      ` : '';
                  }).join('')}
                  `}</style>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-4 min-w-0">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Color Legend</h4>
                <div className="space-y-3">
                  {primary.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-600"></div>
                      <span className="font-semibold text-slate-800">Primary Muscles</span>
                      <div className="flex flex-wrap gap-2 ml-2">
                        {primary.slice(0, 3).map(m => (
                          <Badge key={m.muscle} className="bg-red-100 text-red-700 text-xs capitalize">
                            {m.muscle.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                        {primary.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{primary.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {secondary.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-orange-600"></div>
                      <span className="font-semibold text-slate-800">Secondary Muscles</span>
                      <div className="flex flex-wrap gap-2 ml-2">
                        {secondary.slice(0, 3).map(m => (
                          <Badge key={m.muscle} className="bg-orange-100 text-orange-700 text-xs capitalize">
                            {m.muscle.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                        {secondary.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{secondary.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {stabilizers.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-gray-600"></div>
                      <span className="font-semibold text-slate-800">Stabilizer Muscles</span>
                      <div className="flex flex-wrap gap-2 ml-2">
                        {stabilizers.slice(0, 3).map(m => (
                          <Badge key={m.muscle} className="bg-gray-100 text-gray-700 text-xs capitalize">
                            {m.muscle.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                        {stabilizers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{stabilizers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> The diagram shows which muscles are activated during this exercise.
                    Red indicates primary muscles, orange shows secondary muscles, and gray represents stabilizers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Muscles Card */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <Atom className="h-6 w-6 text-white" />
            </div>
            Detailed Muscle Breakdown
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
              {muscles.length} muscle{muscles.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {primary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <p className="text-lg font-bold text-slate-800">Primary Muscles</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {primary.map(m => (
                  <Badge key={m.muscle} className="bg-red-100 text-red-700 border-red-200 px-4 py-2 text-base font-semibold capitalize hover:bg-red-200 transition-colors">
                    {m.muscle.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {secondary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <p className="text-lg font-bold text-slate-800">Secondary Muscles</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {secondary.map(m => (
                  <Badge key={m.muscle} variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 text-base font-semibold capitalize hover:bg-orange-200 transition-colors">
                    {m.muscle.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {stabilizers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-500" />
                <p className="text-lg font-bold text-slate-800">Stabilizer Muscles</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {stabilizers.map(m => (
                  <Badge key={m.muscle} variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 px-4 py-2 text-base font-semibold capitalize hover:bg-slate-100 transition-colors">
                    {m.muscle.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EnhancedTagsCard({
  title,
  tags,
  icon,
  gradient,
  badgeStyle
}: {
  title: string;
  tags: Tag[];
  icon: React.ReactNode;
  gradient: string;
  badgeStyle: string;
}) {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl`}>
            {icon}
          </div>
          {title}
          <Badge variant="outline" className={`${badgeStyle} border-2`}>
            {tags.length} item{tags.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              className={`${badgeStyle} px-4 py-2 text-base font-semibold capitalize border-2 hover:shadow-md transition-all duration-200`}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Enhanced Skeleton Component ---
const ExerciseDetailSkeleton = () => (
  <div className="min-h-screen">
    <div className="container max-w-6xl p-6">
      {/* Breadcrumb Skeleton */}
      <Card className="mb-8 border-0 shadow-lg bg-muted/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>

      <main className="space-y-8">
        {/* Hero Skeleton */}
        <Card className="border-0 shadow-xl bg-muted/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <Skeleton className="h-80 lg:h-96 w-full" />
              <div className="p-8 lg:p-12 space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Skeleton */}
        <Card className="border-0 shadow-xl bg-muted/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </main>
    </div>
  </div>
);