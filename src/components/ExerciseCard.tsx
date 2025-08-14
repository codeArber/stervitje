import { Exercise } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

type ExerciseCardProps = {
  exercise: Exercise & {
    exercise_to_category?: { category: string }[];
    exercise_to_type?: { type: string }[];
  };
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  // Get difficulty level as text
  const difficultyText = exercise.difficulty_level 
    ? `${exercise.difficulty_level}/5` 
    : 'Not rated';

  // Format environment name
  const environmentName = exercise.environment 
    ? exercise.environment.charAt(0).toUpperCase() + exercise.environment.slice(1)
    : 'Unknown';

  // Get category names (if available)
  const categoryNames = exercise.exercise_to_category?.map(cat => {
    return cat.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }) || [];

  // Get type names (if available)
  const typeNames = exercise.exercise_to_type?.map(type => {
    return type.type.charAt(0).toUpperCase() + type.type.slice(1);
  }) || [];

  return (
    <Link to="/exercise/$exerciseId" params={{ exerciseId: exercise.id }}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer">
        {/* Image placeholder - using a dummy image since we don't have real images yet */}
        <div className="relative h-48 overflow-hidden">
          {exercise.image_url ? (
            <img 
              src={exercise.image_url} 
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Exercise+Image';
              }}
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{exercise.name}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col">
          {exercise.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {exercise.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-auto">
            <Badge variant="secondary" className="text-xs">
              {difficultyText}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {environmentName}
            </Badge>
            {categoryNames.length > 0 && categoryNames.map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                Category: {category}
              </Badge>
            ))}
            {typeNames.length > 0 && typeNames.map((type, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                Type: {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
