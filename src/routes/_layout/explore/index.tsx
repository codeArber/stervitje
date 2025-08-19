// FILE: src/routes/_layout/explore/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';

// --- API Hooks ---
import { useRichPlanCardsQuery } from '@/api/plan';
import { useRichTeamCardsQuery } from '@/api/team';
import { useRichUserCardsQuery } from '@/api/user';

// --- Types ---
import type { RichPlanCardData } from '@/types/plan';
import type { RichTeamCardData } from '@/types/team';
import type { RichUserCardData } from '@/types/user';

// --- UI Components ---
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// --- We will re-create the specific card components from your other files here for simplicity ---
// In a larger project, you would import these from their own files.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, Heart, Users, Dumbbell } from 'lucide-react';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/explore/')({
  component: ExploreHomePage,
});

function ExploreHomePage() {
  // Use `pageLimit` to fetch only a small preview for the homepage.
  const previewFilters = { pageLimit: 3 };

  const { data: plans, isLoading: loadingPlans } = useRichPlanCardsQuery(previewFilters);
  const { data: teams, isLoading: loadingTeams } = useRichTeamCardsQuery(previewFilters);
  // Specifically feature coaches on the main explore page.
  const { data: users, isLoading: loadingUsers } = useRichUserCardsQuery({ ...previewFilters });

  return (
    <div className="container mx-auto py-8 space-y-12">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover popular plans, featured teams, and expert coaches to guide your fitness journey.
        </p>
      </header>

      {/* Popular Plans Section */}
      <section>
        <SectionHeader title="Popular Plans" ctaLink="/explore/plans" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingPlans ? (
            Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
          ) : (
            plans?.map(plan => <PlanCard key={plan.id} planData={plan} />)
          )}
        </div>
      </section>

      {/* Featured Teams Section */}
      <section>
        <SectionHeader title="Featured Teams" ctaLink="/explore/teams" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingTeams ? (
            Array.from({ length: 3 }).map((_, i) => <TeamCardSkeleton key={i} />)
          ) : (
            teams?.map(team => <TeamCard key={team.id} team={team} />)
          )}
        </div>
      </section>

      {/* Top Coaches & Users Section */}
      <section>
        <SectionHeader title="Top Coaches & Users" ctaLink="/explore/users" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingUsers ? (
            Array.from({ length: 4 }).map((_, i) => <UserCardSkeleton key={i} />)
          ) : (
            users?.slice(0, 4).map(user => <UserCard key={user.id} user={user} />) // Slice to ensure we only show 4
          )}
        </div>
      </section>
    </div>
  );
}

// --- Reusable Sub-components ---

function SectionHeader({ title, ctaLink }: { title: string; ctaLink: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <Button variant="ghost" asChild>
        <Link to={ctaLink}>
          View All <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}


// --- Card Components (copied from your other files for a single-file solution) ---

function PlanCard({ planData }: { planData: RichPlanCardData }) {
  const { analytics, creator } = planData;
  return (
    <Link to="/explore/plans/$planId" params={{ planId: planData.id }}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-3">
            <Avatar><AvatarImage src={creator.profile_image_url || undefined} /><AvatarFallback>{(creator.full_name || 'U').charAt(0)}</AvatarFallback></Avatar>
            <div>
              <CardTitle className="text-lg leading-tight">{planData.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{creator.full_name || creator.username}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{planData.description}</p>
        </CardHeader>
        <CardContent className="flex-grow"><Badge variant="outline"><Star className="h-3 w-3 mr-1" /> Level {planData.difficulty_level}/5</Badge></CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-around text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1" title="Likes"><Heart className="h-3 w-3" /><span>{analytics?.like_count || 0}</span></div>
          <div className="flex items-center gap-1" title="Forks"><GitFork className="h-3 w-3" /><span>{analytics?.fork_count || 0}</span></div>
          <div className="flex items-center gap-1" title="Active Users"><Users className="h-3 w-3" /><span>{analytics?.active_users_count || 0}</span></div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function TeamCard({ team }: { team: RichTeamCardData }) {
  return (
    <Link to="/explore/teams/$teamId" params={{ teamId: team.id }}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
        <CardHeader>
          <div className="aspect-video w-full bg-muted rounded-md mb-4 flex items-center justify-center">
            {team.logo_url ? <img src={team.logo_url} alt={`${team.name} logo`} className="h-full w-full object-cover rounded-md" /> : <Users className="h-12 w-12 text-muted-foreground" />}
          </div>
          <CardTitle>{team.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5" title="Members"><Users className="h-4 w-4" /><span>{team.members_count}</span></div>
            <div className="flex items-center gap-1.5" title="Public Plans"><Dumbbell className="h-4 w-4" /><span>{team.plans_count}</span></div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </CardFooter>
      </Card>
    </Link>
  );
}

function UserCard({ user }: { user: RichUserCardData }) {
  const isCoach = (user.analytics?.total_plans_created ?? 0) > 0;
  return (
    <Link to="/users/$userId" params={{ userId: user.id }} className="group">
      <Card className="h-full flex flex-col items-center text-center p-4 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all">
        <Avatar className="w-24 h-24 mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
          <AvatarImage src={user.profile_image_url || undefined} alt={user.username || 'User avatar'} />
          <AvatarFallback className="text-3xl">{(user.full_name || user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold leading-tight truncate w-full">{user.full_name || user.username}</h3>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {isCoach && <Badge variant="default" className="mt-3"><Star className="h-3 w-3 mr-1.5" />Coach</Badge>}
      </Card>
    </Link>
  );
}


// --- Skeletons ---
function PlanCardSkeleton() { return ( <Card><CardHeader><div className="flex items-center gap-3 mb-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-24" /></div></div><div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div></CardHeader><CardContent className="flex-grow"><Skeleton className="h-6 w-20" /></CardContent><CardFooter className="bg-muted/50 p-3"><Skeleton className="h-5 w-full" /></CardFooter></Card> ); }
function TeamCardSkeleton() { return ( <Card><CardHeader><Skeleton className="aspect-video w-full rounded-md mb-4" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader><CardContent className="flex-grow" /><CardFooter className="bg-muted/50 p-3"><Skeleton className="h-5 w-full" /></CardFooter></Card> ); }
function UserCardSkeleton() { return ( <Card className="h-full flex flex-col items-center text-center p-4"><Skeleton className="w-24 h-24 rounded-full mb-4" /><Skeleton className="h-5 w-3/4 mb-1.5" /><Skeleton className="h-4 w-1/2" /></Card> ); }