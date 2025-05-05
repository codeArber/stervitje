import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown, X } from 'lucide-react';
import { Database } from '@/lib/database.types';
import { useCreateExerciseMuscleGroup, useRemoveExerciseMuscleGroup } from '@/api/exercises';

/**
 * Represents a selected muscle record from the database
 */
type Selected = {
  created_at: string;
  exercise_id: string;
  id: string;
  muscle_group: Database['public']['Enums']['muscle_group_enum'];
};

interface MultiSelectProps {
  /** List of muscle-group option strings */
  options: string[];
  /** Array of selected records (with metadata) */
  selected: Selected[];
  /** Callback with new array of muscle_group strings */
  exerciseId: string
}

export const MultiSelectMuscleGroup: React.FC<MultiSelectProps> = ({ options, selected, exerciseId }) => {
  const [open, setOpen] = useState(false);
  // extract just the muscle_group strings for display and toggle logic
  const selectedGroups = selected.map((s) => s.muscle_group);
  const addMuscle = useCreateExerciseMuscleGroup()
  const removeMuscle = useRemoveExerciseMuscleGroup()

  const toggleSelection = (option: string) => {
    if (selectedGroups.includes(option)) {
      removeMuscle.mutate({ id: selected.find((s) => s.muscle_group === option)?.id || '', exerciseId: exerciseId })
    } else {
      addMuscle.mutate({
        muscleGroup: {
          muscle_group: option as Database['public']['Enums']['muscle_group_enum'],
          exercise_id: exerciseId
        }
      });
    }
  };

  return (
    <div className="w-full">
      <Label className="mb-1">Muscle Groups</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-fit">
            <span className="text-muted-foreground">Select muscle groups...</span>

            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search muscles..." />
            <CommandEmpty>No muscles found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedGroups.includes(opt);
                return (
                  <CommandItem
                    key={opt}
                    onSelect={() => toggleSelection(opt)}
                    className="flex items-center justify-between"
                  >
                    {opt}
                    {isSelected && <Check className="h-4 w-4" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-col gap-1 pt-4 ">
        {selectedGroups.length > 0 ? (
          selectedGroups.map((muscle) => (
            <span key={muscle} className="px-4 py-2 rounded-lg border text-sm flex items-center justify-between">
              {muscle}
              <X className="ml-2 h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" onClick={() => toggleSelection(muscle)} />
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">Select muscle groups...</span>
        )}
      </div>
    </div>
  );
};