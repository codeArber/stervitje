// FILE: src/ui/plan/edit/PlanEditorBasicDetailsForm.tsx

import React from 'react';

// --- STATE MANAGEMENT IMPORTS ---
import { usePlanEditor } from '@/stores/editor/PlanEditorProvider';
import type { Plan } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

export const PlanEditorBasicDetailsForm: React.FC = () => {
    // Select the specific data and actions needed for this form
    const { plan, canEdit, updatePlanDetail } = usePlanEditor(state => ({
        plan: state.plan?.plan,
        canEdit: state.plan?.can_edit ?? false,
        updatePlanDetail: state.updatePlanDetail,
    }));

    if (!plan) return null; // Should not happen if used within the provider correctly

    // Generic handler to update any field in the plan object
    const handleUpdate = (field: keyof Plan, value: any) => {
        const numericFields: (keyof Plan)[] = ['difficulty_level'];
        const finalValue = numericFields.includes(field) ? (value === '' || value === 'null' ? null : Number(value)) : value;
        updatePlanDetail(field, finalValue);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Basic Plan Details
                </CardTitle>
                <CardDescription>Update the title, description, and other core settings for this plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="plan-title">Title</Label>
                        <Input id="plan-title" value={plan.title} onChange={e => handleUpdate('title', e.target.value)} disabled={!canEdit} />
                    </div>
                    <div>
                        <Label>Difficulty Level</Label>
                        <Select
                            value={plan.difficulty_level?.toString() ?? 'null'}
                            onValueChange={(value) => handleUpdate('difficulty_level', value)}
                            disabled={!canEdit}
                        >
                            <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">(Optional) No Level</SelectItem>
                                {[1, 2, 3, 4, 5].map(level => <SelectItem key={level} value={level.toString()}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="plan-description">Description</Label>
                    <Textarea id="plan-description" value={plan.description ?? ''} onChange={e => handleUpdate('description', e.target.value)} disabled={!canEdit} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="plan-private" checked={plan.private} onCheckedChange={checked => handleUpdate('private', checked)} disabled={!canEdit} />
                    <Label htmlFor="plan-private">Make Plan Private</Label>
                </div>
            </CardContent>
        </Card>
    );
};