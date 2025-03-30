import { ExerciseList } from '@/components/ExerciseList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='px-4 py-8'>
       <ExerciseList />
  </div>
}
