import { Clock, BarChart3 } from "lucide-react" // Removed Dumbbell as equipment is not available

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// Assuming your main Exercise type reflects fetched data, including optional categories if fetched later
import type { Exercise } from '@/types/type'; // Adjust path to your type definition
import { Link } from "@tanstack/react-router" // Assuming you use TanStack Router
import { useExerciseImageUrl } from "@/api/exercises";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface ExerciseCardProps {
  exercise: Exercise // Use the Exercise type matching your fetched data
}

// Helper function to map difficulty number to text (same as in ExerciseDetail)
const getDifficultyText = (level: number | null | undefined): string => {
  if (level === null || level === undefined) return 'N/A';
  switch (level) {
    case 1: return 'Very Easy';
    case 2: return 'Easy';
    case 3: return 'Medium';
    case 4: return 'Hard';
    case 5: return 'Very Hard';
    default: return 'N/A';
  }
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  // Basic check if exercise data is provided
  if (!exercise) {
    return null; // Or render a placeholder/skeleton card
  }
  const exImg = useExerciseImageUrl(exercise.image_url || '')


  return (
    <Card className="overflow-hidden h-full flex flex-col"> {/* Added flex flex-col for better height management */}
      {/* Image Section */}
      <div className="aspect-video relative bg-muted"> {/* Use aspect-video (16:9) or aspect-square */}
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">

          <img
            // Use image_url from DB, provide a fallback
            src={exImg.data || '/placeholder.svg'}
            alt={exercise.name || 'Exercise image'}
            // Use object-cover for better filling, ensure parent has overflow-hidden
            className="object-cover w-full h-full"
            // Add error handling for broken images (optional)
            onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
          />
        </AspectRatio>
      </div>

      {/* Header Section */}
      <CardHeader className="p-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1" title={exercise.name}>
            {exercise.name || 'Unnamed Exercise'}
          </CardTitle>
          {/* Conditionally render category badge if categories are fetched and available */}
          {/* NOTE: Requires fetchExercises endpoint to fetch categories and Exercise type to include 'categories' array */}
          {/* {exercise.categories && exercise.categories.length > 0 && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {exercise.categories[0].name} // Show first category for simplicity
            </Badge>
          )} */}
        </div>
        {exercise.description && (
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {exercise.description}
          </CardDescription>
        )}
      </CardHeader>

      {/* Content Section (Reduced) */}
      <CardContent className="p-3 pt-0 flex-grow"> {/* flex-grow allows content to push footer down */}
        <div className="grid grid-cols-1 gap-1 text-xs"> {/* Simplified grid */}
          {/* Difficulty Display */}
          {exercise.difficulty_level !== null && exercise.difficulty_level !== undefined && (
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>{getDifficultyText(exercise.difficulty_level)}</span>
            </div>
          )}
          {/* Add other relevant info here if available, e.g., is_public? */}
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-3 pt-0">
        {/* Ensure Link path matches your actual route structure */}
        <Link
          to={`/exercise/$exerciseId`} // Or `/app/exercises/$exerciseId`, etc.
          params={{ exerciseId: exercise.id }}
          className="w-full"
        // Add prefetching if desired
        // preload="intent"
        >
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}