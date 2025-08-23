// FILE: src/routes/_layout/explore/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';

// --- API Hooks ---
import { useRichPlanCardsQuery } from '@/api/plan';
import { useRichTeamCardsQuery } from '@/api/team';
import { useRichUserCardsQuery } from '@/api/user';

// --- Types ---
// Ensure RichPlanCardData reflects the new fields from get_filtered_plans_rich
import type { RichPlanCardData } from '@/types/plan';
import type { RichTeamCardData } from '@/types/team';
import type { RichUserCardData } from '@/types/user';

// --- UI Components ---
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, KanbanSquareDashed } from 'lucide-react';

// --- Shadcn Card components for usage ---
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// Import all necessary Lucide icons for the PlanCard
import { Star, GitFork, Heart, Users, Dumbbell, Target, Goal } from 'lucide-react'; // Added Dumbbell & Target for plan stats
import { Breadcrumb } from '@/components/new/TopNavigation';
import ExerciseMuscleDiagram from '@/components/new/exercise/ExerciseMuscleDiagram';
import ExerciseMuscleDiagramDetailed from '@/components/new/exercise/ExerciseMuscleDiagram';
import PlanMuscleDiagram from '@/components/new/exercise/PlanMuscleDiagram';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import PlanMuscleDiagramExplore from '@/components/new/exercise/PlanMuscleDiagramExplore';
import { TeamCard } from '@/components/new/team/TeamCardExplore';

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
    <div className="flex flex-col gap-8 pb-6"> {/* Added container and spacing here for consistency */}
      <Breadcrumb currentPath={location.pathname} />

      {/* Popular Plans Section */}
      <section>
        <SectionHeader title="Popular Plans" ctaLink="/explore/plans" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingPlans ? (
            Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
          ) : (
            plans?.map(plan => <PlanCardExplore key={plan.id} planData={plan} />)
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
            teams?.map(team => <Link to={`/explore/teams/$teamId`} params={{teamId: team.id}} key={team.id}><TeamCard team={team} /></Link>)
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

export function PlanCardExplore({ planData }: { planData: RichPlanCardData }) {
  const { analytics, creator } = planData;
  const { total_exercises_count, goals, muscle_activation_summary } = planData; // Now using 'goals' array

  const getDifficultyLabel = (level: number | null) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Moderate';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const displayedGoals = goals?.slice(0, 2); // Show first 2 goals in preview
  const remainingGoalsCount = (goals?.length || 0) - (displayedGoals?.length || 0);

  return (
    <Link to="/explore/plans/$planId" params={{ planId: planData.id }} className='w-fit'>
      <Card className="h-full w-fit flex flex-col hover:border-primary transition-colors duration-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-3">
            {creator?.profile_image_url && 
            <Avatar><AvatarImage src={creator?.profile_image_url || undefined} /><AvatarFallback>{(creator?.full_name || 'U').charAt(0)}</AvatarFallback></Avatar>
            }
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight truncate">{planData.title}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{creator?.full_name || creator?.username}</p>
            </div>
          </div>
         <div className="max-w-[400px]">
           {planData.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{planData.description}</p>
          )}
         </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pb-3 pt-3 flex-grow">
          {/* Difficulty Level */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <Star className="h-3 w-3 mr-1" /> {getDifficultyLabel(planData.difficulty_level)}
            </Badge>
            {planData.private && (
              <Badge variant="outline" className="text-xs text-muted-foreground">Private</Badge>
            )}
          </div>

          {/* Exercise Count & Goals Section */}


          {/* Muscle Activation Diagram */}
          {muscle_activation_summary && muscle_activation_summary.length > 0 && (
            <div className="flex items-center justify-between p-2 rounded-md border border-gray-200 mt-2">
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {/* Exercises */}
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-gray-500" />
                  <span>{total_exercises_count || 0} Exercises</span>
                </div>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1.5 justify-start h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Target className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="flex-1 text-left">
                        {goals && goals.length > 0 ? `${goals.length} Goals` : 'No Goals'}
                        {displayedGoals?.length > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground truncate">
                            ({displayedGoals[0].title})
                          </span>
                        )}
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-[300px] p-2 max-h-[200px] overflow-y-auto">
                    <h4 className="font-semibold text-base mb-2">
                      Plan Goals ({goals?.length || 0})
                    </h4>
                    {goals?.length > 0 ? (
                      <div className="space-y-2">
                        {goals.map((goal) => (
                          <div key={goal.id} className="flex items-start gap-2 text-sm">
                            {goal.exercise_id ? (
                              <Dumbbell className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <KanbanSquareDashed className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="flex-1">
                              <span className="font-medium">{goal.title}</span>
                              <span className="text-muted-foreground ml-1">
                                ({goal.metric} to {goal.target_value})
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No specific goals set for this plan yet.
                      </p>
                    )}
                  </HoverCardContent>
                </HoverCard>

              </div>
              <PlanMuscleDiagramExplore
                muscles={muscle_activation_summary}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/50 p-3 flex justify-around text-xs text-muted-foreground font-medium mt-auto">
          <div className="flex items-center gap-1" title="Likes"><Heart className="h-3 w-3" /><span>{analytics?.like_count || 0}</span></div>
          <div className="flex items-center gap-1" title="Forks"><GitFork className="h-3 w-3" /><span>{analytics?.fork_count || 0}</span></div>
          <div className="flex items-center gap-1" title="Active Users"><Users className="h-3 w-3" /><span>{analytics?.active_users_count || 0}</span></div>
        </CardFooter>
      </Card>
    </Link>
  );
}

// --- TeamCard, UserCard, Skeletons (remain unchanged from your snippet) ---

// function TeamCard({ team }: { team: RichTeamCardData }) {
//   return (
//     <Link to="/explore/teams/$teamId" params={{ teamId: team.id }}>
//       <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
//         <CardHeader>
//           <div className="aspect-video w-full bg-muted rounded-md mb-4 flex items-center justify-center">
//             {team.logo_url ? <img src={team.logo_url} alt={`${team.name} logo`} className="h-full w-full object-cover rounded-md" /> : <Users className="h-12 w-12 text-muted-foreground" />}
//           </div>
//           <CardTitle>{team.name}</CardTitle>
//         </CardHeader>
//         <CardContent className="flex-grow" />
//         <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
//           <div className="flex items-center gap-4 text-muted-foreground font-medium">
//             <div className="flex items-center gap-1.5" title="Members"><Users className="h-4 w-4" /><span>{team.members_count}</span></div>
//             <div className="flex items-center gap-1.5" title="Public Plans"><Dumbbell className="h-4 w-4" /><span>{team.plans_count}</span></div>
//           </div>
//           <ArrowRight className="h-5 w-5 text-muted-foreground" />
//         </CardFooter>
//       </Card>
//     </Link>
//   );
// }

function UserCard({ user }: { user: RichUserCardData }) {
  const isCoach = (user.analytics?.total_plans_created ?? 0) > 0;
  return (
    <Link to="/users/$userId" params={{ userId: user.id }} className="group">
      <Card className="h-full flex flex-col items-center text-center p-4 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all">
        <Avatar className="w-24 h-24 mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
          <AvatarImage src={user?.profile_image_url || undefined} alt={user?.username || 'User avatar'} />
          <AvatarFallback className="text-3xl">{(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold leading-tight truncate w-full">{user?.full_name || user?.username}</h3>
        <p className="text-sm text-muted-foreground">@{user?.username}</p>
        {isCoach && <Badge variant="default" className="mt-3"><Star className="h-3 w-3 mr-1.5" />Coach</Badge>}
      </Card>
    </Link>
  );
}


function PlanCardSkeleton() {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-3 pt-3 flex-grow">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" /> {/* Difficulty badge skeleton */}
          <Skeleton className="h-6 w-12" /> {/* Optional private badge skeleton */}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-5 w-full" /> {/* Exercises count skeleton */}
          <Skeleton className="h-5 w-full" /> {/* Goals count skeleton */}
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200 mt-2">
          <Skeleton className="h-4 w-20" /> {/* "Muscles:" label skeleton */}
          <div className="flex gap-1"> {/* Muscle diagrams skeleton */}
            <Skeleton className="h-[70px] w-[55px]" />
            <Skeleton className="h-[70px] w-[55px]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 flex justify-around text-xs text-muted-foreground font-medium mt-auto">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  );
}

function TeamCardSkeleton() { return (<Card><CardHeader><Skeleton className="aspect-video w-full rounded-md mb-4" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader><CardContent className="flex-grow" /><CardFooter className="bg-muted/50 p-3"><Skeleton className="h-5 w-full" /></CardFooter></Card>); }
function UserCardSkeleton() { return (<Card className="h-full flex flex-col items-center text-center p-4"><Skeleton className="w-24 h-24 rounded-full mb-4" /><Skeleton className="h-5 w-3/4 mb-1.5" /><Skeleton className="h-4 w-1/2" /></Card>); }