// FILE: src/routes/_layout/explore/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';

// Import all the list hooks we've already created
import { useFilteredPlansQuery } from '@/api/plan';
import { useDiscoverableTeamsQuery } from '@/api/team';
import { useDiscoverableUsersQuery } from '@/api/user';


// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import { ArrowRight } from 'lucide-react';
import { PlanListSkeleton } from './plans';
import { PlanCard } from '@/components/new/PlanCard';
import { UserCard } from '@/components/new/UserCard';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamGridSkeleton } from './teams';
import { UserGridSkeleton } from './users';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/')({
  component: ExploreDashboardPage,
});


// --- The Main Page Component ---
function ExploreDashboardPage() {
  // CORRECTED: Fetch a small, curated list for each category.
  // We pass the parameter names that our RPC function expects (p_page_limit).
  const { data: plans, isLoading: isLoadingPlans } = useFilteredPlansQuery({
    p_page_limit: 4,
  });

  const { data: teams, isLoading: isLoadingTeams } = useDiscoverableTeamsQuery({
    searchTerm: undefined,
  });

  const { data: users, isLoading: isLoadingUsers } = useDiscoverableUsersQuery({
    roleFilter: 'coach', // Showcasing coaches is a good default
  });

  return (
    <div className="container py-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover new training plans, find professional coaches, and join vibrant teams to accelerate your fitness journey.
        </p>
      </div>
      
      <Separator />

      {/* Plans Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold tracking-tight">Featured Plans</h2>
          <Button variant="ghost" asChild>
            <Link to="/explore/plans">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoadingPlans ? (
          <PlanListSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
      </section>

      <Separator />

      {/* Teams Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold tracking-tight">Popular Teams</h2>
          <Button variant="ghost" asChild>
            <Link to="/explore/teams">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
         {isLoadingTeams ? (
          <TeamGridSkeleton  />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.slice(0, 3).map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        )}
      </section>

      <Separator />

      {/* Coaches Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold tracking-tight">Find a Coach</h2>
          <Button variant="ghost" asChild>
            <Link to="/explore/users">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoadingUsers ? (
            <UserGridSkeleton />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users?.slice(0, 4).map(user => <UserCard key={user.id} user={user} />)}
            </div>
        )}
      </section>
    </div>
  );
}