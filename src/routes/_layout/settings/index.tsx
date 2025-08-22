// FILE: src/routes/_layout/settings.tsx

import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// --- API & State ---
import { useCurrentUserQuery, useUpdateUserProfileMutation } from '@/api/user';
import { Skeleton } from '@/components/ui/skeleton';

// --- UI Components ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { Breadcrumb } from '@/components/new/TopNavigation';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/settings/')({
  component: SettingsPage,
});

// --- Zod Schema for Form Validation ---
const profileFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters.").max(100).nullable(),
  username: z.string().min(3, "Username must be at least 3 characters.").max(50).nullable(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters.").nullable(),
  unit: z.enum(['metric', 'imperial']),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;


function SettingsPage() {
  const { data: profile, isLoading: isLoadingProfile } = useCurrentUserQuery();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserProfileMutation();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    // `values` will keep the form in sync if the profile data changes
    values: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      unit: profile?.unit || 'metric',
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateUser(data);
  };

  if (isLoadingProfile || !profile) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <Breadcrumb currentPath={location.pathname} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account and profile details.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>This information will be displayed publicly on your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Your full name" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="Your unique username" {...field} value={field.value || ''} /></FormControl>
                    <FormDescription>This is your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea placeholder="Tell us a little about yourself" className="resize-none" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a unit system" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose your preferred system for weights and measurements.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}