// FILE: src/components/workout/ActiveWorkoutUI.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PlanExercise, PlanSet, LoggedSet } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, PartyPopper } from 'lucide-react';
import { SetDisplayRow } from '../plan/plan-display/SetDisplayRow'; // Corrected path assumption
import { useWorkoutStore } from '@/stores/workout-store';
import { useNavigate } from '@tanstack/react-router';

// --- TYPE for logged data ---
// Using exercise ID as key for easy lookup. The value is an array of logged sets.
type LoggedData = Record<string, LoggedSet[]>;


export const ActiveWorkoutUI: React.FC = () => {
  // --- Get EVERYTHING from the Zustand store ---
  const {
    groupedExercises,
    currentExerciseIndex,
    currentSetIndex,
    goToNext,
    goToPrevious,
  } = useWorkoutStore();

  // NO MORE local useState for progress!

  const exercises = groupedExercises.flat(); // A flat list for total progress
  const currentGroup = groupedExercises[currentExerciseIndex];
  // Note: This logic assumes one exercise per group for simplicity.
  // We can expand this later to handle the visual aspect of supersets.
  const currentExercise = currentGroup?.[0]; 
  const currentSet = currentExercise?.sets?.[currentSetIndex];

  // TODO: Add logging state and handlers here later

  const workoutProgress = ((currentExerciseIndex + 1) / groupedExercises.length) * 100;

  if (!currentExercise || !currentSet) {
    // This can happen briefly. A better loading state can be added.
    return <p>Loading next exercise...</p>; 
  }

  return (
    <div className="space-y-6">
      <Progress value={workoutProgress} className="w-full" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentExercise.exercise_details.name}</CardTitle>
          <CardDescription>
            Exercise {currentExerciseIndex + 1} of {groupedExercises.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Target for this Set:</h3>
          <SetDisplayRow set={currentSet} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Your Performance</CardTitle>
          <CardDescription>Record what you actually completed for Set {currentSetIndex + 1}.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reps-performed" className="text-sm font-medium">Reps Performed</label>
              <Input id="reps-performed" type="number" placeholder={currentSet.target_reps?.toString() ?? '0'} />
            </div>
            <div>
              <label htmlFor="weight-used" className="text-sm font-medium">Weight Used (kg)</label>
              <Input id="weight-used" type="number" placeholder={currentSet.target_weight?.toString() ?? '0'} />
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goToPrevious} disabled={currentExerciseIndex === 0 && currentSetIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex flex-col items-center">
            <span className="text-sm font-bold">Set {currentSetIndex + 1} / {currentExercise.sets?.length}</span>
            <span className="text-xs text-muted-foreground">{currentExercise.exercise_details.name}</span>
        </div>
        <Button onClick={goToNext}>
          {currentExerciseIndex === groupedExercises.length - 1 && currentSetIndex === (currentExercise.sets?.length ?? 0) - 1
            ? 'Finish Workout'
            : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// --- HELPER FUNCTION: Calculate workout position from logged data ---
const calculateWorkoutPosition = (exercises: PlanExercise[], loggedData: LoggedData) => {
  for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
    const exercise = exercises[exerciseIndex];
    const loggedSets = loggedData[exercise.id] || [];
    const totalSetsForExercise = exercise.sets?.length || 0;
    
    // If this exercise has incomplete logged sets, return this position
    if (loggedSets.length < totalSetsForExercise) {
      return {
        exerciseIndex,
        setIndex: loggedSets.length // Next set to complete
      };
    }
  }
  
  // If all exercises are complete, stay at the last position
  const lastExerciseIndex = exercises.length - 1;
  const lastExercise = exercises[lastExerciseIndex];
  const lastSetIndex = (lastExercise?.sets?.length || 1) - 1;
  
  return {
    exerciseIndex: lastExerciseIndex,
    setIndex: lastSetIndex
  };
};

// --- 2. The Actual Workout Player UI ---
interface WorkoutPlayerProps {
  plannedSession: NonNullable<ReturnType<typeof useWorkoutStore>['plannedSession']>;
  finishWorkout: () => void;
  loggedData: LoggedData;
  setLoggedData: React.Dispatch<React.SetStateAction<LoggedData>>;
}

const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ plannedSession, finishWorkout, loggedData, setLoggedData }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);

  // Memoize exercises to prevent re-sorting on every render
  const exercises = useMemo(() => 
    plannedSession.exercises.slice().sort((a, b) => a.order_within_session - b.order_within_session),
    [plannedSession]
  );

  // --- EFFECT: Restore workout position based on logged data (only run once) ---
  useEffect(() => {
    if (!isPositionInitialized && exercises.length > 0) {
      const { exerciseIndex, setIndex } = calculateWorkoutPosition(exercises, loggedData);
      setCurrentExerciseIndex(exerciseIndex);
      setCurrentSetIndex(setIndex);
      setIsPositionInitialized(true);
    }
  }, [exercises, loggedData, isPositionInitialized]);

  const currentExercise = exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets?.[currentSetIndex];

  // --- HANDLERS for workout progression ---
  const handleNext = useCallback(() => {
    const isLastSet = currentSetIndex >= (currentExercise.sets?.length ?? 0) - 1;
    const isLastExercise = currentExerciseIndex >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      finishWorkout(); // Mark workout as complete, the parent will switch UI
    } else if (isLastSet) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else {
      setCurrentSetIndex(prev => prev + 1);
    }
  }, [currentSetIndex, currentExerciseIndex, currentExercise.sets?.length, exercises.length, finishWorkout]);

  
  const handlePrevious = useCallback(() => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(prev => prev - 1);
    } else if (currentExerciseIndex > 0) {
      const prevExercise = exercises[currentExerciseIndex - 1];
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSetIndex((prevExercise.sets?.length ?? 1) - 1);
    }
  }, [currentSetIndex, currentExerciseIndex, exercises]);

  const logSetData = useCallback((exerciseId: string, setIndex: number, data: Partial<LoggedSet>) => {
    setLoggedData(prev => {
      const exerciseLogs = prev[exerciseId] ? [...prev[exerciseId]] : [];
      // Ensure the logged set object exists before merging
      exerciseLogs[setIndex] = { ...(exerciseLogs[setIndex] || {}), ...data, set_number: setIndex + 1 };
      return { ...prev, [exerciseId]: exerciseLogs };
    });
  }, []);

  const workoutProgress = useMemo(() => {
    // Calculate progress based on completed sets across all exercises
    let completedSets = 0;
    let totalSets = 0;
    
    exercises.forEach(exercise => {
      const setsCount = exercise.sets?.length || 0;
      totalSets += setsCount;
      const loggedSets = loggedData[exercise.id] || [];
      completedSets += loggedSets.length;
    });
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }, [exercises, loggedData]);

  // Don't render until position is initialized to prevent flashing
  if (!isPositionInitialized || !currentExercise || !currentSet) {
    return <p>Loading exercise...</p>;
  }
  
  const isFinalSetOfWorkout = currentExerciseIndex === exercises.length - 1 && currentSetIndex === (currentExercise.sets?.length ?? 0) - 1;
  const repsPlaceholder = currentSet.target_reps?.toString() ?? '0';
  const weightPlaceholder = currentSet.target_weight?.toString() ?? '0';

  // Get previously logged data for this set to pre-populate inputs
  const currentLoggedSet = loggedData[currentExercise.id]?.[currentSetIndex];

  return (
    <div className="space-y-6">
      <Progress value={workoutProgress} className="w-full" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentExercise.exercise_details.name}</CardTitle>
          <CardDescription>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Target for this Set:</h3>
          <SetDisplayRow set={currentSet} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Your Performance</CardTitle>
          <CardDescription>
            Record what you actually completed for Set {currentSetIndex + 1}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reps-performed" className="text-sm font-medium">Reps Performed</label>
              <Input
                id="reps-performed"
                type="number"
                placeholder={repsPlaceholder}
                value={currentLoggedSet?.reps_performed || ''}
                onChange={(e) => logSetData(currentExercise.id, currentSetIndex, { reps_performed: Number(e.target.value) })}
              />
            </div>
            <div>
              <label htmlFor="weight-used" className="text-sm font-medium">Weight Used ({currentSet.target_weight_unit || 'kg'})</label>
              <Input
                id="weight-used"
                type="number"
                placeholder={weightPlaceholder}
                value={currentLoggedSet?.weight_used || ''}
                onChange={(e) => logSetData(currentExercise.id, currentSetIndex, { weight_used: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrevious} disabled={currentExerciseIndex === 0 && currentSetIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex flex-col items-center text-center">
            <span className="text-sm font-bold">Set {currentSetIndex + 1} / {currentExercise.sets?.length}</span>
            <span className="text-xs text-muted-foreground">{currentExercise.exercise_details.name}</span>
        </div>
        <Button onClick={handleNext}>
          {isFinalSetOfWorkout ? 'Finish Workout' : 'Next Set'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// --- 3. The Completion Screen UI ---
interface WorkoutCompletionProps {
    loggedData: LoggedData; // We can use this later to show a summary
    clearWorkout: () => void;
}

const WorkoutCompletionScreen: React.FC<WorkoutCompletionProps> = ({ loggedData, clearWorkout }) => {
    const navigate = useNavigate();

    const handleDone = useCallback(() => {
        // Here is where we finally clear the store state
        clearWorkout();
        // And navigate the user away from the workout player
        navigate({ to: '/dashboard' }); // Or wherever you want them to go
    }, [clearWorkout, navigate]);

    return (
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/20 text-primary rounded-full h-16 w-16 flex items-center justify-center">
                    <PartyPopper size={40} />
                </div>
                <CardTitle className="mt-4 text-2xl">Workout Complete!</CardTitle>
                <CardDescription>Great job finishing your session. Ready for the next one?</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Optional: Add a summary of loggedData here */}
                <Button onClick={handleDone} size="lg">
                    Done
                </Button>
            </CardContent>
        </Card>
    );
};