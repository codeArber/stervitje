interface MuscleGroupVisualProps {
    muscles: string[]
  }
  
  export function MuscleGroupVisual({ muscles }: MuscleGroupVisualProps) {
    // This is a simplified visual representation
    // In a real app, you might use an SVG with highlighted muscle groups
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative w-32 h-48 bg-muted rounded-lg">
          {/* Simple body outline */}
          <div className="absolute inset-0 flex items-center justify-center text-xs text-center p-2 text-muted-foreground">
            Muscle group visualization would appear here with highlighted areas for:
            <br />
            {muscles.join(", ")}
          </div>
        </div>
      </div>
    )
  }
  
  