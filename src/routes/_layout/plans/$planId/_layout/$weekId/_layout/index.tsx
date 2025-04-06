import React, { useState } from 'react'; // Import useState
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
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
import type { PlanDay, PlanExercise } from '@/types/type'; // Adjust path
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

export const Route = createFileRoute('/_layout/plans/$planId/_layout/$weekId/_layout/')({
  component: DayDetailsPage,
})


// --- Main Page Component ---
function DayDetailsPage() {
 return(
   <div>
      {/* hey */}
      <Outlet />
   </div>
 );
}