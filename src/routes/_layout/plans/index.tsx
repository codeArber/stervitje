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

export const Route = createFileRoute('/_layout/plans/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div  className="container py-6">
    <div>
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

    </div>
    <TrainingPlansDashboard />
  </div>
}
