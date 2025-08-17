// FILE: src/components/plans/CreatePlanDialog.tsx

import { useState } from 'react';
import { useCreatePlanMutation } from '@/api/plan';
import { useNavigate } from '@tanstack/react-router';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Form validation
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'; // <--- THE MISSING IMPORT
import { useForm } from 'react-hook-form';

// Icons
import { PlusCircle } from 'lucide-react';

// Define the validation schema for the form
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  sport: z.string().min(2, { message: 'Sport is required.' }),
  difficulty_level: z.coerce.number().min(1).max(3),
  private: z.boolean().default(true),
});
export function CreatePlanDialog({ teamId }: { teamId?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: createPlan, isPending } = useCreatePlanMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      sport: '',
      difficulty_level: 1,
      private: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // **UPDATED**: We now include the teamId in the payload sent to the mutation
    createPlan(
      {
        ...values,
        ...teamId && { team_id: teamId },
      },
      {
      onSuccess: (newPlan) => {
        setOpen(false);
        form.reset();
        // Navigate to the new plan's detail page or editor page
        navigate({ to: '/explore/plans/$planId', params: { planId: newPlan.id } });
      },
      onError: (error) => {
        console.error('Failed to create plan:', error);
        // You can add a user-facing error message here (e.g., using a toast library)
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Plan</DialogTitle>
          <DialogDescription>
            Set the foundation for your new training plan. You can add weeks, days, and exercises later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 4-Week Strength Foundation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the main goal of this plan..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport / Goal</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Powerlifting, General Fitness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 (Beginner)</SelectItem>
                      <SelectItem value="2">2 (Intermediate)</SelectItem>
                      <SelectItem value="3">3 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Private Plan</FormLabel>
                    <FormDescription>
                      Private plans are only visible to you.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}