import { useUserQuery } from '@/api/user'
import { useAuthStore } from '@/hooks/useAuthStore'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const {data} = useUserQuery()

  useEffect(() => {
    useAuthStore.setState({ profile: data?.profile })
  }, [data])
  return <div className='flex flex-1 overflow-x-hidden bg-background'>
    <Outlet />
  </div>
}
