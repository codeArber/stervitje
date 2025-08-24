// FILE: src/components/exercise/ExerciseFiltersPanel.tsx

import React from 'react';
import { useState } from 'react'; // Keep useState for internal popover management
import type { Database } from '@/types/database.types'; // Still needed for MuscleGroupEnum
import type { Tag } from '@/types/index'; // Import Tag type centrally

// shadcn/ui components
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';

// Icons
import {
  Check,
  Activity,
  Star,
  ChevronsUpDown,
  X, // For Clear Selection
  Dumbbell, // For Equipment tag icon
  Target,   // For Movement Pattern tag icon
  Brain,    // For Mental Attribute tag icon
} from 'lucide-react';

// --- API Hooks ---
import { useTagsQuery } from '@/api/plan/usePlan'; // Assuming usePlan.ts for tags query
import { SingleSelectCommand } from '../../common/SingleSelectCommand';
import { MultiSelectCommand } from '../../common/MultiSelectCommand';

// --- Local Types ---
type MuscleGroupEnum = Database['public']['Enums']['muscle_group_enum'];

// --- ExerciseFilters: Direct mapping to RPC parameters ---
// This should be the same interface as in your main route file and endpoint.
export interface ExerciseFilters {
  searchTerm?: string | null;
  muscleGroups?: MuscleGroupEnum[] | null;
  tagIds?: number[] | null; // This will now hold combined IDs from all tag categories
  difficultyLevel?: number | null;
  pageLimit?: number;
  pageOffset?: number;
}

const allMuscleGroups: MuscleGroupEnum[] = ["trapezius", "upper-back", "lower-back", "chest", "biceps", "triceps", "forearm", "back-deltoids", "front-deltoids", "abs", "obliques", "adductor", "hamstring", "quadriceps", "abductors", "calves", "gluteal", "head", "neck"];

interface ExerciseFiltersPanelProps {
  filters: ExerciseFilters;
  setFilters: React.Dispatch<React.SetStateAction<ExerciseFilters>>;
}

export function ExerciseFiltersPanel({ filters, setFilters }: ExerciseFiltersPanelProps) {
  // Use useTagsQuery for each category, as they are used to populate filter options.
  const { data: equipmentTags } = useTagsQuery('equipment');
  const { data: movementTags } = useTagsQuery('movement_pattern');
  const { data: mentalTags } = useTagsQuery('mental_attribute');

  // Helper to manage the single `tagIds` array in the parent state
  const handleTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.tagIds || [];
      const newTags = isChecked
        ? [...currentTags, tagId]
        : currentTags.filter(id => id !== tagId);
      // Ensure the array is undefined if empty, to match RPC's optional params
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

  const handleDifficultyLevelChange = (level: number | null | undefined) => {
    setFilters(prev => ({ ...prev, difficultyLevel: level }));
  };

  const DIFFICULTY_OPTIONS = [
    { value: 1, label: '1 (Beginner)' },
    { value: 2, label: '2 (Easy)' },
    { value: 3, label: '3 (Moderate)' },
    { value: 4, label: '4 (Hard)' },
    { value: 5, label: '5 (Expert)' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <FilterCard
          icon={<Activity className="w-4 h-4" />}
          title="Muscle Groups"
          color="from-pink-500 to-rose-500"
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
          color="from-blue-500 to-indigo-500"
          component={
            <MultiSelectCommand
              label="Equipment"
              options={equipmentTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              // Filter `filters.tagIds` to only show selected tags relevant to *this* category's options
              selectedValues={filters.tagIds?.map(String).filter(id => equipmentTags?.some(t => t.id === Number(id))) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Target className="w-4 h-4" />}
          title="Movement Patterns"
          color="from-green-500 to-emerald-500"
          component={
            <MultiSelectCommand
              label="Movement Pattern"
              options={movementTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.tagIds?.map(String).filter(id => movementTags?.some(t => t.id === Number(id))) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Brain className="w-4 h-4" />}
          title="Mental Attributes"
          color="from-purple-500 to-fuchsia-500"
          component={
            <MultiSelectCommand
              label="Mental Attributes"
              options={mentalTags?.map(t => ({ value: t.id.toString(), label: t.name })) || []}
              selectedValues={filters.tagIds?.map(String).filter(id => mentalTags?.some(t => t.id === Number(id))) || []}
              onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
            />
          }
        />

        <FilterCard
          icon={<Star className="w-4 h-4" />}
          title="Difficulty"
          color="from-yellow-500 to-amber-500"
          component={
            <SingleSelectCommand
              label="Difficulty Level"
              options={DIFFICULTY_OPTIONS.map(d => ({ value: String(d.value), label: d.label }))}
              selectedValue={filters.difficultyLevel?.toString()}
              onSelect={(value) => handleDifficultyLevelChange(Number(value))}
              clearSelection={() => handleDifficultyLevelChange(undefined)}
            />
          }
        />
      </div>
    </div>
  );
}

// Reusable FilterCard component (now defined here or in a common place)
interface FilterCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  component: React.ReactNode;
}

function FilterCard({ icon, title, color, component }: FilterCardProps) {
  return (
    <Card className="p-4 flex flex-col gap-3 shadow-sm border border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-foreground">
        <div className={`p-1 ${color} rounded-lg text-white`}>
          {icon}
        </div>
        <Label className="text-sm font-semibold">{title}</Label>
      </div>
      {component}
    </Card>
  );
}