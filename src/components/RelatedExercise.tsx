// import { exercises } from "@/data/exercises"
import { ExerciseCard } from "./ExerciseCard"

interface RelatedExercisesProps {
  currentExerciseId: string
}

export function RelatedExercises({ currentExerciseId }: RelatedExercisesProps) {
  // const currentExercise = exercises.find((ex) => ex.id === currentExerciseId)

  // if (!currentExercise) return null

  // Find exercises in the same category or targeting similar muscles
  // const relatedExercises = exercises
  //   .filter(
  //     (ex) =>
  //       ex.id !== currentExerciseId &&
  //       (ex.category === currentExercise.category ||
  //         ex.muscles.some((muscle) => currentExercise.muscles.includes(muscle))),
  //   )
  //   .slice(0, 4) // Limit to 4 related exercises

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Related Exercises</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* {relatedExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))} */}
      </div>
    </div>
  )
}

