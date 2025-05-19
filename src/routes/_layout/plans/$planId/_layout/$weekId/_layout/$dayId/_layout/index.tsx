import React, { useState } from 'react'; // Import useState
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, PlusCircle, Coffee, Trash2, Edit, Timer } from 'lucide-react'; // Added icons
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion"; // For collapsing sessions
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Import helper components
// Import types
import type { PlanDay, PlanSessionExercise } from '@/types/planTypes';
import { usePlanDetails } from '@/api/plans/plan';
import { useDeleteExercise } from '@/api/exercises';
import { PlanExerciseSet, PlanSessionExercise } from '@/types/planTypes';
import { useCreatePlanSession, useDeletePlanSession } from '@/api/plans/plan_session';
import { useDeletePlanSessionExercise } from '@/api/plans/exercise_entry';
import { useCreatePlanSet, useDeletePlanSet } from '@/api/plans/session_set';
import { CreateSessionForm } from '@/components/CreateSession';
import { AddExerciseToSessionForm } from '@/components/AddExerciseToSession';
import { AddEditSetForm } from '@/components/AddEditSet';
import { PlanSessionExerciseItem } from '@/components/PlanSessionExercise';
import { cn } from '@/lib/utils';

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