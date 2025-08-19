// FILE: src/components/workout/WorkoutSummary.tsx

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLogWorkoutMutation } from '@/api/plan';
import type { LogWorkoutPayload } from '@/types/plan';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PartyPopper, Save, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workout-store';

export const WorkoutSummary: React.FC = () => {
  const navigate = useNavigate();
  
  // --- Get data and actions from the store ---
  const { activeSessionLog, loggedExercises, startedAt, clearWorkout } = useWorkoutStore();
  const { mutate: logWorkout, isPending: isSaving } = useLogWorkoutMutation();

  // --- Local state for the summary form ---
  const [overallFeeling, setOverallFeeling] = useState(3); // Default to 'Good'
  const [notes, setNotes] = useState('');

  const handleSaveWorkout = () => {
    if (!activeSessionLog) {
      toast.error("Error: No active session to save.");
      return;
    }

    // Calculate duration
    const durationMinutes = startedAt ? Math.round((new Date().getTime() - new Date(startedAt).getTime()) / 60000) : 0;

    // Construct the payload for our RPC
    const payload: LogWorkoutPayload = {
      session_log_id: activeSessionLog.id,
      duration_minutes: durationMinutes,
      overall_feeling: overallFeeling,
      notes: notes,
      performed_exercises: loggedExercises, // Pass the logged exercises from the store
    };

    console.log("Saving workout with payload:", payload);
    logWorkout(payload, {
      onSuccess: () => {
        // On successful save, clear the store and navigate away
        clearWorkout();
        navigate({ to: '/dashboard' });
      },
      // onError is already handled by the hook's default options
    });
  };

  const handleDiscardWorkout = () => {
    if (confirm("Are you sure you want to discard this workout? All progress will be lost.")) {
      // TODO: We need a `discard_workout` RPC to delete the 'in_progress' session_log
      toast.info("Workout discarded. (Deletion logic to be added)");
      clearWorkout();
      navigate({ to: '/dashboard' });
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/20 text-primary rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <PartyPopper size={40} />
          </div>
          <CardTitle className="text-2xl">Workout Complete!</CardTitle>
          <CardDescription>Great job. Add some final details and save your session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-left">
          {/* Overall Feeling Slider */}
          <div className="space-y-2">
            <Label htmlFor="feeling">Overall Feeling (1=Poor, 5=Great)</Label>
            <div className="flex items-center gap-4">
                <Slider
                    id="feeling"
                    min={1}
                    max={5}
                    step={1}
                    value={[overallFeeling]}
                    onValueChange={(value) => setOverallFeeling(value[0])}
                />
                <span className="font-bold text-lg w-8 text-center">{overallFeeling}</span>
            </div>
          </div>
          
          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notes">Workout Notes</Label>
            <Textarea
              id="notes"
              placeholder="How did the session go? Any PRs or things to remember for next time?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleDiscardWorkout}>
            <Trash2 className="mr-2 h-4 w-4" /> Discard
        </Button>
        <Button onClick={handleSaveWorkout} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>
    </div>
  );
};