// FILE: src/components/common/MultiSelectCommand.tsx

import React, { useState } from 'react';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Icons
import {
  ChevronsUpDown,
  Check,
} from 'lucide-react';

interface MultiSelectCommandProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (value: string) => void;
}

export function MultiSelectCommand({ label, options, selectedValues, onSelect }: MultiSelectCommandProps) {
  const [open, setOpen] = useState(false);

  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label)
    .slice(0, 2)
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
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-0" />
          <CommandList>
            <CommandEmpty className="py-6 text-center ">No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem key={option.value} onSelect={() => onSelect(option.value)}>
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