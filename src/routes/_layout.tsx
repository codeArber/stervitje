import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='w-full px-8 py-4'>
    <Outlet />
  </div>
}
