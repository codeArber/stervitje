// FILE: src/components/teams/CreateTeamDialog.tsx
// Make sure you have zod, react-hook-form, and @hookform/resolvers/zod installed

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

// Form validation
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Icons
import { PlusCircle } from 'lucide-react';
import { useCreateTeamMutation } from '@/api/team';

// Define the validation schema for the form
const formSchema = z.object({
  name: z.string().min(3, { message: 'Team name must be at least 3 characters.' }),
  description: z.string().optional(),
  sport: z.string().optional(),
  is_private: z.boolean().default(false),
});

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: createTeam, isPending } = useCreateTeamMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      sport: '',
      is_private: false,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // The 'is_personal_workspace' flag is intentionally omitted,
    // so it defaults to 'false' in the database.
    createTeam(values, {
      onSuccess: (newTeam) => {
        setOpen(false);
        form.reset();
        // On success, navigate to the new team's detail page
        navigate({ to: '/explore/teams/$teamId', params: { teamId: newTeam.id } });
      },
      onError: (error) => {
        // You can add a user-facing error message here
        console.error('Failed to create team:', error);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription>
            Build a community. Invite members, share plans, and track progress together.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apex Strength Club" {...field} />
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
                    <Textarea placeholder="What is your team's main focus?" className="resize-none" {...field} />
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
                  <FormLabel>Primary Sport (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CrossFit, Soccer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Private Team</FormLabel>
                    <FormDescription>
                      Private teams are not visible in the public directory.
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
                {isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}