import { ExerciseList } from '@/components/ExerciseList'
import { TeamDropdown } from '@/components/TeamDropdown'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className=' w-full'>

    <ExerciseList />
  </div>
}
