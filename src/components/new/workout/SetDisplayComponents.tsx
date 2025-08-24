// FILE: src/components/new/workout/SetDisplayComponents.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Flame, ChevronsDown, Check } from 'lucide-react';

// --- TYPE DEFINITIONS ---

// Describes the structure of a single set object, based on your DB schema and dummy data
export interface SetData {
  set_number: number;
  set_type: 'normal' | 'warmup' | 'pyramid' | 'amrap' | 'for_time' | 'technique';
  target_reps?: number | null;
  target_weight_kg?: number | null;
  target_duration_seconds?: number | null;
  target_rest_seconds?: number | null;
}

// Props for the individual set components
interface SetComponentProps {
  set: SetData;
  isCurrent: boolean;
  isCompleted: boolean;
}

// The shape of the items returned by our grouping function
type GroupedSetItem = 
  | { type: 'single'; set: SetData }
  | { type: 'pyramid_group'; sets: SetData[] };


// --- Individual Set Components ---

const NormalSet: React.FC<SetComponentProps> = ({ set, isCurrent, isCompleted }) => (
  <div className={cn("flex items-center justify-between p-3 rounded-lg", isCurrent ? "bg-muted ring-2 ring-primary" : isCompleted ? "bg-muted/50" : "opacity-50")}>
    <div className="flex items-center gap-2">
      <span className="font-bold">Set {set.set_number}</span>
      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
    </div>
    <span className="text-muted-foreground text-sm">
      {set.target_reps} reps @ {set.target_weight_kg}kg
    </span>
  </div>
);

const AmrapSet: React.FC<SetComponentProps> = ({ set, isCurrent, isCompleted }) => (
  <div className={cn("flex items-center justify-between p-3 rounded-lg border-l-4 border-amber-500", isCurrent ? "bg-muted ring-2 ring-primary" : isCompleted ? "bg-muted/50" : "opacity-50")}>
    <div className="flex items-center gap-2">
      <span className="font-bold flex items-center gap-1"><Flame className="h-4 w-4 text-amber-500"/> AMRAP</span>
      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
    </div>
    <span className="text-muted-foreground text-sm">
      {set.target_duration_seconds ? set.target_duration_seconds / 60 : ''} min @ {set.target_weight_kg}kg
    </span>
  </div>
);

const ForTimeSet: React.FC<SetComponentProps> = ({ set, isCurrent, isCompleted }) => (
  <div className={cn("flex items-center justify-between p-3 rounded-lg border-l-4 border-sky-500", isCurrent ? "bg-muted ring-2 ring-primary" : isCompleted ? "bg-muted/50" : "opacity-50")}>
    <div className="flex items-center gap-2">
      <span className="font-bold flex items-center gap-1"><Clock className="h-4 w-4 text-sky-500"/> For Time</span>
      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
    </div>
    <span className="text-muted-foreground text-sm">
      {set.target_reps} reps
    </span>
  </div>
);


// --- The Master "Switch" Component ---

export const SetDisplay: React.FC<SetComponentProps> = ({ set, isCurrent, isCompleted }) => {
  switch (set.set_type) {
    case 'amrap':
      return <AmrapSet set={set} isCurrent={isCurrent} isCompleted={isCompleted} />;
    case 'for_time':
      return <ForTimeSet set={set} isCurrent={isCurrent} isCompleted={isCompleted} />;
    case 'normal':
    case 'warmup':
    case 'technique':
    case 'pyramid': // Pyramid sets are rendered individually by their group container
    default:
      return <NormalSet set={set} isCurrent={isCurrent} isCompleted={isCompleted} />;
  }
};


// --- Helper function for grouping ---
export const groupConsecutiveSets = (sets: SetData[]): GroupedSetItem[] => {
  if (!sets || sets.length === 0) return [];
  const grouped: GroupedSetItem[] = [];
  let i = 0;
  while (i < sets.length) {
    const currentSet = sets[i];
    if (currentSet.set_type === 'pyramid') {
      const pyramidGroup: SetData[] = [currentSet];
      let j = i + 1;
      while (j < sets.length && sets[j].set_type === 'pyramid') {
        pyramidGroup.push(sets[j]);
        j++;
      }
      grouped.push({ type: 'pyramid_group', sets: pyramidGroup });
      i = j;
    } else {
      grouped.push({ type: 'single', set: currentSet });
      i++;
    }
  }
  return grouped;
};