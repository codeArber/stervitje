import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/workspace/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/workspace/create/"!</div>
}
