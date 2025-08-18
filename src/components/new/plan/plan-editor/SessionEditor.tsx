// FILE: src/components/plan-editor/SessionEditor.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, UseFormReturn, Control } from 'react-hook-form';
import { toast } from 'sonner';

// shadcn/ui components
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion for exercises
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
  Dumbbell, // For Add Exercise Button
} from 'lucide-react';

// API Hooks & Types
import {
  useUpdatePlanSessionMutation,
  useDeletePlanSessionMutation,
  useAddPlanSessionExerciseMutation // <--- NEW IMPORT
} from '@/api/plan';
import type {
  PlanSession,
  PlanExercise,
  UpdatePlanSessionPayload,
  AddPlanSessionExercisePayload, // <--- NEW IMPORT
  PlanSet
} from '@/types/plan';

// Import the new ExerciseEditor and ExerciseSelectorDialog
import { ExerciseEditor } from './ExerciseEditor'; // <--- NEW IMPORT
import { ExerciseSelectorDialog } from './ExerciseSelectorDialog'; // <--- NEW IMPORT
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';
import { Exercise } from '@/types/exercise';


interface SessionEditorProps {
  session: PlanSession & { exercises: PlanExercise[] };
  sessionIndex: number;
  dayIndex: number;
  weekIndex: number;
  canEdit: boolean;
  form: UseFormReturn<PlanEditFormData>;
  control: Control<PlanEditFormData>;
  onDeleteSuccess?: () => void;
  // NEW: Pass refetchPlanDetails from parent to trigger full hierarchy refresh
  refetchPlanDetails: () => void;
}

interface SessionDetailsFormData {
  order_index: number;
  title: string | null;
  notes: string | null;
}

