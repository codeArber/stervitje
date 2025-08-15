// FILE: src/routes/_layout/explore/teams/index.tsx

import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useDiscoverableTeamsQuery } from '@/api/team'; // Ensure this is the updated hook
import type { TeamFilters } from '@/api/team/endpoint';
import { useDebounce } from '@/hooks/use-debounce';
import type { DiscoverableTeamRichDetails } from '@/types/team/index';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import { Users, Dumbbell } from 'lucide-react';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/teams/')({
  component: TeamDirectoryPage,
});


// --- The Main Page Component ---
function TeamDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filters: TeamFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
  }), [debouncedSearchTerm]);

  const { data: teams, isLoading, isError } = useDiscoverableTeamsQuery(filters);

  return (
    <div className="container py-8">
      {/* Provider for all tooltips on the page */}
      <TooltipProvider>
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Discover Teams</h1>
          <p className="text-muted-foreground">
            Find coaching teams, gyms, and communities to join.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by team name or description..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Dummy filter for the future */}
          <div className="p-2 border rounded-md text-sm text-muted-foreground flex items-center">
            Future filters will go here...
          </div>
        </div>
        
        {/* Content Display */}
        <div>
          {isLoading && <TeamGridSkeleton />}
          {isError && <p className="text-destructive text-center py-10">Failed to load teams.</p>}
          {!isLoading && !isError && teams && teams.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No Teams Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search term.</p>
            </div>
          )}
          {!isLoading && !isError && teams && teams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}


// --- Sub-components for better organization ---

// A single Team Card with new details
const TeamCard = ({ team }: { team: DiscoverableTeamRichDetails }) => (
  <Link
    to="/explore/teams/$teamId"
    params={{ teamId: team.id }}
    className="group"
  >
    <Card className="h-full flex flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
         <Avatar className="w-12 h-12 border">
            <AvatarImage src={team.logo_url || ''} alt={team.name} />
            <AvatarFallback>{team.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <CardTitle className="leading-tight">{team.name}</CardTitle>
            {team.sport && <CardDescription className="capitalize">{team.sport}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description || 'No description provided.'}
        </p>
        
        {/* NEW: Displaying Admins and Coaches */}
        {team.key_members && team.key_members.length > 0 && (
            <div className="mt-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Coaching Staff</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {team.key_members.map(member => (
                        <div key={member.profile.id} className="flex items-center gap-2 text-sm">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={member.profile.profile_image_url || ''} />
                                <AvatarFallback className="text-xs">{member.profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{member.profile.full_name || member.profile.username}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
        {/* UPDATED: Total members now has a tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <Users className="h-4 w-4" />
              <span>{team.members_count} Members</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {team.member_names_preview && team.member_names_preview.length > 0 ? (
                <div className="text-xs space-y-1 p-1">
                    <p className="font-semibold mb-1">Members Include:</p>
                    {team.member_names_preview.map(name => <p key={name}>{name}</p>)}
                    {team.members_count > 15 && <p className="opacity-70 mt-1">... and {team.members_count - 15} more</p>}
                </div>
            ) : <p className="text-xs p-1">No members in this team yet.</p>}
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2" title="Total Plans">
            <Dumbbell className="h-4 w-4" />
            <span>{team.plans_count} Plans</span>
        </div>
      </CardFooter>
    </Card>
  </Link>
);

// Skeleton for loading state
export const TeamGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex-row items-start gap-4 space-y-0">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
        </CardFooter>
      </Card>
    ))}
  </div>
);