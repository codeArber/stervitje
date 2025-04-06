import { TeamWorkspace } from '@/components/TeamWorkspace'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/discover/plan/$planId')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>
      <TeamWorkspace teamName={''} publicPlans={[{id: '1', title: 'sad', description: 'ads'
      }]} users={[{
        id: '1',
        name: 'Arber Bajraktari',
        role: 'Coach'
      }, {
        id: '2',
        name: 'Anis Shkembi',
        role: 'Student'
      }]} />
    </div>
  )
}