export const SessionEditor: React.FC<SessionEditorProps> = ({
  session,
  sessionIndex,
  dayIndex,
  weekIndex,
  canEdit,
  form,
  control,
  onDeleteSuccess,
  refetchPlanDetails
}) => {
  console.log('Session data:', session);
  console.log('Session exercises:', session.exercises);
  
  // Mutations
  const { mutate: updateSession, isPending: isUpdatingSession } = useUpdatePlanSessionMutation();
  const { mutate: deleteSession, isPending: isDeletingSession } = useDeletePlanSessionMutation();
  const { mutate: addExercise, isPending: isAddingExercise } = useAddPlanSessionExerciseMutation();

  // Local state
  const [isEditingSessionDetails, setIsEditingSessionDetails] = useState(false);

  // Memoized field paths to avoid recalculation
  const fieldPaths = useMemo(() => ({
    orderIndex: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.order_index` as const,
    title: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.title` as const,
    notes: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.notes` as const,
    exercises: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions.${sessionIndex}.exercises` as const,
  }), [weekIndex, dayIndex, sessionIndex]);

  // Exercises field array
  const { fields: exercises, remove: removeExerciseFieldArray, replace } = useFieldArray({
    control: form.control,
    name: fieldPaths.exercises,
    keyName: 'fieldId',
  });

  // Sync exercises with session data when session changes
  useEffect(() => {
    if (session.exercises && Array.isArray(session.exercises)) {
      console.log('Syncing exercises with session data:', session.exercises);
      // Replace the field array with the actual session exercises
      replace(session.exercises);
    }
  }, [session.exercises, replace]);

  console.log('Field array exercises:', exercises);

  // Get current session values
  const getCurrentSessionValues = useCallback((): SessionDetailsFormData => ({
    order_index: form.getValues(fieldPaths.orderIndex) as number,
    title: form.getValues(fieldPaths.title) || null,
    notes: form.getValues(fieldPaths.notes) || null,
  }), [form, fieldPaths]);

  // Handle saving session details
  const handleSaveSessionDetails = useCallback(async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this plan.");
      return;
    }

    const data = getCurrentSessionValues();
    const toastId = toast.loading('Saving session details...');

    updateSession({
      p_session_id: session.id,
      p_order_index: data.order_index,
      p_title: data.title,
      p_notes: data.notes,
    }, {
      onSuccess: () => {
        toast.success('Session details updated!', { id: toastId });
        setIsEditingSessionDetails(false);
      },
      onError: (err) => {
        toast.error(`Failed to save session: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, updateSession, session.id, getCurrentSessionValues]);

  // Handle selecting an exercise from the dialog
  const handleSelectExercise = useCallback((exerciseId: string, exerciseDetails: Exercise) => {
    if (!canEdit) {
      toast.error("You don't have permission to add exercises.");
      return;
    }
    
    // Use session.exercises instead of the field array for calculating order
    const nextOrderWithinSession = (session.exercises && session.exercises.length > 0 
      ? Math.max(...session.exercises.map(e => e.order_within_session)) 
      : 0) + 1;

    const payload: AddPlanSessionExercisePayload = {
      p_plan_session_id: session.id,
      p_exercise_id: exerciseId,
      p_order_within_session: nextOrderWithinSession,
      p_notes: null,
      p_execution_group: 1,
      p_post_exercise_rest_seconds: 0,
      p_post_group_rest_seconds: 0,
    };

    const toastId = toast.loading(`Adding "${exerciseDetails.name}"...`);
    addExercise(payload, {
      onSuccess: (newExerciseData) => {
        toast.success(`"${newExerciseData.exercise_details.name}" added!`, { id: toastId });
        refetchPlanDetails(); // This will update the session prop with new exercises
      },
      onError: (err) => {
        toast.error(`Failed to add exercise: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, addExercise, session.id, session.exercises, refetchPlanDetails]);

  // Handle deleting session
  const handleDeleteSession = useCallback(() => {
    if (!canEdit) {
      toast.error("You don't have permission to delete sessions.");
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this session? This will also delete all exercises and sets within it.'
    );

    if (!confirmed) return;

    const toastId = toast.loading('Deleting session...');
    deleteSession({ p_session_id: session.id }, {
      onSuccess: () => {
        toast.success('Session deleted!', { id: toastId });
        onDeleteSuccess?.();
      },
      onError: (err) => {
        toast.error(`Failed to delete session: ${err.message}`, { id: toastId });
      }
    });
  }, [canEdit, deleteSession, session.id, onDeleteSuccess]);

  // Handle removing exercise
  const handleRemoveExercise = useCallback(() => {
    refetchPlanDetails();
    toast.info("Exercise removed. Display will refresh shortly.");
  }, [refetchPlanDetails]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditingSessionDetails(false);
  }, []);

  // Memoized display values
  const sessionLabel = `Session ${session.order_index}: ${session.title || 'Untitled Session'}`;

  return (
    <AccordionItem value={session.id}>
      <AccordionTrigger className="font-semibold text-base hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span>{sessionLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingSessionDetails(true);
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
                handleDeleteSession();
              }}
              disabled={!canEdit || isDeletingSession}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pl-6 space-y-4">
        {/* Session Details Editor */}
        {isEditingSessionDetails && (
          <SessionDetailsEditor
            form={form}
            fieldPaths={fieldPaths}
            canEdit={canEdit}
            isLoading={isUpdatingSession}
            onSave={handleSaveSessionDetails}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Exercises Section */}
        <ExercisesSection
          exercises={exercises}
          onAddExercise={handleSelectExercise}
          onRemoveExercise={handleRemoveExercise}
          canEdit={canEdit}
          sessionIndex={sessionIndex}
          dayIndex={dayIndex}
          weekIndex={weekIndex}
          form={form}
          control={control}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

// Alternative approach: Use session.exercises directly instead of field array
const ExercisesSection: React.FC<ExercisesSectionProps> = ({
  exercises,
  onAddExercise,
  onRemoveExercise,
  canEdit,
  form,
  control,
  sessionIndex,
  dayIndex,
  weekIndex,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-lg">Exercises ({exercises.length})</h4>
      <ExerciseSelectorDialog onSelectExercise={onAddExercise}>
        <Button size="sm" disabled={!canEdit}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </ExerciseSelectorDialog>
    </div>

    <div className="space-y-3">
      {exercises.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No exercises added to this session yet.
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {exercises.map((exerciseField, exerciseIndex) => (
            <ExerciseEditor
                  key={exerciseField.fieldId || exerciseField.id} // Use fieldId if available, fallback to id
                  exercise={exerciseField as PlanExercise & { sets: PlanSet[]; }}
                  exerciseIndex={exerciseIndex}
                  sessionIndex={sessionIndex}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                  canEdit={canEdit}
                  form={form}
                  control={control}
                  onDeleteSuccess={() => onRemoveExercise(exerciseIndex)} refetchPlanDetails={function (): void {
                      throw new Error('Function not implemented.');
                  } }            />
          ))}
        </Accordion>
      )}
    </div>
  </div>
);

// Separate component for session details editing
interface SessionDetailsEditorProps {
  form: UseFormReturn<PlanEditFormData>;
  fieldPaths: {
    orderIndex: string;
    title: string;
    notes: string;
  };
  canEdit: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SessionDetailsEditor: React.FC<SessionDetailsEditorProps> = ({
  form,
  fieldPaths,
  canEdit,
  isLoading,
  onSave,
  onCancel,
}) => (
  <Card className="p-4 bg-muted/20">
    <h4 className="font-semibold mb-2">Edit Session Details</h4>
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={fieldPaths.orderIndex as any} // Cast to any due to complex path inference
        render={({ field }) => (
          <FormItem>
            <FormLabel>Order Index</FormLabel>
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
        name={fieldPaths.title as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Upper Body Focus"
                {...field}
                disabled={!canEdit || isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={fieldPaths.notes as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notes for this session..."
                rows={2}
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

// Separate component for exercises section
interface ExercisesSectionProps {
  exercises: any[]; // exercises array from useFieldArray
  onAddExercise: (exerciseId: string, exerciseDetails: any) => void; // Callback from ExerciseSelectorDialog
  onRemoveExercise: (index: number) => void; // Callback to remove from form array
  canEdit: boolean;
  // Passed down props for ExerciseEditor
  form: UseFormReturn<PlanEditFormData>;
  control: Control<PlanEditFormData>;
  sessionIndex: number;
  dayIndex: number;
  weekIndex: number;
}
