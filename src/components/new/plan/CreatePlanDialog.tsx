// FILE: src/components/plans/CreatePlanDialog.tsx

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Icons
import { PlusCircle } from 'lucide-react';
import { useCreateBasicPlanMutation } from '@/api/plan';

// Types
interface CreatePlanDialogProps {
  teamId?: string;
}

interface CreatePlanFormData {
  title: string;
  description?: string;
  sport: string;
  difficulty_level: number;
  private: boolean;
}

// Define the validation schema for the form
const createPlanSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title must be less than 100 characters.'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters.')
    .optional(),
  sport: z
    .string()
    .min(2, 'Sport is required.')
    .max(50, 'Sport must be less than 50 characters.'),
  difficulty_level: z
    .number()
    .int()
    .min(1, 'Difficulty level must be at least 1.')
    .max(3, 'Difficulty level must be at most 3.'),
  private: z.boolean(),
});

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '1 (Beginner)' },
  { value: 2, label: '2 (Intermediate)' },
  { value: 3, label: '3 (Advanced)' },
] as const;

export function CreatePlanDialog({ teamId }: CreatePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: createPlan, isPending } = useCreateBasicPlanMutation();

  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      title: '',
      description: '',
      sport: '',
      difficulty_level: 1,
      private: true,
    },
  });

  const handleSubmit = (values: CreatePlanFormData) => {
    // Transform form data to match mutation parameters
    const mutationPayload = {
      p_title: values.title,
      p_description: values.description || null,
      p_difficulty_level: values.difficulty_level,
      p_private: values.private,
      p_team_id: teamId || null,
    };

    createPlan(mutationPayload, {
      onSuccess: (newPlan) => {
        handleSuccess(newPlan);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  const handleSuccess = (newPlan: any) => {
    setOpen(false);
    form.reset();
    navigate({ 
      to: '/workspace/$teamId/plans/$planId/edit', 
      params: { teamId: teamId || '', planId: newPlan.id } 
    });
  };

  const handleError = (error: Error) => {
    console.error('Failed to create plan:', error);
    // Toast notification is handled in the mutation hook
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 4-Week Strength Foundation" 
                      {...field} 
                    />
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
                    <Textarea 
                      placeholder="Describe the main goal of this plan..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
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
                  <FormLabel>Sport / Goal *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Powerlifting, General Fitness" 
                      {...field} 
                    />
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
                  <FormLabel>Difficulty Level *</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                      Private plans are only visible to you{teamId ? ' and your team' : ''}.
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}