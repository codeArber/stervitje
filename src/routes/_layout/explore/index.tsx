import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/explore/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/explore/"!</div>
}
