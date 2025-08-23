import { useUserMeasurementsQuery } from '@/api/user';
import { MeasurementHistory } from '@/components/new/measurements/MeasurementHistory';
import { Breadcrumb } from '@/components/new/TopNavigation'
import { useAuthStore } from '@/stores/auth-store';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/profile/measurements/details/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuthStore();
  const { data: measurements, isLoading } = useUserMeasurementsQuery(user?.id);
  return (
    <div className='pb-6'>
      <Breadcrumb currentPath={location.pathname} />
      <MeasurementHistory measurements={measurements || []} isLoading={isLoading} isError={false} error={null} />
    </div>
  )
}
