import { useWorkoutLogDetailsFormatted } from '@/api/workouts';
import { useSession } from '@supabase/auth-helpers-react';
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ExerciseHeader } from '@/components/ExerciseHeader';


export const Route = createFileRoute('/_layout/history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useSession()?.user;
  const { data: formattedWorkouts, isLoading, isError, error } = useWorkoutLogDetailsFormatted(user?.id || '');

  if (isLoading) {
      return <div>Loading workout history...</div>;
  }

  if (isError) {
      return <div>Error loading workout history: {error?.message}</div>;
  }

  return (
    <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Workout History</h2>
        {formattedWorkouts?.length === 0 && <p>No workouts logged yet.</p>}
        {formattedWorkouts?.map((workout) => (
            <Card key={workout.id} className="mb-4">
                <CardHeader>
                    <CardTitle>{workout.title || `Workout on ${new Date(workout.date).toLocaleDateString()}`}</CardTitle>
                    <CardDescription>Date: {new Date(workout.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" collapsible>
                        {workout.exercises?.map((exercise) => (
                            <AccordionItem key={exercise.id} value={`exercise-${exercise.id}`}>
                                <AccordionTrigger>
                                <ExerciseHeader exerciseId={exercise.exercise_id}/>
                                </AccordionTrigger>
                                <AccordionContent className="pl-6">
                                    <ul className="list-disc pl-4">
                                        {exercise.sets?.map((set) => (
                                            <li key={set.id}>
                                                Set {set.set_number}: {set.reps_performed} reps @ {set.weight_used}{set.weight_unit || 'kg'}
                                                {set.duration_seconds && ` for ${set.duration_seconds} seconds`}
                                                {set.distance_meters && ` covering ${set.distance_meters} meters`}
                                                {set.notes && ` (Notes: ${set.notes})`}
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                        {workout.exercises?.length === 0 && <p className="text-sm text-muted-foreground">No exercises logged for this workout.</p>}
                    </Accordion>
                    {workout.notes && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            <strong>Workout Notes:</strong> {workout.notes}
                        </div>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
);
}