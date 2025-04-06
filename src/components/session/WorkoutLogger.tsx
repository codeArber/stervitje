// src/components/workout/WorkoutLogger.tsx (Example Component)

import React, { useState } from 'react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/supabaseClient'; // Adjust path
import { useMutation } from '@tanstack/react-query'; // For API call state
import { ExerciseLogEntry, SetLogEntry } from '@/types/workoutTypes';


interface ExerciseInputProps {
    /** The exercise log entry object containing details for this exercise instance */
    exerciseLog: ExerciseLogEntry;
  
    /** Callback function triggered when adding a new set to this exercise */
    onAddSet: (
      exerciseTempId: string,
      setDetails: Omit<SetLogEntry, 'set_number' | 'tempId'> // Pass details of the new set (reps, weight, etc.)
    ) => void;
  
    /** Callback function triggered when removing an existing set from this exercise */
    onRemoveSet: (
      exerciseTempId: string,
      setTempId: string // The temporary ID of the specific set to remove
    ) => void;
  
     /** Callback function triggered when removing this entire exercise entry */
    onRemoveExercise: (
      exerciseTempId: string // The temporary ID of this exercise log entry
    ) => void;
  
    /** Callback function triggered when updating the notes for this exercise entry */
    onUpdateNotes: (
      exerciseTempId: string,
      notes: string | null // The new notes value
    ) => void;
  
    // Optional: You might add callbacks for updating sets later
    // onUpdateSet: (exerciseTempId: string, setTempId: string, updates: Partial<SetLogEntry>) => void;
  }

// Placeholder component for adding/viewing exercises and sets
function ExerciseInput({ exerciseLog, onAddSet, onRemoveSet, onRemoveExercise, onUpdateNotes }: ExerciseInputProps) {
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    // Add state for other set inputs (duration, distance, notes etc.)

    const handleAddSet = () => {
        onAddSet(exerciseLog.tempId, {
            reps_performed: reps ? parseInt(reps, 10) : null,
            weight_used: weight ? parseFloat(weight) : null,
            // pass other details like weight_unit, duration_seconds etc.
        });
        // Reset local set input state
        setReps('');
        setWeight('');
    };

    return (
        <div className="border p-4 rounded-md space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold">Exercise ID: {exerciseLog.exercise_id} (Order: {exerciseLog.order_index})</h4>
                <Button variant="destructive" size="sm" onClick={() => onRemoveExercise(exerciseLog.tempId)}>Remove Exercise</Button>
            </div>
            <Textarea
                placeholder="Exercise notes..."
                value={exerciseLog.notes ?? ''}
                onChange={(e) => onUpdateNotes(exerciseLog.tempId, e.target.value || null)}
                rows={1}
             />

            {/* List existing sets */}
            <div className='space-y-1'>
                {exerciseLog.setLogs.map((set) => (
                     <div key={set.tempId} className="flex justify-between items-center text-sm border-b pb-1">
                         <span>Set {set.set_number}: {set.reps_performed || '-'} reps @ {set.weight_used || '-'} {set.weight_unit || ''} {/* Add other details */}</span>
                         <Button variant="ghost" size="sm" className="text-xs h-6 px-1 text-red-600" onClick={() => onRemoveSet(exerciseLog.tempId, set.tempId)}>X</Button>
                     </div>
                ))}
            </div>

            {/* Form to add a new set */}
            <div className="flex gap-2 items-end pt-2">
                <Input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} className="w-20"/>
                <Input type="number" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-20"/>
                {/* Add inputs for unit, duration, distance, set notes */}
                <Button size="sm" onClick={handleAddSet} disabled={!reps && !weight}>Add Set</Button>
            </div>
        </div>
    );
}


