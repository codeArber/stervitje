// src/components/exercises/ExerciseDisplay.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from '@/types/type'; // Adjust path to your types
import { useAuthStore } from "@/hooks/useAuthStore";
import ExerciseInstructions from "./ExerciseInstructions";
import { ExerciseWithRelations } from "@/lib/supabase/types";
// Label is now used in ExerciseCategorySelector
import Model, { IExerciseData, Muscle } from "react-body-highlighter";
import { exercises } from "@/routes/_layout/discover";
import { ExerciseCategoryDropdown, ExerciseTypeDropdown, ExerciseDifficultyDropdown, ExerciseEnvironmentDropdown, ExerciseImage, ExerciseReferences } from "./ExerciseCategorySelector";
import { ExerciseCategory, muscleGroups } from "@/lib/data";
import { useCreateExerciseMuscleGroup, useExerciseImageUrl, useRemoveExerciseMuscleGroup } from "@/api/exercises";
import { MultiSelectMuscleGroup } from "./ExerciseMuscleGroup";
import { Database } from "@/lib/database.types";


export function ExerciseDisplay(exercise: ExerciseWithRelations) {
  // Basic check if exercise data is somehow missing (should be handled by parent)
  if (!exercise) {
    return <p>Exercise data is missing.</p>;
  }

  const exImg = useExerciseImageUrl(exercise.image_url || ''); // Fetch image URL based on exercise ID or name

  const muscleAsList = exercise?.exercise_muscle?.map((muscle) => muscle.muscle_group)

  const targetMuscleGroups: IExerciseData[] = [{
    name: exercise.name,
    muscles: muscleAsList || []
  }]
  const addMuscle = useCreateExerciseMuscleGroup()
  const removeMuscle = useRemoveExerciseMuscleGroup()

  const toggleSelection = (option: string) => {
    if (exercise.exercise_muscle?.find((s) => s.muscle_group === option)) {
      removeMuscle.mutate({ id: exercise.exercise_muscle?.find((s) => s.muscle_group === option)?.id || '', exerciseId: exercise.id })
    } else {
      addMuscle.mutate({
        muscleGroup: {
          muscle_group: option as Database['public']['Enums']['muscle_group_enum'],
          exercise_id: exercise.id
        }
      });
    }
  };

  return (
    <Card className="w-full mx-auto rounded-none border-none"> {/* Adjust max-width as needed */}
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">{exercise.name}</CardTitle>
        {exercise.description && (
          <CardDescription>{exercise.description}</CardDescription>
        )}
        <div className="flex flex-wrap gap-8 pt-4 items-center">

          <div className="flex flex-col h-24">
            <h4 className="text-lg font-medium mb-2">Difficulty</h4>
            <ExerciseDifficultyDropdown exerciseId={exercise.id} difficultyLevel={exercise.difficulty_level} />
          </div>

          <div className="flex flex-col h-24">
            <h4 className="text-lg font-medium mb-2">Exercise Type</h4>
            <ExerciseTypeDropdown
              exerciseId={exercise.id}
              category={exercise.category as ExerciseCategory}
              type={exercise.exercise_type as ExerciseCategory}
            />
          </div>

          <div className="flex flex-col h-24">
            <h4 className="text-lg font-medium mb-2">Category</h4>
            <ExerciseCategoryDropdown exerciseId={exercise.id} category={exercise.category || ""} />
          </div>

          <div className="flex flex-col h-24">
            <h4 className="text-lg font-medium mb-2">Environment</h4>
            <ExerciseEnvironmentDropdown exerciseId={exercise.id} environment={exercise.environment} />
          </div>

        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optional Image */}
        {exercise.image_url && (
          <div className="flex flex-col gap-2">
            <div className="w-full flex flex-row justify-between h-fit overflow-hidden ">
              <div className="w-5/12">
                <ExerciseImage url={exImg.data || ''} alt={`Image for ${exercise.name}`} />
              </div>
              <div className="w-7/12 h-full overflow-hidden ">
                <ExerciseReferences exercise={exercise.exercise_reference_global || []} exerciseId={exercise.id} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row gap-2">
          <div className="w-full flex flex-row justify-between h-fit overflow-hidden ">
            <div className="w-5/12">
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="flex flex-row gap-2" >
                  <Model
                    data={targetMuscleGroups} // Fallback to all exercises if not found
                    style={{ width: '10rem', padding: '1rem' }}
                    onClick={(muscle) => {
                      toggleSelection(muscle.muscle)
                    }}
                  // onClick={handleClick}
                  />
                  <Model
                    data={targetMuscleGroups} // Fallback to all exercises if not found
                    style={{ width: '10rem', padding: '1rem' }}
                    type="posterior"
                    onClick={(muscle) => {
                      toggleSelection(muscle.muscle)
                    }}
                  // onClick={handleClick}
                  />
                </div>
                <MultiSelectMuscleGroup options={muscleGroups} selected={exercise.exercise_muscle || []} exerciseId={exercise.id} />

              </div>
            </div>
            <div className="w-7/12 h-full flex flex-col px-4 gap-4">

              <h3 className="text-xl font-semibold mb-4">Instructions</h3>

              <div className="flex flex-row w-full gap-4">
                {/* Instructions */}
                {exercise.instructions && (
                  <div>
                    <ExerciseInstructions title={exercise.name} instructions={exercise.instructions} />
                  </div>
                )}


              </div>
            </div>
          </div>



        </div>

      </CardContent>
      {/* Add CardFooter here if needed for actions like Edit/Delete later */}
    </Card>
  );
}