// FILE: src/routes/_layout/explore/users.tsx

import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useDebounce } from '@/hooks/use-debounce';

// --- API & TYPES ---
import { useRichUserCardsQuery } from '@/api/user';
import type { UserFilters } from '@/api/user/endpoint';
import type { RichUserCardData } from '@/types/user';

// --- UI Components ---
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';

// --- Icons ---
import { Search, User, Star } from 'lucide-react';
import { Breadcrumb } from '@/components/new/TopNavigation';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/explore/users/')({
  component: ExploreUsersPage,
});

function ExploreUsersPage() {
  const [filters, setFilters] = useState<UserFilters>({});
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  const apiFilters: UserFilters = {
    ...filters,
    searchTerm: debouncedSearchTerm,
  };

  return (
    <div className="pb-6">
      <Breadcrumb currentPath={location.pathname} />

      {/* Header */}
      <header className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Explore Users & Coaches</h1>
        <p className="text-lg text-muted-foreground">
          Find and connect with other users and expert coaches in the community.
        </p>
      </header>

      {/* Search & Filter Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            className="pl-9"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
        {/* Placeholder for future filter buttons (e.g., filter by role) */}
      </div>

      {/* Results Grid */}
      <main>
        <UserResultsGrid filters={apiFilters} />
      </main>
    </div>
  );
}


// --- Sub-components for the Page ---

function UserResultsGrid({ filters }: { filters: UserFilters }) {
  const { data: users, isLoading, isError, error } = useRichUserCardsQuery(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => <UserCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-center py-10">Error: {error.message}</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold">No Users Found</h3>
        <p className="text-muted-foreground mt-2">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}

// --- Single User Card Component ---
// This could be moved to its own file like `src/components/users/UserCard.tsx` for reusability
function UserCard({ user }: { user: RichUserCardData }) {
  // Determine if the user is a coach based on analytics
  const isCoach = (user.analytics?.total_plans_created ?? 0) > 0 || (user.analytics?.total_clients ?? 0) > 0;

  return (
    <Link to="/explore/users/$userId" params={{ userId: user.id }} className="group">
      <Card className="h-full flex flex-col items-center text-center p-4 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all">
        <Avatar className="w-24 h-24 mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
          <AvatarImage src={user.profile_image_url || undefined} alt={user.username || 'User avatar'} />
          <AvatarFallback className="text-3xl">
            {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-semibold leading-tight truncate w-full">{user.full_name || user.username}</h3>
        <p className="text-sm text-muted-foreground">@{user.username}</p>

        {isCoach && (
          <Badge variant="default" className="mt-3">
            <Star className="h-3 w-3 mr-1.5" />
            Coach
          </Badge>
        )}

        <div className="flex-grow" />

        <div className="flex justify-around text-xs text-muted-foreground font-medium mt-4 w-full border-t pt-3">
          <div className="flex flex-col items-center" title="Plans Created">
            <span className="font-bold text-base text-foreground">{user.analytics?.total_plans_created || 0}</span>
            <span>Plans</span>
          </div>
          <div className="flex flex-col items-center" title="Active Clients or Users Coached">
            <span className="font-bold text-base text-foreground">{user.analytics?.total_clients || 0}</span>
            <span>Clients</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// --- Skeleton for the User Card ---
function UserCardSkeleton() {
  return (
    <Card className="h-full flex flex-col items-center text-center p-4">
      <Skeleton className="w-24 h-24 rounded-full mb-4" />
      <Skeleton className="h-5 w-3/4 mb-1.5" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex-grow" />
      <div className="flex justify-around w-full border-t pt-3 mt-4">
        <div className="flex flex-col items-center space-y-1">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </Card>
  );
}