// FILE: src/components/new/plan/plan-edit/WeekEditor.tsx

import React from 'react';
import { toast } from 'sonner';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanDay, PlanWeek } from '@/types/plan';

// --- Child Component ---
import { DayEditor } from './DayEditor';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react';
import { getNextTempId } from '@/utils/tempId';

interface WeekEditorProps {
  weekIndex: number;
  canEdit: boolean;
}

export const WeekEditor: React.FC<WeekEditorProps> = ({
  weekIndex,
  canEdit,
}) => {
  // --- STATE MANAGEMENT ---
  const { plan, updateWeek, deleteWeek, addDay } = usePlanEditor();

  // Safely derive the specific week and its days from the full state object
  const week = plan?.hierarchy.weeks[weekIndex];
  const days = week?.days ?? [];

  // Guard clause in case the plan is not loaded yet
  if (!week) {
    return null;
  }

  // --- HANDLERS ---
  const handleUpdate = (field: keyof PlanWeek, value: any) => {
    const finalValue = (field === 'week_number') ? (value === '' ? null : Number(value)) : value;
    updateWeek(weekIndex, { [field]: finalValue });
  };

  const handleAddDay = () => {
    const nextDayNumber = days.length > 0 ? Math.max(...days.map(d => d.day_number)) + 1 : 1;

    const newDay: PlanDay = {
      id: getNextTempId('set'),
      plan_week_id: week.id,
      day_number: nextDayNumber,
      title: `Day ${nextDayNumber}`,
      description: null,
      is_rest_day: false,
      sessions: [],
    };

    addDay(weekIndex, newDay);
    toast.info(`Optimistically added Day ${nextDayNumber}.`);
  };

  const handleDeleteWeek = () => {
    if (confirm(`Are you sure you want to delete Week ${week.week_number} and all of its content?`)) {
      deleteWeek(weekIndex);
      toast.info(`Optimistically deleted Week ${week.week_number}.`);
    }
  };

  const weekLabel = `Week ${week.week_number}${week.description ? `: ${week.description}` : ''}`;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span>{weekLabel}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDeleteWeek}
            disabled={!canEdit}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Week Details Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
          <Input
            placeholder="Week Number"
            type="number"
            value={week.week_number}
            onChange={e => handleUpdate('week_number', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            placeholder="Week Description (e.g., Strength Focus)"
            value={week.description || ''}
            onChange={e => handleUpdate('description', e.target.value)}
            disabled={!canEdit}
          />
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {[...days] // Create a copy first
            .slice()
            .sort((a, b) => a.day_number - b.day_number) // Now sort the copy
            .map((day, dayIndex) => (
              <DayEditor
                key={day.id}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                canEdit={canEdit}
              />
            ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddDay}
          disabled={!canEdit}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Day
        </Button>
      </CardContent>
    </Card>
  );
};