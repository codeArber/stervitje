// src/components/exercises/ExerciseDisplay.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from '@/types/type'; // Adjust path to your types
import { AspectRatio } from "./ui/aspect-ratio";
import { useExerciseImageUrl, userExerciseReferences } from "@/api/exercises";
import { TikTokEmbed } from "./TikTokEmbed";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const userId = useAuthStore(state => state.getId); // Assuming you have a userId in your auth store
  const exImg = useExerciseImageUrl(exercise.image_url || ''); // Fetch image URL based on exercise ID or name
  const { data: references } = userExerciseReferences(exercise.id, userId() || ''); // Assuming this is a hook to fetch or process references

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
            <AspectRatio ratio={3 / 2} className="bg-muted rounded-md overflow-hidden flex items-center justify-center">
              <img
                src={exImg.data}
                alt={`Image for ${exercise.name}`}
                className="object-scale-down  w-full h-full rounded-xl"
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
        {references &&
          references.map((reference) => (
            <div key={reference.id} className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {references &&
                  references.map((reference) => (
                    <div key={reference.id} className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold mb-2">Reference</h3>
                      <p
                        className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer"
                        onClick={() => {
                          setSelectedReference(reference.url);
                          setOpenDialog(true);
                        }}
                      >
                        {reference.title}
                      </p>
                    </div>
                  ))
                }

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reference Video</DialogTitle>
                    </DialogHeader>
                    {selectedReference && <TikTokEmbed url={selectedReference} />}
                  </DialogContent>
                </Dialog>
              </p>
              {/* <TikTokEmbed url={reference.url} /> */}
            </div>
          ))
        }


        {/* <TikTokEmbed url={exercise?.exercise_reference.url || ''} />  */}




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