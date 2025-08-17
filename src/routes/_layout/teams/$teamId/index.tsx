import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/teams/$teamId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/teams/$teamId/"!</div>
}
