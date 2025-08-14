import { createFileRoute } from '@tanstack/react-router'
import { fetchCurrentUserProfile } from '@/api/profiles/endpoint'
import { useFetchCurrentUserProfile } from '@/api/profiles/index'
import { queryClient } from '@/lib/query-client'
import { useUpdateProfile } from '@/api/profiles/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  unit: z.enum(['metric', 'imperial']),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const Route = createFileRoute('/_layout/settings/')({
  loader: () => queryClient.ensureQueryData({
    queryKey: ['currentUserProfile'],
    queryFn: fetchCurrentUserProfile,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { data: profile, isLoading, isError } = useFetchCurrentUserProfile()
  
  if (isLoading) return <div className="p-4">Loading settings...</div>
  if (isError) return <div className="p-4 text-red-500">Error loading settings</div>
  if (!profile) return <div className="p-4">No profile found</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      <SettingsForm profile={profile} />
    </div>
  )
}

function SettingsForm({ profile }: { profile: any }) {
  const updateProfileMutation = useUpdateProfile()
  
  // Initialize form with current profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username,
      full_name: profile.full_name || '',
      bio: profile.bio || '',
      unit: profile.unit,
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync({
        profileId: profile.id,
        payload: values
      })
      // Show success feedback
      alert('Settings updated successfully!')
    } catch (error) {
      // Show error feedback
      alert('Failed to update settings')
      console.error('Error updating profile:', error)
    }
  }

  // Simplified approach to disable button during mutation
  // We'll just disable the button when the mutation is in progress
  const isMutating = updateProfileMutation.isPending || updateProfileMutation.isSuccess;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal profile and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                        <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isMutating}>
              {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
