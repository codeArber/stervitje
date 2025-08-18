// FILE: src/components/plan-editor/ExerciseSelectorDialog.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrollable list
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card'; // For exercise cards in list

// Icons
import { Search, Dumbbell, CheckCircle } from 'lucide-react';

// API Hooks & Types
import type { Exercise } from '@/types/exercise'; // Import Exercise and ExerciseFilters types
import { ExerciseFilters, fetchFilteredExercisesWithDetails } from '@/api/exercise/endpoint';

interface ExerciseSelectorDialogProps {
  onSelectExercise: (exerciseId: string, exerciseDetails: Exercise) => void;
  children: React.ReactNode; // The button that triggers the dialog
}

export const ExerciseSelectorDialog: React.FC<ExerciseSelectorDialogProps> = ({ onSelectExercise, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<ExerciseFilters>({ searchTerm: '' });

  // Use a debounced search term to avoid excessive API calls
  const debouncedSearchTerm = React.useRef<string>(searchTerm);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: debouncedSearchTerm.current }));
    }, 300); // Debounce by 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch exercises based on filters
  const { data: exercises, isLoading, isError, error } = useQuery<Exercise[], Error>({
    queryKey: ['exercises', 'filtered', filters],
    queryFn: () => fetchFilteredExercisesWithDetails(filters),
    enabled: isOpen, // Only fetch when dialog is open
    placeholderData: (prev) => prev,
  });

  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise.id, exercise);
    setIsOpen(false); // Close dialog on selection
    setSearchTerm(''); // Reset search term
    setFilters({ searchTerm: '' }); // Reset filters
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select an Exercise</DialogTitle>
          <DialogDescription>
            Search for an exercise to add to your session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search exercises by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedSearchTerm.current = e.target.value;
            }}
          />
          {/* Future: Add filter buttons here for muscle groups, tags, difficulty */}
        </div>

        <Separator />

        <ScrollArea className="flex-grow my-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-destructive text-center py-4">
              Error loading exercises: {error?.message}
            </div>
          ) : !exercises || exercises.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">
              No exercises found matching your search.
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map(exercise => (
                <Card key={exercise.id} className="p-3 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => handleSelect(exercise)}>
                  <div className="flex items-center gap-3">
                    <img
                      src={exercise.image_url || 'https://placehold.co/50x50?text=No+Img'}
                      alt={exercise.name}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{exercise.description}</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100" />
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};