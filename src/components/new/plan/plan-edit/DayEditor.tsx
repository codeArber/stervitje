// FILE: src/ui/plan/edit/DayEditor.tsx

import React from 'react';
import { toast } from 'sonner';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { PlanDay, PlanSession } from '@/types/plan';

// --- Child Component ---
import { SessionEditor } from './SessionEditor';

// --- UI Components & Icons ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { getNextTempId } from '@/utils/tempId';

interface DayEditorProps {
    weekIndex: number;
    dayIndex: number;
    canEdit: boolean;
}

export const DayEditor: React.FC<DayEditorProps> = ({
    weekIndex,
    dayIndex,
    canEdit,
}) => {
    // --- STATE MANAGEMENT (Corrected) ---
    // 1. Get all actions and the full state object using the main hook
    const { plan, updateDay, addSession } = usePlanEditor();

    // 2. Safely derive the specific day and its sessions from the full state
    const day = plan?.hierarchy.weeks[weekIndex]?.days[dayIndex];
    const sessions = day?.sessions ?? []; // Fallback empty array for safety

    if (!day) {
        return null;
    }

    // --- HANDLERS ---
    const handleUpdate = (field: keyof PlanDay, value: any) => {
        const finalValue = (field === 'day_number') ? (value === '' ? null : Number(value)) : value;
        updateDay(weekIndex, dayIndex, { [field]: finalValue });
    };

    const handleAddSession = () => {
        const nextOrderIndex = sessions.length > 0 ? Math.max(...sessions.map(s => s.order_index)) + 1 : 1;

        const newSession: PlanSession = {
            id: getNextTempId('set'),
            plan_day_id: day.id,
            order_index: nextOrderIndex,
            title: `Session ${nextOrderIndex}`,
            notes: null,
            is_completed_by_user: false,
            exercises: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        addSession(weekIndex, dayIndex, newSession);
        toast.info(`Optimistically added Session ${nextOrderIndex}.`);
    };

    return (
        <Card className="bg-background/30 border-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Day {day.day_number}</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor={`rest-day-switch-${day.id}`}>Rest Day</Label>
                        <Switch
                            id={`rest-day-switch-${day.id}`}
                            checked={day.is_rest_day || false}
                            onCheckedChange={(checked) => handleUpdate('is_rest_day', checked)}
                            disabled={!canEdit}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <Input
                        placeholder="Day Title (e.g., Push Day)"
                        value={day.title || ''}
                        onChange={e => handleUpdate('title', e.target.value)}
                        disabled={!canEdit}
                    />
                    <Input
                        placeholder="Day Number"
                        type="number"
                        value={day.day_number}
                        onChange={e => handleUpdate('day_number', e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!day.is_rest_day && (
                    <>
                        {sessions
                            .slice()
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((session, sessionIndex) => (
                                <SessionEditor
                                    key={session.id}
                                    weekIndex={weekIndex}
                                    dayIndex={dayIndex}
                                    sessionIndex={sessionIndex}
                                    canEdit={canEdit}
                                />
                            ))}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleAddSession}
                            disabled={!canEdit}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Session
                        </Button>
                    </>
                )}
                {day.is_rest_day && (
                    <div className="text-center py-8 text-muted-foreground italic">
                        A day of rest to recover and grow stronger.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};