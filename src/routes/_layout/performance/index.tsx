import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/performance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/performance/"!</div>
}
