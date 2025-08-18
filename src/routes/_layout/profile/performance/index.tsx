import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/profile/performance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/profile/performance/"!</div>
}
