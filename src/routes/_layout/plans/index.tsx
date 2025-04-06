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

export const Route = createFileRoute('/_layout/plans/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="py-6 w-full items-center">
    <div className='w-full flex flex-row items-center gap-32'>
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
      <div className='flex items-center gap-2'>
        <TeamDropdown />
      </div>

    </div>

    <TrainingPlansDashboard />
  </div>
}
