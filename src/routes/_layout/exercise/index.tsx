// FILE: /src/routes/_layout/exercise/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

// API & Types
import { useFilteredExercisesQuery } from '@/api/exercise';
import type { ExerciseWithMuscles } from '@/types/exercise';
import type { Database } from '@/types/database.types';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Icons
import {
  Search,
  ArrowRight,
  ChevronsUpDown,
  Check,
  Filter,
  Brain,
  Dumbbell,
  Target,
  Trophy,
  Activity,
  Zap,
  Heart,
  Star,
  ChevronDown,
  Settings2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { ExerciseFilters } from '@/api/exercise/endpoint';
import { useTagsQuery } from '@/api/plan';
import { getExerciseImageUrl } from '@/types/storage';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

type MuscleGroupEnum = Database['public']['Enums']['muscle_group_enum'];

export const Route = createFileRoute('/_layout/exercise/')({
  component: ExerciseListPage,
});

function ExerciseListPage() {
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);
  const apiFilters = { ...filters, searchTerm: debouncedSearchTerm };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6">


        {/* Enhanced Filters Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex flex-col justify-between items-center mb-4">
                <div className="flex items-center gap-3 flex flex-col">
                  <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm w-full">
                    <CardContent className="p-6 w-full">
                      <Breadcrumb w-full>
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
                        
                        </BreadcrumbList>
                      </Breadcrumb>
                    </CardContent>
                  </Card>
                  <div className='flex flex-row gap-4'>
                    
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                    <Settings2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Smart Filters</h3>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {filtersOpen && (
                <div className="border-t border-slate-200 pt-6">
                  <ExerciseFiltersPanel filters={filters} setFilters={setFilters} />
                </div>
              )}
            </div>
          </Card>
        </div>

        <main>
          <ExerciseResultsGrid filters={apiFilters} />
        </main>
      </div>
    </div>
  );
}

// --- Sub-components for the Page ---

const allMuscleGroups: MuscleGroupEnum[] = ["trapezius", "upper-back", "lower-back", "chest", "biceps", "triceps", "forearm", "back-deltoids", "front-deltoids", "abs", "obliques", "adductor", "hamstring", "quadriceps", "abductors", "calves", "gluteal", "head", "neck"];

function ExerciseFiltersPanel({ filters, setFilters }: { filters: ExerciseFilters; setFilters: React.Dispatch<React.SetStateAction<ExerciseFilters>> }) {
  const { data: equipmentTags } = useTagsQuery('equipment');
  const { data: movementTags } = useTagsQuery('movement_pattern');
  const { data: mentalTags } = useTagsQuery('mental_attribute');
  const { data: sportTags } = useTagsQuery('sport');

  const handleTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.tagIds || [];
      const newTags = isChecked ? [...currentTags, tagId] : currentTags.filter(id => id !== tagId);
      return { ...prev, tagIds: newTags.length > 0 ? newTags : undefined };
    });
  };

  const handleMuscleGroupChange = (muscle: MuscleGroupEnum, isChecked: boolean) => {
    setFilters(prev => {
      const currentMuscles = prev.muscleGroups || [];
      const newMuscles = isChecked ? [...currentMuscles, muscle] : currentMuscles.filter(m => m !== muscle);
      return { ...prev, muscleGroups: newMuscles.length > 0 ? newMuscles : undefined };
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          id="search"
          placeholder="Search exercises... (e.g., Squat, Meditation, Deadlift)"
          value={filters.searchTerm || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="pl-12 h-12 text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FilterCard
          icon={<Activity className="w-5 h-5" />}
          title="Muscle Groups"
          color="from-red-500 to-pink-500"
          component={
            <MultiSelectCommand
              label="Muscle Groups"
              options={allMuscleGroups.sort().map(m => ({ value: m, label: m.replace(/-/g, ' ') }))}
              selectedValues={filters.muscleGroups || []}
              onSelect={(value) => handleMuscleGroupChange(value as MuscleGroupEnum, !(filters.muscleGroups?.includes(value as MuscleGroupEnum)))}
            />
          }
        />

        <FilterCard
          icon={<Dumbbell className="w-5 h-5" />}
          title="Equipment"
          color="from-blue-500 to-cyan-500"
          component={
            <MultiSelectCommand
              label="Equipment"
              options={equipmentTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.tagIds?.map(String) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Target className="w-5 h-5" />}
          title="Movement Patterns"
          color="from-emerald-500 to-teal-500"
          component={
            <MultiSelectCommand
              label="Movement Pattern"
              options={movementTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.tagIds?.map(String) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Brain className="w-5 h-5" />}
          title="Mental Attributes"
          color="from-purple-500 to-violet-500"
          component={
            <MultiSelectCommand
              label="Mental Attributes"
              options={mentalTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.tagIds?.map(String) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />
      </div>
    </div>
  );
}

function FilterCard({ icon, title, color, component }: {
  icon: React.ReactNode;
  title: string;
  color: string;
  component: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 bg-gradient-to-r ${color} rounded-lg text-white`}>
          {icon}
        </div>
        <Label className="text-sm font-semibold text-slate-700">{title}</Label>
      </div>
      {component}
    </div>
  );
}

function ExerciseResultsGrid({ filters }: { filters: ExerciseFilters }) {
  const { data: exercises, isLoading, isError, error } = useFilteredExercisesQuery(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => <ExerciseCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">No exercises found</h3>
          <p className="text-slate-500 text-lg">Try adjusting your filters or search terms to discover more exercises.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">
          Found {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        </h2>
        <Badge variant="outline" className="bg-white border-slate-300 text-slate-600">
          <Star className="w-4 h-4 mr-1" />
          Curated Collection
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map(exercise => <ExerciseCard key={exercise.id} exercise={exercise} />)}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseWithMuscles }) {
  const primaryMuscles = exercise.muscles?.filter(m => m.engagement === 'primary').map(m => m.muscle);
  const secondaryMuscles = exercise.muscles?.filter(m => m.engagement === 'secondary').map(m => m.muscle);
  const movementPatternTags = exercise.tags?.filter(t => t.tag_type === 'movement_pattern');
  const equipmentTags = exercise.tags?.filter(t => t.tag_type === 'equipment' && t.name !== 'None');
  const mentalTags = exercise.tags?.filter(t => t.tag_type === 'mental_attribute');

  const imageUrl = getExerciseImageUrl(exercise.image_url);

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
    <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.id }}>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] overflow-hidden">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            <img
              src={imageUrl}
              alt={exercise.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`${getDifficultyColor(exercise.difficulty_level)} border font-semibold px-3 py-1`}>
                {getDifficultyLabel(exercise.difficulty_level)}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Title and Arrow */}
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {exercise.name}
              </h3>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </div>

            {/* Tags Section */}
            <div className="flex flex-wrap gap-2">
              {movementPatternTags?.map(tag => (
                <Badge key={tag.id} className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                  <Target className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
              {equipmentTags?.map(tag => (
                <Badge key={tag.id} className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                  <Dumbbell className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
              {mentalTags?.map(tag => (
                <Badge key={tag.id} className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                  <Brain className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Muscle Groups */}
            {exercise.muscles && (
              <div className="space-y-2 text-sm">
                {primaryMuscles && primaryMuscles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-slate-700">Primary:</span>
                    <span className="text-slate-600 capitalize">
                      {primaryMuscles.join(', ').replace(/-/g, ' ')}
                    </span>
                  </div>
                )}
                {secondaryMuscles && secondaryMuscles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Secondary:</span>
                    <span className="text-slate-500 capitalize">
                      {secondaryMuscles.join(', ').replace(/-/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ExerciseCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-48 w-full" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MultiSelectCommand({ label, options, selectedValues, onSelect }: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label)
    .slice(0, 2) // Show max 2 labels
    .join(', ');

  const remainingCount = selectedValues.length - 2;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 font-normal border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
        >
          <span className="truncate text-left">
            {selectedValues.length > 0 ? (
              <span>
                {selectedLabels}
                {remainingCount > 0 && (
                  <span className="ml-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                    +{remainingCount}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500">Select {label.toLowerCase()}...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-2 border-slate-200 shadow-xl">
        <Command className="bg-white">
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-0" />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-slate-500">No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem key={option.value} onSelect={() => onSelect(option.value)} className="hover:bg-slate-100">
                  <Check className={`mr-3 h-4 w-4 ${selectedValues.includes(option.value) ? "opacity-100 text-blue-600" : "opacity-0"}`} />
                  <span className="capitalize font-medium">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}