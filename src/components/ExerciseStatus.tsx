import { PlanSessionExerciseDetails, PlanSetDetails } from "@/types/planTypes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { useWorkoutLogDetailsFormatted } from "@/api/workouts";
import { useSession } from "@supabase/auth-helpers-react";

const formatSet = (set: PlanSetDetails): string => {
    const parts: string[] = [];
    if (set.target_reps) parts.push(`${set.target_reps} reps`);
    if (set.target_weight) parts.push(`${set.target_weight}${set.target_weight_unit || ''}`);
    if (set.target_duration_seconds) parts.push(`${set.target_duration_seconds}s`);
    if (set.target_distance_meters) parts.push(`${set.target_distance_meters}m`);
    if (parts.length === 0) return "Details TBD"; // Fallback
    let details = parts.join(' @ ');
    if (set.target_rest_seconds) details += ` | ${set.target_rest_seconds}s rest`;
    return details;
};

interface ExerciseStatusProps extends PlanSessionExerciseDetails {
    sessionId: string;
}

export const ExerciseStatus = (exerciseEntry: ExerciseStatusProps) => {
    const user = useSession()?.user
    const { data: formattedWorkouts, isLoading, isError, error } = useWorkoutLogDetailsFormatted(user?.id || '');
    const thisWorkout = formattedWorkouts?.find((w) => w.session_id === exerciseEntry.sessionId)

    const hasExercise = thisWorkout ? thisWorkout.exercises?.find((e) => e.exercise_id === exerciseEntry.exercise_id) : false
    const thisExercise = thisWorkout?.exercises?.find((e) => e.exercise_id === exerciseEntry.exercise_id)

    // const hasExercise = thisWorkout && thisWorkout?.find((e)=>e.exercise_id === exerciseEntry.id)
    return (
        <Card key={exerciseEntry.id} className="space-y-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-base justify-between w-ful flex flex-row">
                    {exerciseEntry.order_index}. {exerciseEntry.exercise.name}
                    <div>
                        {hasExercise && 'Done'}
                    </div>
                </CardTitle>
                {/* Exercise Description */}
                {exerciseEntry.exercise.description && (
                    <CardDescription className="text-xs line-clamp-2">
                        {exerciseEntry.exercise.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {/* Exercise Notes */}
                {exerciseEntry.notes && <p className="text-xs italic text-muted-foreground mb-2">{exerciseEntry.notes}</p>}

                {/* Sets */}
                <ul className="space-y-1 text-sm">
                    {exerciseEntry?.plan_session_exercise_sets?.map((set) => {
                        console.log(set, thisExercise)
                        const isDone = thisExercise?.sets?.find((set)=>set)
                        return (
                            <li key={set.id} className="flex justify-between items-center">
                                <span>Set {set.set_number}: {formatSet(set)}</span>
                                {set.notes && <Badge variant="outline" className="ml-2 text-xs">{set.notes}</Badge>}
                            </li>
                        )
                    })}
                </ul>

                {/* Target Rest Time */}
                {exerciseEntry.target_rest_seconds && (
                    <p className="text-xs text-blue-600 mt-2">Rest {exerciseEntry.target_rest_seconds}s after completing all sets.</p>
                )}
            </CardContent>
        </Card>
    )
}