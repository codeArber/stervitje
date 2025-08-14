import { createFileRoute } from '@tanstack/react-router'
import { TeamDetailPage } from '@/components/teams/TeamDetailPage'

export const Route = createFileRoute('/_layout/teams/$teamId/')({
  component: TeamDetailRouteComponent,
})

function TeamDetailRouteComponent() {
  const { teamId } = Route.useParams()
  
  return <TeamDetailPage teamId={teamId} />
}
