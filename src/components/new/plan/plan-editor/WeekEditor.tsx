// FILE: src/components/plan-editor/WeekEditor.tsx

import React, { useCallback, useMemo, useState } from 'react';
import { useFieldArray, UseFormReturn, Control } from 'react-hook-form';
import { toast } from 'sonner';

// shadcn/ui components
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Icons
import {
  Edit,
  Trash2,
  PlusCircle,
  Save,
  GripVertical,
} from 'lucide-react';

// API Hooks & Types
import {
  useUpdatePlanWeekMutation,
  useDeletePlanWeekMutation,
  useAddPlanDayMutation,
} from '@/api/plan';
import type {
  PlanWeek,
  PlanDay,
  AddPlanDayPayload,
} from '@/types/plan';

// Components
import { DayEditor } from './DayEditor';
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';

interface WeekEditorProps {
  week: PlanWeek & { days: PlanDay[] };
  weekIndex: number;
  planId: string;
  canEdit: boolean;
  form: UseFormReturn<PlanEditFormData>;
  control: Control<PlanEditFormData>;
  onDeleteSuccess?: () => void;
}

interface WeekDetailsFormData {
  week_number: number;
  description: string | null;
}

export const WeekEditor: React.FC<WeekEditorProps> = ({
  week,
  weekIndex,
  planId,
  canEdit,
  form,
  control,
  onDeleteSuccess,
}) => {
  // Mutations
  const { mutate: updateWeek, isPending: isUpdatingWeek } = useUpdatePlanWeekMutation();
  const { mutate: deleteWeek, isPending: isDeletingWeek } = useDeletePlanWeekMutation();
  const { mutate: addDay, isPending: isAddingDay } = useAddPlanDayMutation();

  // Local state
  const [isEditingWeekDetails, setIsEditingWeekDetails] = useState(false);

  // Memoized field paths
  const fieldPaths = useMemo(() => ({
    weekNumber: `hierarchy.weeks.${weekIndex}.week_number` as const,
    description: `hierarchy.weeks.${weekIndex}.description` as const,
    days: `hierarchy.weeks.${weekIndex}.days` as const,
  }), [weekIndex]);

  // Days field array
  const { fields: days } = useFieldArray({
    control: form.control,
    name: fieldPaths.days,
    keyName: 'fieldId',
  });

  // Get current week values
  const getCurrentWeekValues = useCallback((): WeekDetailsFormData => ({
    week_number: form.getValues(fieldPaths.weekNumber) as number,
    description: form.getValues(fieldPaths.description) || null,
  }), [form, fieldPaths]);

  // Handle saving week details
  const handleSaveWeekDetails = useCallback(async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this plan.");
      return;
    }

    const data = getCurrentWeekValues();
    const toastId = toast.loading('Saving week details...');

    updateWeek({
      p_week_id: week.id,
      p_week_number: data.week_number,
      p_description: data.description,
    }, {
      onSuccess: () => {
        toast.success('Week details updated!', { id: toastId });
        setIsEditingWeekDetails(false);
      },
      onError: (err) => {
        toast.error(`Failed to save week: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, updateWeek, week.id, getCurrentWeekValues]);

  // Handle adding new day
  const handleAddDay = useCallback(() => {
    if (!canEdit) {
      toast.error("You don't have permission to add days.");
      return;
    }

    const nextDayNumber = days.length > 0 
      ? Math.max(...days.map(d => d.day_number)) + 1 
      : 1;
    
    const payload: AddPlanDayPayload = {
      p_plan_week_id: week.id,
      p_day_number: nextDayNumber,
      p_title: `Day ${nextDayNumber}`,
      p_description: null,
      p_is_rest_day: false,
    };

    const toastId = toast.loading(`Adding Day ${nextDayNumber}...`);
    addDay(payload, {
      onSuccess: (newDayData) => {
        toast.success(`Day ${newDayData.day_number} added!`, { id: toastId });
      },
      onError: (err) => {
        toast.error(`Failed to add day: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, addDay, week.id, days]);

  // Handle deleting week
  const handleDeleteWeek = useCallback(() => {
    if (!canEdit) {
      toast.error("You don't have permission to delete weeks.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Week ${week.week_number}? This will also delete all days, sessions, exercises, and sets within it.`
    );

    if (!confirmed) return;

    const toastId = toast.loading('Deleting week...');
    deleteWeek({ p_week_id: week.id }, {
      onSuccess: () => {
        toast.success('Week deleted!', { id: toastId });
        onDeleteSuccess?.();
      },
      onError: (err) => {
        toast.error(`Failed to delete week: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, deleteWeek, week.id, week.week_number, onDeleteSuccess]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditingWeekDetails(false);
  }, []);

  // Memoized display values
  const weekLabel = `Week ${week.week_number}${week.description ? ` — ${week.description}` : ''}`;

  return (
    <AccordionItem value={week.id}>
      <AccordionTrigger className="font-semibold text-lg hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span>{weekLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingWeekDetails(true);
              }}
              disabled={!canEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWeek();
              }}
              disabled={!canEdit || isDeletingWeek}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pl-6 space-y-4">
        {/* Week Details Editor */}
        {isEditingWeekDetails && (
          <WeekDetailsEditor
            form={form}
            fieldPaths={fieldPaths}
            canEdit={canEdit}
            isLoading={isUpdatingWeek}
            onSave={handleSaveWeekDetails}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Days Section */}
        <DaysSection
          days={days}
          weekIndex={weekIndex}
          weekId={week.id}
          onAddDay={handleAddDay}
          canEdit={canEdit}
          isAddingDay={isAddingDay}
          form={form}
          control={control}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

// Separate component for week details editing
interface WeekDetailsEditorProps {
  form: UseFormReturn<PlanEditFormData>;
  fieldPaths: {
    weekNumber: string;
    description: string;
  };
  canEdit: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const WeekDetailsEditor: React.FC<WeekDetailsEditorProps> = ({
  form,
  fieldPaths,
  canEdit,
  isLoading,
  onSave,
  onCancel,
}) => (
  <Card className="p-4 bg-muted/20">
    <h4 className="font-semibold mb-2">Edit Week Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={fieldPaths.weekNumber as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Week Number</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!canEdit || isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={fieldPaths.description as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Strength Focus"
                {...field}
                disabled={!canEdit || isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <div className="flex justify-end gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={!canEdit || isLoading}
      >
        <Save className="mr-2 h-4 w-4" />
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </Card>
);

// Separate component for days section
interface DaysSectionProps {
  days: any[];
  weekIndex: number;
  weekId: string;
  onAddDay: () => void;
  canEdit: boolean;
  isAddingDay: boolean;
  form: UseFormReturn<PlanEditFormData>;
  control: Control<PlanEditFormData>;
}

const DaysSection: React.FC<DaysSectionProps> = ({
  days,
  weekIndex,
  weekId,
  onAddDay,
  canEdit,
  isAddingDay,
  form,
  control,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-lg">Days</h4>
      <Button
        size="sm"
        onClick={onAddDay}
        disabled={!canEdit || isAddingDay}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {isAddingDay ? 'Adding Day...' : 'Add Day'}
      </Button>
    </div>

    <div className="space-y-3">
      {days.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No days added to this week yet.
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {days.map((dayField, dayIndex) => (
            <DayEditor
              key={dayField.id}
              day={dayField}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              canEdit={canEdit}
              form={form}
              control={control}
            />
          ))}
        </Accordion>
      )}
    </div>
  </div>
);