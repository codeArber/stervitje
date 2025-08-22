// src/components/exercise/ExerciseMuscleDiagram.tsx
import React from 'react';
import Model from 'react-body-highlighter'; // Assuming Model is the default export
import type { ExerciseMuscleWithEngagement } from '@/types/exercise'; // Import your type

interface ExerciseMuscleDiagramProps {
  muscles: ExerciseMuscleWithEngagement[];
  // You can add props here to control size, e.g., width?: string, height?: string
  // For a list card, we'll use fixed small sizes initially.
}

// Helper function to map your database muscle names to react-body-highlighter muscle names
// (Copied directly from your provided snippet)
function mapMuscleToHighlighter(muscleName: string): string | null {
  const muscleMap: Record<string, string> = {
    // Head/Neck
    'head': 'head',
    'neck': 'neck',

    // Upper Body
    'chest': 'chest',
    'upper-back': 'upper-back',
    'lower-back': 'lower-back',
    'trapezius': 'trapezius',
    'front-deltoids': 'front-deltoids',
    'back-deltoids': 'back-deltoids',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'forearm': 'forearm',

    // Core
    'abs': 'abs',
    'obliques': 'obliques',

    // Lower Body
    'gluteal': 'gluteal',
    'adductor': 'adductor',
    'hamstring': 'hamstring',
    'quadriceps': 'quadriceps',
    'abductors': 'abductors',
    'calves': 'calves'
  };

  return muscleMap[muscleName] || null;
}

const PlanMuscleDiagram: React.FC<ExerciseMuscleDiagramProps> = ({ muscles }) => {
  if (!muscles || muscles.length === 0) {
    return null; // Don't render anything if no muscles are provided
  }

  const primaryMuscles = muscles.filter(m => m.engagement === 'primary');
  const secondaryMuscles = muscles.filter(m => m.engagement === 'secondary');
  const stabilizersMuscles = muscles.filter(m => m.engagement === 'stabilizer'); // Corrected variable name

  // Create muscle data for the body highlighter
  const createMuscleData = () => {
    const activeMuscles: string[] = [];
    [...primaryMuscles, ...secondaryMuscles, ...stabilizersMuscles].forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle && !activeMuscles.includes(mappedMuscle)) { // Ensure uniqueness
        activeMuscles.push(mappedMuscle);
      }
    });
    return {
      muscles: activeMuscles,
    };
  };

  const muscleData = createMuscleData();

  // Create custom styles for different muscle types
  // This approach is more robust than style jsx for reusability.
  const createCustomStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    primaryMuscles.forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        styles[`[data-name="${mappedMuscle}"]`] = {
          fill: '#ef4444', // red-500
          stroke: '#dc2626', // red-600
          strokeWidth: '1.5px', // Slightly thinner stroke for smaller diagram
          transition: 'all 0.2s ease', // Ensure transitions are part of the style object
        };
      }
    });

    secondaryMuscles.forEach(muscle => {
      const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
      if (mappedMuscle) {
        // Only apply if not already colored by primary
        if (!primaryMuscles.some(m => mapMuscleToHighlighter(m.muscle) === mappedMuscle)) {
            styles[`[data-name="${mappedMuscle}"]`] = {
              fill: '#f97316', // orange-500
              stroke: '#ea580c', // orange-600
              strokeWidth: '1px', // Even thinner
              transition: 'all 0.2s ease',
            };
        }
      }
    });

    stabilizersMuscles.forEach(muscle => {
        const mappedMuscle = mapMuscleToHighlighter(muscle.muscle);
        if (mappedMuscle) {
            // Only apply if not already colored by primary or secondary
            if (!primaryMuscles.some(m => mapMuscleToHighlighter(m.muscle) === mappedMuscle) &&
                !secondaryMuscles.some(m => mapMuscleToHighlighter(m.muscle) === mappedMuscle)) {
                styles[`[data-name="${mappedMuscle}"]`] = {
                    fill: '#6b7280', // gray-500
                    stroke: '#4b5563', // gray-600
                    strokeWidth: '0.5px', // Very thin
                    transition: 'all 0.2s ease',
                };
            }
        }
    });

    return styles;
  };

  const customStyles = createCustomStyles();

  return (
    <div className="group relative flex-shrink-0 flex flex-row gap-2 " >
      {/* Front view - always visible */}
        <Model
          data={muscleData}
          styles={customStyles}
          key="anterior-model"
          style={{ width: "80px", height: "100px" }} // Same size as back
        />
      
      {/* Back view - visible on hover */}
        <Model
          data={muscleData}
          styles={customStyles}
          type='posterior'
          key="posterior-model"
          style={{ width: "80px", height: "100px" }} // Same size as front
        />
    </div>
  );
};

export default PlanMuscleDiagram;