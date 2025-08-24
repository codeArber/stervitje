// FILE: src/components/explore/plans/PlanFiltersPanel.tsx

import React from 'react';
import { useState } from 'react'; // Keep useState for internal popover management

// --- Types ---
import type { PlanFilters } from '@/types/plan'; // Your main filter type
import type { Tag } from '@/types/index';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Icons
import { Search } from 'lucide-react';

// --- API Hooks ---
import { useTagsQuery } from '@/api/plan/usePlan'; // Assuming usePlan.ts for tags query
import { SingleSelectCommand } from '../../common/SingleSelectCommand';
import { MultiSelectCommand } from '../../common/MultiSelectCommand';

// --- Reusable Filter Components ---
// --- NEW IMPORTS: MultiSelectCommand and SingleSelectCommand ---


interface PlanFiltersPanelProps {
  filters: PlanFilters;
  setFilters: React.Dispatch<React.SetStateAction<PlanFilters>>;
}

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '1 (Beginner)' },
  { value: 2, label: '2 (Easy)' },
  { value: 3, label: '3 (Moderate)' },
  { value: 4, label: '4 (Hard)' },
  { value: 5, label: '5 (Expert)' },
];

export function PlanFiltersPanel({ filters, setFilters }: PlanFiltersPanelProps) {
  const { data: equipmentTags, isLoading: isLoadingEquipment } = useTagsQuery('equipment');
  const { data: movementTags, isLoading: isLoadingMovement } = useTagsQuery('movement_pattern');
  const { data: mentalTags, isLoading: isLoadingMental } = useTagsQuery('mental_attribute');

  // Helper to manage the single `tagIds` array in the parent state
  const handleTagChange = (tagId: number, isChecked: boolean) => {
    setFilters(prev => {
      const currentTags = prev.tagIds || [];
      const newTags = isChecked
        ? [...currentTags, tagId]
        : currentTags.filter(id => id !== tagId);
      // We set pageOffset back to 0 when filters change
      return { ...prev, tagIds: newTags.length > 0 ? newTags : undefined, pageOffset: 0 };
    });
  };

  const handleDifficultyChange = (value: string) => {
    // If value is empty string (from Clear Selection), set difficultyLevel to undefined
    setFilters(prev => ({ ...prev, difficultyLevel: value === '' ? undefined : Number(value), pageOffset: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Search by Name */}
      <div>
        <Label htmlFor="plan-search">Search by Name</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="plan-search"
            placeholder="e.g., Strength Builder"
            className="pl-9"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value || undefined, pageOffset: 0 }))}
          />
        </div>
      </div>

      {/* Difficulty Level Filter - Now using SingleSelectCommand */}
      <div>
        <Label htmlFor="difficulty-select">Difficulty Level</Label>
        <SingleSelectCommand
          label="Difficulty Level"
          options={DIFFICULTY_OPTIONS.map(option => ({ value: String(option.value), label: option.label }))}
          selectedValue={filters.difficultyLevel?.toString()}
          onSelect={handleDifficultyChange}
          clearSelection={() => handleDifficultyChange('')} // Pass empty string to clear
        />
      </div>


      {/* Tags Accordion */}
      <Accordion type="multiple" defaultValue={['equipment', 'movement_pattern', 'mental_attribute']} className="w-full">
        {/* Equipment Tags - Now using MultiSelectCommand */}
        <AccordionItem value="equipment">
          <AccordionTrigger className="font-semibold">Equipment</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {isLoadingEquipment ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <MultiSelectCommand
                label="Equipment"
                options={equipmentTags?.map(tag => ({ value: String(tag.id), label: tag.name })) || []}
                // Filter `filters.tagIds` to only show selected tags relevant to *this* category's options
                selectedValues={filters.tagIds?.map(String).filter(id => equipmentTags?.some(t => t.id === Number(id))) || []}
                onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Movement Patterns Tags - Now using MultiSelectCommand */}
        <AccordionItem value="movement_pattern">
          <AccordionTrigger className="font-semibold">Movement Patterns</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {isLoadingMovement ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <MultiSelectCommand
                label="Movement Pattern"
                options={movementTags?.map(tag => ({ value: String(tag.id), label: tag.name })) || []}
                selectedValues={filters.tagIds?.map(String).filter(id => movementTags?.some(t => t.id === Number(id))) || []}
                onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Mental Attributes Tags - Now using MultiSelectCommand */}
        <AccordionItem value="mental_attribute">
          <AccordionTrigger className="font-semibold">Mental Attributes</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {isLoadingMental ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <MultiSelectCommand
                label="Mental Attributes"
                options={mentalTags?.map(tag => ({ value: String(tag.id), label: tag.name })) || []}
                selectedValues={filters.tagIds?.map(String).filter(id => mentalTags?.some(t => t.id === Number(id))) || []}
                onSelect={(value) => handleTagChange(Number(value), !(filters.tagIds?.includes(Number(value))))}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}