// FILE: src/components/plan-editor/DayEditor.tsx

import React, { useCallback, useMemo, useState } from 'react';
import { useFieldArray, UseFormReturn, Control } from 'react-hook-form';
import { toast } from 'sonner';

// --- NEW --- Import the SessionOverviewDialog
import { SessionOverviewDialog } from './SessionOverviewDialog';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

// Icons
import { Edit, Trash2, PlusCircle, Save, GripVertical, ArrowRight } from 'lucide-react';

// API Hooks & Types
import {
    useUpdatePlanDayMutation,
    useDeletePlanDayMutation,
    useAddPlanSessionMutation,
    useDeletePlanSessionMutation,
} from '@/api/plan';
import type { PlanDay, PlanSession, AddPlanSessionPayload } from '@/types/plan';
import { PlanEditFormData } from '@/routes/_layout/workspace/_workspace-layout/$teamId/plans/$planId/edit';
import { SessionEditorDialog } from './SessionEditorDialog';

// ====================================================================
// --- UPDATED SessionCard Component ---
// Now it's a div that triggers the dialog.
// ====================================================================

interface SessionCardProps {
    session: PlanSession;
    canEdit: boolean;
    onClick: () => void; // <-- New onClick handler to open the dialog
    onDelete: (sessionId: string) => void;
    isDeleting: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, canEdit, onClick, onDelete, isDeleting }) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(session.id);
    };

    const sessionLabel = `Session ${session.order_index}: ${session.title || 'Untitled Session'}`;

    // Lightweight formatter for a set's target info
    const formatSet = (s: any) => {
        const parts: string[] = [];
        if (s.target_reps != null) parts.push(`${s.target_reps} reps`);
        if (s.target_weight != null) parts.push(`${s.target_weight} kg`);
        if (s.target_duration_seconds != null) parts.push(`${Math.round(s.target_duration_seconds)}s`);
        if (s.target_distance_meters != null) parts.push(`${s.target_distance_meters}m`);
        if (s.notes) parts.push(String(s.notes));
        return parts.join(' • ');
    };

    return (
        <div className="group" onClick={onClick}>
            <Card className="hover:border-primary transition-colors duration-200 cursor-pointer">
                <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-[220px] flex-shrink-0">
                            <p className="font-semibold text-base">{sessionLabel}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {canEdit && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={handleDeleteClick}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>

                        {/* Exercises row: horizontally scrollable overview of exercises + sets */}
                        <div className="flex-1 overflow-x-auto">
                            <div className="flex gap-3 py-1 min-h-[72px] items-stretch">
                                {session.exercises && session.exercises.length > 0 ? (
                                    session.exercises.map((ex) => (
                                        <div
                                            key={ex.id}
                                            className="min-w-[200px] max-w-[260px] p-3 bg-muted/10 rounded-md border flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()} // prevent opening modal when interacting with exercise
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm truncate">{ex.exercise_details?.name || 'Exercise'}</p>
                                            </div>
                                            {ex.notes && <p className="text-xs text-muted-foreground truncate mt-1">{ex.notes}</p>}
                                            <div className="mt-2 flex flex-col gap-1">
                                                {ex.sets && ex.sets.length > 0 ? (
                                                    ex.sets.map((s: any) => (
                                                        <div key={s.id ?? `${s.set_number}`} className="text-xs text-muted-foreground rounded px-2 py-1 bg-muted/30">
                                                            {formatSet(s) || `Set ${s.set_number ?? ''}`}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">No sets</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="min-w-[200px] p-3 flex items-center text-sm text-muted-foreground">No exercises</div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


// ====================================================================
// --- UPDATED DayEditor Component ---
// It now manages the state for the dialog.
// ====================================================================

interface DayEditorProps {
    day: PlanDay & { sessions: PlanSession[] };
    dayIndex: number;
    weekIndex: number;
    planId: string; // <-- Pass planId from parent
    canEdit: boolean;
    form: UseFormReturn<PlanEditFormData>;
    control: Control<PlanEditFormData>;
    onDeleteSuccess?: () => void;
    refetchPlanDetails: () => void; // Make sure this is passed down from WeekEditor
}

// DayDetailsFormData remains the same
interface DayDetailsFormData {
    day_number: number;
    title: string | null;
    description: string | null;
    is_rest_day: boolean;
}

export const DayEditor: React.FC<DayEditorProps> = ({
    day,
    dayIndex,
    weekIndex,
    planId,
    canEdit,
    form,
    control,
    onDeleteSuccess,
}) => {
    // --- NEW: State to manage the dialog ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<PlanSession | null>(null);
    const [isEditingDayDetails, setIsEditingDayDetails] = useState(false);
    const handleOpenModal = (session: PlanSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };
    // --- End of new state ---

    const { mutate: updateDay, isPending: isUpdatingDay } = useUpdatePlanDayMutation();
    const { mutate: deleteDay, isPending: isDeletingDay } = useDeletePlanDayMutation();
    const { mutate: addSession, isPending: isAddingSession } = useAddPlanSessionMutation();
    const { mutate: deleteSession, isPending: isDeletingSession } = useDeletePlanSessionMutation();

    const fieldPaths = useMemo(() => ({
        dayNumber: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.day_number` as const,
        title: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.title` as const,
        description: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.description` as const,
        isRestDay: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.is_rest_day` as const,
        sessions: `hierarchy.weeks.${weekIndex}.days.${dayIndex}.sessions` as const,
    }), [weekIndex, dayIndex]);

    const { fields: sessions } = useFieldArray({
        control: form.control,
        name: fieldPaths.sessions,
        keyName: 'fieldId',
    });

    // All handle... functions remain the same as before
    const getCurrentDayValues = useCallback((): DayDetailsFormData => ({ day_number: form.getValues(fieldPaths.dayNumber) as number, title: form.getValues(fieldPaths.title) || null, description: form.getValues(fieldPaths.description) || null, is_rest_day: form.getValues(fieldPaths.isRestDay) || false }), [form, fieldPaths]);
    const handleSaveDayDetails = useCallback(async () => { if (!canEdit) { toast.error("You don't have permission to edit this plan."); return; } const data = getCurrentDayValues(); const toastId = toast.loading('Saving day details...'); updateDay({ p_day_id: day.id, p_day_number: data.day_number, p_title: data.title, p_description: data.description, p_is_rest_day: data.is_rest_day }, { onSuccess: () => { toast.success('Day details updated!', { id: toastId }); setIsEditingDayDetails(false); }, onError: (err) => { toast.error(`Failed to save day: ${err.message}`, { id: toastId }); } }); }, [canEdit, updateDay, day.id, getCurrentDayValues]);
    const handleAddSession = useCallback(() => { if (!canEdit) { toast.error("You don't have permission to add sessions."); return; } const nextOrderIndex = sessions.length > 0 ? Math.max(...sessions.map(s => s.order_index)) + 1 : 1; const payload: AddPlanSessionPayload = { p_plan_day_id: day.id, p_order_index: nextOrderIndex, p_title: `Session ${nextOrderIndex}`, p_notes: null }; const toastId = toast.loading(`Adding Session ${nextOrderIndex}...`); addSession(payload, { onSuccess: (newSessionData) => { toast.success(`Session ${newSessionData.order_index} added!`, { id: toastId }); }, onError: (err) => { toast.error(`Failed to add session: ${err.message}`, { id: toastId }); } }); }, [canEdit, addSession, day.id, sessions]);
    const handleDeleteSession = useCallback((sessionId: string) => { if (!canEdit) { toast.error("You don't have permission to delete sessions."); return; } if (!window.confirm('Are you sure you want to delete this session and all its exercises?')) { return; } const toastId = toast.loading('Deleting session...'); deleteSession({ p_session_id: sessionId }, { onSuccess: () => { toast.success('Session deleted!', { id: toastId }); }, onError: (err) => { toast.error(`Failed to delete session: ${err.message}`, { id: toastId }); } }); }, [canEdit, deleteSession]);
    const handleDeleteDay = useCallback(() => { if (!canEdit) { toast.error("You don't have permission to delete days."); return; } if (!window.confirm(`Are you sure you want to delete Day ${day.day_number}? This will delete all its sessions.`)) return; const toastId = toast.loading('Deleting day...'); deleteDay({ p_day_id: day.id }, { onSuccess: () => { toast.success('Day deleted!', { id: toastId }); onDeleteSuccess?.(); }, onError: (err) => { toast.error(`Failed to delete day: ${err.message}`, { id: toastId }); } }); }, [canEdit, deleteDay, day.id, day.day_number, onDeleteSuccess]);
    const handleCancelEdit = useCallback(() => { setIsEditingDayDetails(false); }, []);
    const displayTitle = day.title || 'Untitled Day';
    const dayLabel = `Day ${day.day_number}: ${displayTitle}${day.is_rest_day ? ' (Rest Day)' : ''}`;

    return (
        <>
            <AccordionItem value={day.id}>
                <AccordionTrigger className="font-semibold text-base hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /><span>{dayLabel}</span></div>
                        <div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsEditingDayDetails(true); }} disabled={!canEdit}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteDay(); }} disabled={!canEdit || isDeletingDay}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pl-6 space-y-4">
                    {isEditingDayDetails && (<DayDetailsEditor form={form} fieldPaths={fieldPaths} canEdit={canEdit} isLoading={isUpdatingDay} onSave={handleSaveDayDetails} onCancel={handleCancelEdit} />)}
                    <SessionsSection
                        sessions={sessions}
                        planId={planId}
                        onAddSession={handleAddSession}
                        onDeleteSession={handleDeleteSession}
                        onSessionClick={handleOpenModal} // <-- Pass the handler to open the modal
                        canEdit={canEdit}
                        isAddingSession={isAddingSession}
                        isDeletingSession={isDeletingSession}
                    />
                </AccordionContent>
            </AccordionItem>

            {/* The Dialog is rendered here, outside the main flow */}
            {/* {selectedSession && (
                <SessionOverviewDialog
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    session={selectedSession}
                    planId={planId}
                />
            )} */}
            {selectedSession && (
                <SessionEditorDialog
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    session={selectedSession}
                    canEdit={canEdit}
                    // refetchPlanDetails={refetchPlanDetails} // Use the dedicated prop
                />
            )}
        </>
    );
};

// ---UNCHANGED Sub-components ---
interface DayDetailsEditorProps { form: UseFormReturn<PlanEditFormData>; fieldPaths: { dayNumber: string; title: string; description: string; isRestDay: string; }; canEdit: boolean; isLoading: boolean; onSave: () => void; onCancel: () => void; }
const DayDetailsEditor: React.FC<DayDetailsEditorProps> = ({ form, fieldPaths, canEdit, isLoading, onSave, onCancel }) => (<Card className="p-4 bg-muted/20"> <h4 className="font-semibold mb-2">Edit Day Details</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <FormField control={form.control} name={fieldPaths.dayNumber as any} render={({ field }) => (<FormItem><FormLabel>Day Number</FormLabel><FormControl><Input type="number" step="1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(Number(e.target.value))} disabled={!canEdit || isLoading} /></FormControl><FormMessage /></FormItem>)} /> <FormField control={form.control} name={fieldPaths.title as any} render={({ field }) => (<FormItem><FormLabel>Title (Optional)</FormLabel><FormControl><Input placeholder="e.g., Full Body Workout" {...field} disabled={!canEdit || isLoading} /></FormControl><FormMessage /></FormItem>)} /> <FormField control={form.control} name={fieldPaths.description as any} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Notes for this day..." rows={2} {...field} disabled={!canEdit || isLoading} /></FormControl><FormMessage /></FormItem>)} /> <FormField control={form.control} name={fieldPaths.isRestDay as any} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!canEdit || isLoading} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Is Rest Day?</FormLabel><FormDescription>Check if this day is a planned rest day.</FormDescription></div></FormItem>)} /> </div> <div className="flex justify-end gap-2 mt-4"> <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button> <Button size="sm" onClick={onSave} disabled={!canEdit || isLoading}><Save className="mr-2 h-4 w-4" />{isLoading ? 'Saving...' : 'Save'}</Button> </div> </Card>);

// --- UPDATED SessionsSection props ---
interface SessionsSectionProps {
    sessions: any[];
    planId: string;
    onAddSession: () => void;
    onDeleteSession: (sessionId: string) => void;
    onSessionClick: (session: PlanSession) => void; // <-- New prop
    canEdit: boolean;
    isAddingSession: boolean;
    isDeletingSession: boolean;
}
const SessionsSection: React.FC<SessionsSectionProps> = ({
    sessions,
    planId,
    onAddSession,
    onDeleteSession,
    onSessionClick, // <-- Destructure new prop
    canEdit,
    isAddingSession,
    isDeletingSession,
}) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Sessions</h4>
            <Button size="sm" onClick={onAddSession} disabled={!canEdit || isAddingSession}><PlusCircle className="mr-2 h-4 w-4" />{isAddingSession ? 'Adding...' : 'Add Session'}</Button>
        </div>
        <div className="space-y-3">
            {sessions.length === 0 ? (<p className="text-muted-foreground text-sm">No sessions added to this day yet.</p>) : (
                sessions.map((sessionField) => (
                    <SessionCard
                        key={sessionField.id}
                        session={sessionField}
                        canEdit={canEdit}
                        onClick={() => onSessionClick(sessionField)} // <-- Wire up the onClick handler
                        onDelete={onDeleteSession}
                        isDeleting={isDeletingSession}
                    />
                ))
            )}
        </div>
    </div>
);