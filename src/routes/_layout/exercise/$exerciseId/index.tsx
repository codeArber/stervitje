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
  Play
} from 'lucide-react';
import { getExerciseImageUrl } from '@/types/storage';

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
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className=" p-6 w-full">
          <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-red-800">Exercise Not Found</h1>
              <p className="text-red-600 text-lg">{error?.message || "The requested exercise could not be loaded."}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-6xl py-8">
        {/* Enhanced Breadcrumb Navigation */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Breadcrumb>
              <BreadcrumbList className="text-lg">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/exercise" className="text-slate-600 hover:text-blue-600 transition-colors">
                      Exercises
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-slate-800">{exercise.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        <main className="space-y-8">
          {/* Hero Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
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
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium Exercise
                      </Badge>
                    </div>
                    
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {exercise.name}
                    </h1>

                    {exercise.description && (
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {exercise.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Tags */}
                  <div className="flex flex-wrap gap-3">
                    {movementTags.slice(0, 2).map(tag => (
                      <Badge key={tag.id} className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                        <Target className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                    {equipmentTags.slice(0, 2).map(tag => (
                      <Badge key={tag.id} className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                        <Dumbbell className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                    {mentalTags.slice(0, 1).map(tag => (
                      <Badge key={tag.id} className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                        <BrainCircuit className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          {exercise.instructions && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  Exercise Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-line text-slate-700 leading-relaxed">
                  {exercise.instructions}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {muscles && muscles.length > 0 && <EnhancedMusclesCard muscles={muscles} />}
            {equipmentTags.length > 0 && (
              <EnhancedTagsCard 
                title="Equipment" 
                tags={equipmentTags} 
                icon={<Dumbbell className="h-6 w-6 text-white" />}
                gradient="from-blue-500 to-cyan-500"
                badgeStyle="bg-blue-100 text-blue-700 border-blue-200"
              />
            )}
            {movementTags.length > 0 && (
              <EnhancedTagsCard 
                title="Movement Pattern" 
                tags={movementTags} 
                icon={<Zap className="h-6 w-6 text-white" />}
                gradient="from-emerald-500 to-teal-500"
                badgeStyle="bg-emerald-100 text-emerald-700 border-emerald-200"
              />
            )}
            {mentalTags.length > 0 && (
              <EnhancedTagsCard 
                title="Mental Focus" 
                tags={mentalTags} 
                icon={<BrainCircuit className="h-6 w-6 text-white" />}
                gradient="from-purple-500 to-violet-500"
                badgeStyle="bg-purple-100 text-purple-700 border-purple-200"
              />
            )}
          </div>

          {/* Video References */}
          {references && references.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  Video References
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    {references.length} video{references.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {references.map((ref) => (
                    <a 
                      key={ref.id} 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="p-3 bg-red-100 group-hover:bg-red-200 rounded-xl transition-colors">
                        <Youtube className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-800 group-hover:text-red-700 transition-colors truncate">
                          {ref.title || 'Watch on YouTube'}
                        </p>
                        <p className="text-sm text-slate-500 group-hover:text-red-600 transition-colors">
                          Click to watch tutorial
                        </p>
                      </div>
                    </a>
                  ))}
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

function EnhancedMusclesCard({ muscles }: { muscles: ExerciseMuscleWithEngagement[] }) {
  const primary = muscles.filter(m => m.engagement === 'primary');
  const secondary = muscles.filter(m => m.engagement === 'secondary');
  const stabilizers = muscles.filter(m => m.engagement === 'stabilizer');

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
            <Atom className="h-6 w-6 text-white" />
          </div>
          Muscles Targeted
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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="container max-w-6xl py-8">
      {/* Breadcrumb Skeleton */}
      <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>

      <main className="space-y-8">
        {/* Hero Skeleton */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
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
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </main>
    </div>
  </div>
);