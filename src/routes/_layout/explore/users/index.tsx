// FILE: src/routes/_layout/explore/users/index.tsx

import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useDiscoverableUsersQuery } from '@/api/user'; // Corrected: Import from the new location
import type { UserFilters } from '@/api/user/endpoint'; // Corrected: Import from the new location
import type { DiscoverableUser } from '@/types/user/index'; // Corrected: Import from the new location
import { useDebounce } from '@/hooks/use-debounce'; // Assumes you have this hook

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCard } from '@/components/new/UserCard';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/users/')({
  component: UserDirectoryPage,
});


// --- The Main Page Component ---
function UserDirectoryPage() {
  // State for our filters
  const [roleFilter, setRoleFilter] = useState<UserFilters['roleFilter'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filters: UserFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
    roleFilter: roleFilter === 'all' ? undefined : roleFilter,
  }), [debouncedSearchTerm, roleFilter]);

  const { data: users, isLoading, isError } = useDiscoverableUsersQuery(filters);
  console.log(users)

  return (
    <div className="container py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Discover Users</h1>
        <p className="text-muted-foreground">
          Find coaches and other athletes in the community.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          placeholder="Search by name or username..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs
        value={roleFilter}
        onValueChange={(value) => setRoleFilter(value as UserFilters['roleFilter'] | 'all')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="coach">Coaches</TabsTrigger>
          <TabsTrigger value="member">Members</TabsTrigger>
        </TabsList>

        <div className="mt-6">
           <UserGrid users={users} isLoading={isLoading} isError={isError} />
        </div>
      </Tabs>
    </div>
  );
}


// --- Sub-components for better organization ---

// Grid to display users, handling loading, error, and empty states
const UserGrid = ({ users, isLoading, isError }: { users: DiscoverableUser[] | undefined, isLoading: boolean, isError: boolean }) => {
  if (isLoading) return <UserGridSkeleton />;
  if (isError) return <p className="text-destructive text-center py-10">Failed to load users.</p>;
  if (!users || users.length === 0) return (
    <div className="text-center py-10">
        <h3 className="text-xl font-semibold">No Users Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

// Skeleton for the loading state
export const UserGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="p-4 flex flex-col items-center">
        <Skeleton className="w-20 h-20 rounded-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-5 w-16" />
        </div>
      </Card>
    ))}
  </div>
);