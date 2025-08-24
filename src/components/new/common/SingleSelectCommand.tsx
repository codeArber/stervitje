// FILE: src/components/common/SingleSelectCommand.tsx

import React, { useState } from 'react';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Icons
import {
  ChevronsUpDown,
  Check,
  X // For Clear Selection
} from 'lucide-react';

interface SingleSelectCommandProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  clearSelection: () => void;
}

export function SingleSelectCommand({ label, options, selectedValue, onSelect, clearSelection }: SingleSelectCommandProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === selectedValue)?.label;

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
            {selectedValue ? selectedLabel : `Select ${label.toLowerCase()}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-2 w-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 border-2 shadow-xl">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-0" />
          <CommandList>
            <CommandEmpty className="py-6 text-center">No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-3 h-4 w-4 ${selectedValue === option.value ? "opacity-100 text-blue-600" : "opacity-0"}`} />
                  <span className="capitalize font-medium">{option.label}</span>
                </CommandItem>
              ))}
              {selectedValue !== undefined && (
                <>
                  <CommandSeparator />
                  <CommandItem onSelect={() => { clearSelection(); setOpen(false); }}>
                    <X className="mr-3 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Clear Selection</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}