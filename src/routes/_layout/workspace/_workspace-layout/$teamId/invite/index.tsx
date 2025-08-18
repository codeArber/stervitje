import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/workspace/_workspace-layout/$teamId/invite/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_layout/workspace/_workspace-layout/$teamId/invite/"!</div>
  )
}
