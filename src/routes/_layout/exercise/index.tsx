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
import { useTagsQuery } from '@/api/plan';
import { getExerciseImageUrl } from '@/types/storage';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Breadcrumb as TopNavigation } from '@/components/new/TopNavigation';
import ExerciseMuscleDiagram from '@/components/new/exercise/ExerciseMuscleDiagram';
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
    <div className="min-h-screen">
      <TopNavigation
        currentPath={location.pathname}
        rightContent={
          <ExerciseFiltersPanel
            filters={filters}
            setFilters={setFilters}
          />
        }
      />

      <div className="container mx-auto">
        <main>
          <ExerciseResultsGrid filters={apiFilters} />
        </main>
      </div>
    </div>
  );
}


const allMuscleGroups: MuscleGroupEnum[] = ["trapezius", "upper-back", "lower-back", "chest", "biceps", "triceps", "forearm", "back-deltoids", "front-deltoids", "abs", "obliques", "adductor", "hamstring", "quadriceps", "abductors", "calves", "gluteal", "head", "neck"];

// Update your ExerciseFilters type to separate tag categories
export interface ExerciseFilters {
  searchTerm?: string;
  muscleGroups?: MuscleGroupEnum[];
  equipmentTagIds?: number[];
  movementPatternTagIds?: number[];
  mentalAttributeTagIds?: number[];
  sportTagIds?: number[];
  // Remove the generic tagIds since we're separating by category
}

// Updated ExerciseFiltersPanel component
function ExerciseFiltersPanel({ filters, setFilters }: { filters: ExerciseFilters; setFilters: React.Dispatch<React.SetStateAction<ExerciseFilters>> }) {
  const { data: equipmentTags } = useTagsQuery('equipment');
  const { data: movementTags } = useTagsQuery('movement_pattern');
  const { data: mentalTags } = useTagsQuery('mental_attribute');
  const { data: sportTags } = useTagsQuery('sport');

  // Separate handlers for each tag category
  const handleEquipmentTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.equipmentTagIds || [];
      const newTags = isChecked ? [...currentTags, tagId] : currentTags.filter(id => id !== tagId);
      return { ...prev, equipmentTagIds: newTags.length > 0 ? newTags : undefined };
    });
  };

  const handleMovementPatternTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.movementPatternTagIds || [];
      const newTags = isChecked ? [...currentTags, tagId] : currentTags.filter(id => id !== tagId);
      return { ...prev, movementPatternTagIds: newTags.length > 0 ? newTags : undefined };
    });
  };

  const handleMentalAttributeTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.mentalAttributeTagIds || [];
      const newTags = isChecked ? [...currentTags, tagId] : currentTags.filter(id => id !== tagId);
      return { ...prev, mentalAttributeTagIds: newTags.length > 0 ? newTags : undefined };
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
    <div className="flex flex-col gap-2">
      {/* Search Bar */}
      <div className="relative flex flex-row items-center justify-end w-full">
        <div className="relative">
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
          <Input
            id="search"
            placeholder="Search exercises"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className='pl-10 w-[200px]'
          />
        </div>
      </div>

      {/* Filter Grid */}
      <div className="flex flex-row gap-2">
        <FilterCard
          icon={<Activity className="w-4 h-4" />}
          title="Muscle Groups"
          color=""
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
          icon={<Dumbbell className="w-4 h-4" />}
          title="Equipment"
          color=""
          component={
            <MultiSelectCommand
              label="Equipment"
              options={equipmentTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.equipmentTagIds?.map(String) || []}
              onSelect={(value) => handleEquipmentTagChange(Number(value), !(filters.equipmentTagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Target className="w-4 h-4" />}
          title="Movement Patterns"
          color=""
          component={
            <MultiSelectCommand
              label="Movement Pattern"
              options={movementTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.movementPatternTagIds?.map(String) || []}
              onSelect={(value) => handleMovementPatternTagChange(Number(value), !(filters.movementPatternTagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Brain className="w-4 h-4" />}
          title="Mental Attributes"
          color=""
          component={
            <MultiSelectCommand
              label="Mental Attributes"
              options={mentalTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.mentalAttributeTagIds?.map(String) || []}
              onSelect={(value) => handleMentalAttributeTagChange(Number(value), !(filters.mentalAttributeTagIds?.includes(Number(value))))}
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
    <div className="flex flex-row gap-2">
      <div className="flex items-center gap-2">
        <div className={`p-1 bg-gradient-to-r ${color} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
      {component}
    </div>
  );
}


function ExerciseCard({ exercise }: { exercise: ExerciseWithMuscles }) {
  // const primaryMuscles = exercise.muscles?.filter(m => m.engagement === 'primary').map(m => m.muscle); // No longer needed directly for text display
  // const secondaryMuscles = exercise.muscles?.filter(m => m.engagement === 'secondary').map(m => m.muscle); // No longer needed directly for text display
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
              <h3 className="text-xl font-bold ">
              </h3>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </div>
            {/* Redesigned Tags Section - Theme Aware */}
            <div className="flex flex-col gap-1">
              {/* Movement Patterns - Only show if there are items */}
              {movementPatternTags && movementPatternTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>
                    Movement Patterns
                  </Label>
                  <div className="flex flex-row gap-2">
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

              {/* Equipment - Only show if there are items */}
              {equipmentTags && equipmentTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>
                    Equipment
                  </Label>
                  <div className="flex flex-row gap-2">
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

              {/* Mental Attributes - Only show if there are items */}
              {mentalTags && mentalTags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label variant={'exerciseTitle'}>
                    Mental Attributes
                  </Label>
                  <div className="flex flex-row gap-2">
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
}

function ExerciseCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-48 w-full" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-2/4" />
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
          className="w-full justify-between font-normal border-slate-200"
        >
          <span className="truncate text-left text-xs">
            {selectedValues.length > 0 ? (
              <span>
                {selectedLabels}
                {remainingCount > 0 && (
                  <span className="ml-1 px-1 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                    +{remainingCount}
                  </span>
                )}
              </span>
            ) : (
              <span className="">Select {label.toLowerCase()}...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-2 w-2 shrink-0 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 border-2 shadow-xl">
        <Command className="">
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-0" />
          <CommandList>
            <CommandEmpty className="py-6 text-center ">No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem key={option.value} onSelect={() => onSelect(option.value)} className="">
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
        <Label variant={'sectionTitle'}>
          Found {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        </Label>

        <Badge variant="outline" className='px-2 py-1 !text-gray-400'>
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