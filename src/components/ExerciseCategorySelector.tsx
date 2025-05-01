import * as React from "react"
import { cn } from "@/lib/utils"


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExerciseCategory, ExerciseType } from "@/lib/data"
import { useUpdateExercise } from "@/api/exercises"

type Props = {
  /** Unique ID of the exercise you’re editing */
  exerciseId: string | number
  /** Currently assigned category */
  category: ExerciseCategory
  /** Parent handler → (id, nextCategory) */
  /** Tailwind helper */
  className?: string
}

export function ExerciseCategoryDropdown({
  exerciseId,
  category,
  className,
}: Props) {
  const updateCategory = useUpdateExercise()
  return (
    <Select
      value={category}
      onValueChange={(next) =>
        updateCategory.mutate({
          exerciseId: exerciseId as string,
          payload:{
            category: next as ExerciseCategory,
          }
        })
        // onChange(exerciseId, next as ExerciseCategory)
      }
    >
      <SelectTrigger
        className={cn(
          "w-48 capitalize",            // tweak width as needed
          className
        )}
      >
        <SelectValue placeholder="Choose category" />
      </SelectTrigger>

      <SelectContent>
        {Object.entries(ExerciseCategory).map((cat) => (
          <SelectItem
            key={cat[0]}
            value={cat[1]}
            className="capitalize"
          >
            {cat[1].replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}



type Props2 = {
  /** Unique ID of the exercise you’re editing */
  exerciseId: string | number
  /** Currently assigned category */
  category: ExerciseCategory
  /** Parent handler → (id, nextCategory) */
  /** Tailwind helper */
  className?: string
  type: ExerciseCategory
}
export function ExerciseTypeDropdown({
  exerciseId,
  type,
  className,
}: Props2) {
  const updateCategory = useUpdateExercise()
  return (
    <Select
      value={type}
      onValueChange={(next) =>
        updateCategory.mutate({
          exerciseId: exerciseId as string,
          payload:{
            exercise_type: next as ExerciseCategory,
          }
        })
        // onChange(exerciseId, next as ExerciseCategory)
      }
    >
      <SelectTrigger
        className={cn(
          "w-48 capitalize",            // tweak width as needed
          className
        )}
      >
        <SelectValue placeholder="Choose category" />
      </SelectTrigger>

      <SelectContent>
        {Object.entries(ExerciseType).map((cat) => (
          <SelectItem
            key={cat[0]}
            value={cat[1]}
            className="capitalize"
          >
            {cat[1].replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}