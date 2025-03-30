// src/components/exercises/ExerciseDisplay.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from '@/types/type'; // Adjust path to your types
import { AspectRatio } from "./ui/aspect-ratio";

interface ExerciseDisplayProps {
  exercise: Exercise; // Expects the fully fetched exercise object
}

// Helper function (can be shared in a utils file)
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

export function ExerciseDisplay({ exercise }: ExerciseDisplayProps) {
  // Basic check if exercise data is somehow missing (should be handled by parent)
  if (!exercise) {
    return <p>Exercise data is missing.</p>;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto"> {/* Adjust max-width as needed */}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{exercise.name}</CardTitle>
        {exercise.description && (
          <CardDescription>{exercise.description}</CardDescription>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {exercise.difficulty_level !== null && exercise.difficulty_level !== undefined && (
            <Badge variant="outline">
              Difficulty: {getDifficultyText(exercise.difficulty_level)}
            </Badge>
          )}
          {/* Display categories if they exist on the fetched object */}
          {exercise.categories && exercise.categories.length > 0 && (
             exercise.categories.map((cat) => (
               <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
             ))
          )}
           {/* Display is_public status if desired */}
           {exercise.is_public !== null && exercise.is_public !== undefined && (
                <Badge variant={exercise.is_public ? "default" : "destructive"}>
                    {exercise.is_public ? 'Public' : 'Private'}
                </Badge>
           )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optional Image */}
        {exercise.image_url && (
          <div>
             <h3 className="text-lg font-semibold mb-2">Image</h3>
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
              <img
                src={exercise.image_url}
                alt={`Image for ${exercise.name}`}
                className="object-cover w-full h-full"
                onError={(e) => (e.currentTarget.src = '/placeholder.svg')} // Fallback
              />
            </AspectRatio>
          </div>
        )}

        {/* Optional Video */}
        {exercise.video_url && (
           <div>
             <h3 className="text-lg font-semibold mb-2">Video Guide</h3>
             <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
               <iframe
                 className="w-full h-full"
                 src={exercise.video_url} // Consider sanitizing or using a safe embed component
                 title={`Video for ${exercise.name}`}
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
             </AspectRatio>
           </div>
         )}


        {/* Instructions */}
        {exercise.instructions && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            {/* Using pre-wrap to respect newlines in the instructions text */}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
               {exercise.instructions}
            </p>
          </div>
        )}

      </CardContent>
      {/* Add CardFooter here if needed for actions like Edit/Delete later */}
    </Card>
  );
}