import { useInfiniteDiscoverablePlans } from '@/api/plans/plan'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import Model, { IExerciseData, IMuscleStats } from 'react-body-highlighter';

export const Route = createFileRoute('/_layout/discover/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useInfiniteDiscoverablePlans()
  const exercises: IExerciseData[] = [
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
  
  
  return (
    <div className="space-y-12 p-4">
      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Exercises</h2>
        <div className="flex flex-wrap gap-2">
          {/* Replace with real data */}
          {['Squats', 'Planks', 'Push Ups', 'Deadlifts'].map((exercise) => (
            <span
              key={exercise}
              className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
            >
              {exercise}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Creators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Replace with real data */}
          {['code.arber@gmail.com', 'emma.fit', 'coach.jake'].map((creator) => (
            <Card key={creator}>
              <CardContent className="p-4">
                <CardTitle className="text-base font-medium">{creator}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  12 plans · 430 views
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Public Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Replace with real data */}
          {['Team Alpha', 'Mobility Club', 'Strength Builders'].map((team) => (
            <Link to={'/discover/plan/$planId'} params={{ planId: '123' }} >
              <Card key={team}>
                <CardContent className="p-4">
                  <CardTitle className="text-base font-medium">{team}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    8 plans · 4 contributors
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Discover Plans</h2>
        {data?.pages.map((page, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.map((plan) => (
              <Link key={plan.id} to='/plans/$planId' params={{ planId: plan.id }}>
                <Card >
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