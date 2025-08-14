import { createFileRoute } from '@tanstack/react-router'
import { ExerciseList } from '@/components/ExerciseList'

export const Route = createFileRoute('/_layout/exercise/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ExerciseList />
}
