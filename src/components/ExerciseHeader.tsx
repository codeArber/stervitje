import { useFetchExerciseById } from "@/api/exercises"

interface ExerciseHeaderProps {
    exerciseId: string
}

export const ExerciseHeader = ({exerciseId}:ExerciseHeaderProps) => {
    const {data} = useFetchExerciseById(exerciseId)
    return(
        <div>
            {data?.name}
        </div>
    )
}