export function WorkoutLogger() {
  // Get state and actions from Zustand store
  const {
    isLogging,
    workoutLog,
    exerciseLogs,
    status,
    startWorkout,
    updateWorkoutLogDetails,
    addExerciseLog,
    addSetLog,
    removeSetLog,
    updateExerciseLogNotes,
    removeExerciseLog,
    getWorkoutPayload,
    resetWorkout,
    setStatus,
  } = useWorkoutStore();

  // State for adding a new exercise ID
  const [newExerciseId, setNewExerciseId] = useState('');

  // React Query mutation for submitting the workout
  const submitMutation = useMutation({
      mutationFn: async () => {
          setStatus('submitting');
          const payload = getWorkoutPayload();
          if (!payload) {
              throw new Error("Workout data is not ready.");
          }
          console.log("Submitting Payload:", JSON.stringify(payload, null, 2)); // Log payload before sending

          const { data: workoutId, error } = await supabase.rpc('log_workout', {
              workout_payload: payload
          });

          if (error) {
              console.error("RPC Error log_workout:", error);
              throw new Error(error.message); // Throw error for React Query to catch
          }
           if (typeof workoutId !== 'string' || !workoutId) {
               throw new Error("Log workout RPC did not return a valid UUID.");
           }
          return workoutId; // Return the new workout_log ID on success
      },
      onSuccess: (newWorkoutLogId) => {
          console.log("Workout logged successfully! ID:", newWorkoutLogId);
          setStatus('submitted');
          resetWorkout(); // Clear the store on success
          alert("Workout Logged!"); // Replace with better UI feedback
          // Optional: Invalidate workout history query cache
          // queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
      },
      onError: (error) => {
          console.error("Submit Mutation Error:", error);
          setStatus('error');
          alert(`Error logging workout: ${error.message}`); // Replace with better UI feedback
      }
  });


  if (!isLogging) {
    return (
      <Button onClick={() => startWorkout()}>Start New Workout</Button>
    );
  }

  if (!workoutLog) return null; // Should not happen if isLogging is true

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Logging Workout ({workoutLog.date})</h2>

       {/* Workout Log Details Form */}
       <div className="space-y-2 border-b pb-4">
           <Input
                placeholder="Workout Title (Optional)"
                value={workoutLog.title ?? ''}
                onChange={(e) => updateWorkoutLogDetails({ title: e.target.value || null })}
            />
            <Textarea
                placeholder="Overall Workout Notes..."
                 value={workoutLog.notes ?? ''}
                 onChange={(e) => updateWorkoutLogDetails({ notes: e.target.value || null })}
                 rows={2}
             />
             {/* Add inputs for duration_minutes, overall_feeling, privacy_level */}
       </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Exercises</h3>
        {exerciseLogs.map((exLog) => (
          <ExerciseInput
            key={exLog.tempId}
            exerciseLog={exLog}
            onAddSet={addSetLog}
            onRemoveSet={removeSetLog}
            onRemoveExercise={removeExerciseLog}
            onUpdateNotes={updateExerciseLogNotes}
          />
        ))}

        {/* Add New Exercise */}
        <div className="flex gap-2 items-end pt-4">
           {/* TODO: Replace with Exercise Selector Combobox */}
           <Input
                placeholder="Enter Exercise ID to Add"
                value={newExerciseId}
                onChange={(e) => setNewExerciseId(e.target.value)}
            />
          <Button
            onClick={() => {
                if(newExerciseId.trim()){
                     addExerciseLog({ exercise_id: newExerciseId.trim() });
                     setNewExerciseId(''); // Clear input
                }
            }}
            disabled={!newExerciseId.trim()}
            size="sm"
            variant="secondary"
           >
                Add Exercise
            </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => { if(window.confirm('Discard current workout log?')) { resetWorkout(); }}} disabled={submitMutation.isPending}>
          Cancel Workout
        </Button>
        {/* <Button onClick={() => submitMutation.mutate()} disabled={exerciseLogs.length === 0 || submitMutation.isPending}>
           {submitMutation.isPending ? 'Saving Workout...' : 'Save Workout'}
        </Button> */}
      </div>
       {status === 'error' && <p className="text-red-600 text-sm mt-2">Failed to save workout. Please try again.</p>}
    </div>
  );
}