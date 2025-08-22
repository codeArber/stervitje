// src/components/new/team/CreateTeamDialog.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { useCreateTeamMutation } from '@/api/team'; // Your hook
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner'; // Your toast import

// Define the schema for your form
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Team name must be at least 2 characters.',
  }).max(50, {
    message: 'Team name must not exceed 50 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must not exceed 500 characters.',
  }).nullable().optional(),
  sport: z.string().max(50, {
    message: 'Sport must not exceed 50 characters.',
  }).nullable().optional(),
  is_private: z.boolean().default(false).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTeamDialog() {
  const createTeamMutation = useCreateTeamMutation();
  const [open, setOpen] = React.useState(false); // State to control dialog visibility

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      sport: '',
      is_private: false,
    },
  });

  // Effect to reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(values: FormData) {
    // Use toast.promise to handle the mutation with integrated feedback
    toast.promise(
      createTeamMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        sport: values.sport || null,
        is_private: values.is_private ?? false,
      }),
      {
        loading: `Creating "${values.name}" workspace...`,
        success: (data) => { // 'data' here is the successful return from mutateAsync
          setOpen(false); // Close the dialog on success
          // form.reset() will be triggered by useEffect due to setOpen(false)
          return `Workspace "${values.name}" created successfully!`;
        },
        error: (err) => {
          console.error('Failed to create team:', err); // Log the full error
          return `Failed to create workspace: ${err.message || 'Something went wrong.'}`;
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new team or personal workspace. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Team" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the main name for your new team or workspace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of your workspace." {...field} />
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
                  <FormLabel>Primary Sport/Focus (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Crossfit, Running, Weightlifting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Private Workspace</FormLabel>
                    <FormDescription>
                      If checked, this workspace will only be visible and accessible to invited members.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}