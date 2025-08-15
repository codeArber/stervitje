// FILE: src/routes/_layout/plans/$planId/edit.tsx

// ... your existing imports, including Zod, react-hook-form, etc. ...
import { useAddSetMutation } from '@/api/plan';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';


// --- NEW Sub-component for Adding a Set ---
export const AddSetDialog = ({ planId, planSessionExerciseId, nextSetNumber }: {
  planId: string;
  planSessionExerciseId: string;
  nextSetNumber: number;
}) => {
  const [open, setOpen] = useState(false);
  const { mutate: addSet, isPending } = useAddSetMutation();

  // Define the validation schema for our new set form
  const formSchema = z.object({
    target_reps: z.coerce.number().min(1, 'Reps must be at least 1').optional(),
    target_weight: z.coerce.number().min(0, 'Weight must be positive').optional(),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_reps: 8, // Sensible default
      target_weight: undefined,
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addSet(
      {
        planId,
        plan_session_exercise_id: planSessionExerciseId,
        set_number: nextSetNumber,
        target_reps: values.target_reps,
        target_weight: values.target_weight,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          setOpen(false); // Close the dialog on success
          form.reset();   // Reset the form for next time
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-3">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Set
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Set</DialogTitle>
          <DialogDescription>
            Define the targets for Set #{nextSetNumber}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_reps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reps</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RPE 8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Set'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};