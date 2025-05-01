import { useInfiniteDiscoverablePlans } from '@/api/plans/plan'
import { usePublicTeams } from '@/api/teams';
import { useUsers, useUserTeams } from '@/api/user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import Model, { IExerciseData, IMuscleStats } from 'react-body-highlighter';

export const Route = createFileRoute('/_layout/discover/')({
  component: RouteComponent,
})
export const exercises: IExerciseData[] = [
  { name: 'Bench Press', muscles: ['chest', 'triceps', 'front-deltoids'] },
  { name: 'Push Ups', muscles: ['chest', 'triceps', 'front-deltoids'] },
  { name: 'Pull Ups', muscles: ['upper-back', 'biceps', 'back-deltoids'] },
  { name: 'Deadlift', muscles: ['hamstring', 'gluteal', 'lower-back', 'forearm'] },
  { name: 'Squats', muscles: ['quadriceps', 'gluteal', 'hamstring'] },
  { name: 'Overhead Press', muscles: ['front-deltoids', 'triceps', 'trapezius'] },
  { name: 'Barbell Row', muscles: ['upper-back', 'back-deltoids', 'biceps'] },
  { name: 'Bicep Curls', muscles: ['biceps', 'forearm'] },
  { name: 'Tricep Dips', muscles: ['triceps', 'chest'] },
  { name: 'Lunges', muscles: ['quadriceps', 'gluteal', 'hamstring', 'calves'] },
  { name: 'Plank', muscles: ['abs', 'obliques'] },
  { name: 'Russian Twists', muscles: ['obliques', 'abs'] },
]

function RouteComponent() {
  const { data } = useInfiniteDiscoverablePlans()
  const { data: users } = useUsers()
  const { data: teams } = usePublicTeams()

  return (
    <div className=" flex-1 flex flex-col">
      <section >
        <div className='w-full fixed bg-sidebar shadow px-2 py-4 z-10'>
          <Breadcrumb>
            <BreadcrumbList>
              {/* <BreadcrumbItem>
              <BreadcrumbLink >
                <Link to='/discover'>
                  Discover
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem> */}

              <BreadcrumbItem>
                <BreadcrumbPage>
                  <h2 className='text-lg font-bold'>
                    Discover
                  </h2>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <section className='p-4 pt-20'>
        <h2 className="text-2xl font-bold mb-4">Featured Creators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Replace with real data */}
          {users?.map((creator) => (
            <Link to='/discover/user/$userId' params={{ userId: creator.id }} >
              <Card key={creator.id} className='overflow-hidden border-border'>
                <CardContent className="p-4 flex flex-row gap-2">
                  <div>
                    <Avatar>
                      <AvatarFallback>
                        A
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-medium">{creator.username}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      12 plans · 430 views
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className='p-4 '>
        <h2 className="text-2xl font-bold mb-4">Public Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Replace with real data */}
          {teams?.map((team) => (
            <Link to={'/discover/team/$teamId'} params={{ teamId: team.id }} key={team.id}>
              <Card className='border-border'>
                <div className="flex flex-row gap-1 items-center pl-4">
                  <div className="w-8 h-8 rounded bg-blue-300">

                  </div>
                  <div className="flex flex-col">
                    <CardContent className="py-4">
                      <CardTitle className="text-base font-medium">{team.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        8 plans · 4 contributors
                      </CardDescription>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className='p-4'>
        <h2 className="text-2xl font-bold mb-4">Discover Plans</h2>
        {data?.pages.map((page, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {page.map((plan) => (
              <Link key={plan.id} to='/discover/plan/$planId' params={{ planId: plan.id }}>
                <Card className='border-border'>
                  <CardContent className="p-4">
                    <CardTitle className="text-xl font-semibold mb-1">
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mb-2">
                      {plan.description || 'No description provided.'}
                    </CardDescription>

                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><strong>Created by:</strong> {plan.created_by_username}</p>
                      <p><strong>Created at:</strong> {new Date(plan?.created_at).toLocaleDateString()}</p>
                      {plan.duration_weeks && (
                        <p><strong>Duration:</strong> {plan.duration_weeks} week{plan.duration_weeks > 1 ? 's' : ''}</p>
                      )}
                      {plan.difficulty_level && (
                        <p><strong>Difficulty:</strong> {plan.difficulty_level}</p>
                      )}
                      {plan.sport && (
                        <p><strong>Sport:</strong> {plan.sport}</p>
                      )}
                      {plan.team_name && (
                        <p><strong>Team:</strong> {plan.team_name}</p>
                      )}
                      <p><strong>Visibility:</strong> {plan.visibility}</p>
                      <div className="flex gap-4 pt-2 text-xs text-gray-500">
                        <span>👁️ {plan.view_count}</span>
                        <span>❤️ {plan.like_count}</span>
                        <span>🔁 {plan.fork_count}</span>
                        <span>12 active users</span>
                      </div>
                    </div>
                    <div className='flex w-full flex-row justify-between'>
                      <Model
                        data={exercises}
                        style={{ width: '10rem', padding: '1rem' }}

                      // onClick={handleClick}
                      />
                      <Model
                        data={exercises}

                        style={{ width: '10rem', padding: '1rem' }}
                        type="posterior"
                      // onClick={handleClick}
                      />

                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}