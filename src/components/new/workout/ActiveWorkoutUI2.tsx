// FILE: src/components/new/workout/ActiveWorkoutUI.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, SkipForward } from 'lucide-react';

// --- Typed Component Imports ---
import { SetDisplay, groupConsecutiveSets } from './SetDisplayComponents';
import type { PlanExercise } from '@/types/plan';
import { useWorkoutStore } from '@/stores/workout-store';
import { AdHocWorkoutBuilder } from './AdHocWorkoutBuilder';

// --- TYPE DEFINITIONS ---
type WorkoutGroup = PlanExercise[];

// ==================================================================
// THE FIX IS HERE: Full implementations for all sub-components
// ==================================================================

const VideoReferencePane: React.FC<{ videoUrl?: string | null; exerciseName?: string | null }> = ({ videoUrl, exerciseName }) => (
  <div className="w-1/3 h-full p-4 hidden lg:block">
    <div className="bg-muted rounded-lg aspect-video w-full h-auto sticky top-24">
      {videoUrl ? (
        <iframe
          key={videoUrl}
          className="w-full h-full rounded-lg"
          src={`${videoUrl}?autoplay=1&mute=1&controls=0&loop=1`}
          title={`Form reference for ${exerciseName}`}
          allow="autoplay;"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">No Video Available</div>
      )}
    </div>
  </div>
);

const RestTimerOverlay: React.FC<{ duration: number; onFinish: () => void; onSkip: () => void }> = ({ duration, onFinish, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div className="text-center">
        <p className="text-muted-foreground mb-2">RESTING</p>
        <h2 className="text-6xl font-bold font-mono tracking-tighter">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h2>
        <Button onClick={onSkip} variant="ghost" className="mt-4"><SkipForward className="mr-2 h-4 w-4" />Skip Rest</Button>
      </div>
    </div>
  );
};

const WorkoutMap: React.FC<{ groups: WorkoutGroup[]; currentGroupIndex: number; onNodeClick: (index: number) => void }> = ({ groups, currentGroupIndex, onNodeClick }) => (
  <div className="mt-auto rounded-xl border-2 mb-8 p-4 z-20 w-full mx-auto">
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto">
      {groups.map((group, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => onNodeClick(index)}>
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all", index < currentGroupIndex && "bg-green-500 border-green-500 text-white", index === currentGroupIndex && "w-10 h-10 border-primary scale-110", index > currentGroupIndex && "bg-muted border-border")}>
              {index < currentGroupIndex ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
            </div>
            <p className={cn("text-xs mt-1", index === currentGroupIndex && "font-bold text-primary")}>
              {group.length > 1 ? 'Superset' : group[0].exercise_details?.name.split(' ')[0]}
            </p>
          </div>
          {index < groups.length - 1 && <div className={cn("flex-1 h-1 transition-all", index < currentGroupIndex ? "bg-green-500" : "bg-muted")} />}
        </React.Fragment>
      ))}
    </div>
  </div>
);


// --- THE MAIN WORKOUT UI CONTROLLER ---
export function ActiveWorkoutUI(): React.JSX.Element {
  const {
    groupedExercises,
    currentGroupIndex,
    currentExerciseIndexInGroup,
    currentSetIndexInExercise,
    jumpToGroup,
  } = useWorkoutStore();

  const [isResting, setIsResting] = useState<boolean>(false);
  const [restDuration, setRestDuration] = useState<number>(60);

  const currentGroup: WorkoutGroup = groupedExercises[currentGroupIndex] || [];
  const currentExercise: PlanExercise | undefined = currentGroup[currentExerciseIndexInGroup];
  const isSuperset: boolean = currentGroup.length > 1;

  const organizedSets = useMemo(() => groupConsecutiveSets(currentExercise?.sets || []), [currentExercise]);

  const handleLogSet = () => {
    const currentSetData = currentExercise?.sets?.[currentSetIndexInExercise];
    if (currentSetData?.target_rest_seconds) { setRestDuration(currentSetData.target_rest_seconds); }
    const isLastExerciseInGroup = currentExerciseIndexInGroup >= currentGroup.length - 1;
    if (isLastExerciseInGroup) {
      setIsResting(true);
    } else {
      console.log("Move to next exercise in superset (needs store action)");
    }
  };

  const handleFinishRest = () => {
    setIsResting(false);
    const isLastSet = currentSetIndexInExercise >= (currentExercise?.sets?.length ?? 1) - 1;
    if (isLastSet) {
      if (currentGroupIndex < groupedExercises.length - 1) {
        jumpToGroup(currentGroupIndex + 1);
      } else {
        alert("Workout Complete!");
      }
    } else {
      console.log("Move to next set (needs store action)");
    }
  };

  const handleNodeClick = (index: number) => {
    if (index === currentGroupIndex) return;
    jumpToGroup(index);
    setIsResting(false);
  };

  if (groupedExercises.length === 0 || !currentExercise) {
    return <AdHocWorkoutBuilder />;
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div className='flex flex-row gap-4 w-full'>
        <div className="w-full flex flex-col items-center py-8">
          <div className="relative w-full h-[70vh] overflow-hidden">
            <div className='p-4 rounded-xl bg-muted h-full gap-4 flex flex-col'>
              <div className='flex flex-col gap-2'>
                {isSuperset && (
                  <div className="flex gap-2 border-b pb-2 mb-2">
                    {currentGroup.map((ex, exIndex) => (
                      <div key={ex.id} className={cn("text-sm text-center font-semibold p-2 rounded-md flex-1", exIndex === currentExerciseIndexInGroup ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                        {ex.exercise_details?.name}
                      </div>
                    ))}
                  </div>
                )}
                <Label>{currentExercise.exercise_details?.name}</Label>
                <Label>Set {currentSetIndexInExercise + 1} of {currentExercise.sets?.length}</Label>
                <img
                  src={currentExercise.exercise_details?.image_url || ''}
                  alt={`Image of ${currentExercise.exercise_details?.name}`}
                  className='w-32 h-32 rounded-md overflow-hidden object-cover bg-background'
                />
              </div>
              <div className="relative flex-grow overflow-y-auto">
                {isResting && <RestTimerOverlay duration={restDuration} onFinish={handleFinishRest} onSkip={handleFinishRest} />}
                <div className="space-y-4">
                  {organizedSets.map((item, index) => {
                    if (item.type === 'single') {
                      return <SetDisplay key={index} set={item.set} isCurrent={item.set.set_number === currentSetIndexInExercise + 1} isCompleted={currentSetIndexInExercise + 1 > item.set.set_number} />;
                    }
                    if (item.type === 'pyramid_group') {
                      return (<div key={index} className="border rounded-lg p-2 space-y-2 bg-muted/30"><h4 className="font-bold text-sm text-center text-muted-foreground">Pyramid</h4>{item.sets.map(set => <SetDisplay key={set.set_number} set={set} isCurrent={set.set_number === currentSetIndexInExercise + 1} isCompleted={currentSetIndexInExercise + 1 > set.set_number} />)}</div>);
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="mt-auto">
                <Button onClick={handleLogSet} size="lg" className="w-full">Log Set</Button>
              </div>
            </div>
          </div>
        </div>
        <VideoReferencePane
          videoUrl={currentExercise.exercise_details?.video_url}
          exerciseName={currentExercise.exercise_details?.name}
        />
      </div>
      <WorkoutMap groups={groupedExercises} currentGroupIndex={currentGroupIndex} onNodeClick={handleNodeClick} />
    </div>
  );
}