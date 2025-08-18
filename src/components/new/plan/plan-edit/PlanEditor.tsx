// FILE: src/components/new/plan/plan-edit/PlanEdit.tsx

import React from 'react';
import { toast } from 'sonner';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';

// --- CHILD COMPONENTS ---
import { WeekEditor } from './WeekEditor';

// --- UI COMPONENTS ---
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// --- TYPES ---
import { PlanWeek } from '@/types/plan';

export const PlanEditor: React.FC = () => {
  const { plan, addWeek } = usePlanEditor();

  if (!plan) {
    return null;
  }

  const { weeks } = plan.hierarchy;

  // --- Fixed handleAddWeek function ---
  const handleAddWeek = () => {
    let currentMaxWeekNumber;
    if (plan.hierarchy.weeks) {
      currentMaxWeekNumber = plan.hierarchy.weeks.length > 0
        ? Math.max(...plan.hierarchy.weeks.map(w => w.week_number))
        : 0;
    } else {
      currentMaxWeekNumber = 0;
    }
    const nextWeekNumber = currentMaxWeekNumber + 1;

    // To satisfy the PlanWeek type for our optimistic update
    const newWeek: PlanWeek = {
      id: `temp-week-${Math.random()}`,
      plan_id: plan.plan.id,
      week_number: nextWeekNumber,
      description: null,
      days: [],
    };

    addWeek(newWeek);
    toast.info(`Optimistically added Week ${nextWeekNumber}.`);
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Plan Structure</h2>
        <Button onClick={handleAddWeek} disabled={!plan.can_edit}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Week
        </Button>
      </div>

      {weeks && (
        <>
          {weeks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">No weeks added yet.</h3>
              <p>Click "Add Week" to start building your plan's structure.</p>
            </Card>
          ) : (
            <div className="w-full space-y-6">
              {weeks.map((week, weekIndex) => (
                <WeekEditor
                  key={week.id}
                  weekIndex={weekIndex}
                  canEdit={plan.can_edit}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};