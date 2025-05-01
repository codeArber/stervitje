import { useUserQuery } from '@/api/user'
import { AppSidebar } from '@/components/AppSidebar'
import { Auth } from '@/components/Auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/hooks/useAuthStore'
import { supabase } from '@/lib/supabase/supabaseClient'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: Root
})

const queryClient = new QueryClient()
function Root() {
  const [session, setSession] = useState(null)
 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  console.log(session)
  return (
    <div className='w-screen h-screen flex flex-col'>
      <SidebarProvider>
        <SessionContextProvider supabaseClient={supabase}>

          <QueryClientProvider client={queryClient}>
            {!session ? <Auth /> : <>
              <AppSidebar />
              <Outlet />
            </>}

            {/* <TanStackRouterDevtools /> */}
          </QueryClientProvider>
        </SessionContextProvider>
      </SidebarProvider>
    </div>
  )
}