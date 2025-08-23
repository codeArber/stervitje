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
import { Save, Sun, Moon } from 'lucide-react';
import { Breadcrumb } from '@/components/new/TopNavigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label'; // Ensure Label is imported

// Import your useTheme hook
import useTheme from '@/hooks/use-theme'; // Adjust this path


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
  const { theme, toggleTheme } = useTheme();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
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
      <div className="container mx-auto max-w-4xl py-8"> {/* Adjusted max-w for better spacing with grid */}
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="pb-6"> {/* Centralized container and spacing */}
      <Breadcrumb currentPath={location.pathname} />
      <Card className='bg-muted py-4'>
        <CardContent className="flex flex-row gap-2"> {/* Added space-y for content inside card */}
          <div className='px-8 py-4'>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="rounded-full overflow-hidden border border-border w-24 h-24 bg-background flex items-center justify-center">
                  {/* Avatar image or fallback */}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-muted-foreground">
                      {(profile.full_name || profile.username || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Optional: Edit button overlay */}
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full p-2 shadow bg-background"
                  type="button"
                  aria-label="Change avatar"
                  disabled
                  tabIndex={-1}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                  </svg>
                </Button>
              </div>
              <div className="text-center">
                <div className="font-semibold">{profile.full_name || "Unnamed"}</div>
                <div className="text-sm text-muted-foreground">@{profile.username}</div>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Fields - Reorganized into a Grid */}
              <div className="flex flex-col"> {/* NEW: Grid for 2 columns */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input variant={'ghost'} placeholder="Your full name" {...field} value={field.value || ''} /></FormControl>
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
                      <FormControl><Input variant={'ghost'} placeholder="Your unique username" {...field} value={field.value || ''} /></FormControl>
                      <FormDescription>This is your public display name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Bio (can span 2 columns or remain 1, here it spans for better text area usage) */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2"> {/* NEW: Spans two columns on medium screens */}
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea variant={'ghost'} placeholder="Tell us a little about yourself" className="resize-none" {...field} value={field.value || ''} /></FormControl>
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
                        <FormControl><SelectTrigger className='bg-white/15'><SelectValue placeholder="Select a unit system" /></SelectTrigger></FormControl>
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
                {/* NEW: Separator and Theme Toggle - Visually separated within the same CardContent */}
                <div className="border-t border-border"> {/* NEW: Top padding and border-top for separation */}
                  <h3 className="text-lg font-semibold mb-4">Appearance</h3> {/* NEW: Sub-heading for theme */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center gap-2">
                      {theme === 'light' ? <Sun className="h-5 w-5 text-orange-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
                      <Label htmlFor="dark-mode-toggle" className="text-base">
                        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                      </Label>
                    </div>
                    <Switch
                      id="dark-mode-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </div>
                {/* Other form fields would go here */}
              </div>

              <div className="flex ">
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