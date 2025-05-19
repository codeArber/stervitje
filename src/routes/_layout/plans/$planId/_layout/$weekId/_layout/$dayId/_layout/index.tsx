import { createFileRoute } from '@tanstack/react-router';
// Import helper components
// Import types
import type { PlanSessionExercise  } from '@/types/planTypes';

export const Route = createFileRoute('/_layout/plans/$planId/_layout/$weekId/_layout/$dayId/_layout/')({
  component: DayDetailsPage,
})

  interface PlanSessionExerciseItemProps {
  exerciseEntry: PlanSessionExercise;
  planId: string;
  // Remove onAddSet, onEditSet - handle internally now
  // onAddSet: (exerciseEntryId: string) => void;
  // onEditSet: (set: PlanExerciseSet) => void;
  onDeleteSet: (setId: string) => void; // Keep delete handler
  onEditEntry: (entry: PlanSessionExercise) => void;
  onDeleteEntry: (entryId: string) => void;
  isDeletingEntry?: boolean;
  isDeletingSetId?: string | null;
}

// --- Main Page Component ---
function DayDetailsPage() {
    return(
      <div>
        Overview of the session here
      </div>
    )
}