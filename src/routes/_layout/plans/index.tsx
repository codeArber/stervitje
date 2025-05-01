import TrainingPlansDashboard from '@/components/PlansDashboard'
import PlansDashboard from '@/components/PlansDashboard'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { TeamDropdown } from '@/components/TeamDropdown'
import { useTeamStore } from '@/store/useTeamStore'

export const Route = createFileRoute('/_layout/plans/')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div className="flex flex-1 flex-col ">
      <div className='flex flex-row '>
        <div className=' bg-sidebar flex items-center shadow px-4 py-4 z-10 w-full justify-between h-18'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/'>
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Plans</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <TeamDropdown />
        </div>
      </div>


      <TrainingPlansDashboard />
    </div>
  )

}
