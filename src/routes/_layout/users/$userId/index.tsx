import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users/$userId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/users/$userId/"!</div>
}
