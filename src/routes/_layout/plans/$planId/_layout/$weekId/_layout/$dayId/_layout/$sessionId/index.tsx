import { usePlanDetails } from '@/api/plans/plan';
import { PlanSessionExerciseItem } from '@/components/PlanSessionExercise';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createFileRoute } from '@tanstack/react-router'
import { Clock, Plus, PlusCircle, Trash2, Repeat, Weight, Timer, Route as RouteIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlanSessionExercise } from '@/types/planTypes';
import type { Exercise } from '@/types/type';
import { useCreatePlanSet, useUpdatePlanSet } from '@/api/plans/session_set';
import { useCreatePlanSessionExercise, useUpdatePlanSessionExercise } from '@/api/plans/exercise_entry';
import { useExerciseImageUrl, useInfiniteExercises } from '@/api/exercises';
import { Constants } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';
import { useTeamStore } from '@/store/useTeamStore';
import { useActiveMemberInTeam, useMemberInTeam } from '@/api/teams';
import { useAuthStore } from '@/hooks/useAuthStore';
import { kgToLbs } from '@/lib/unitConversion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SessionExerciseCardProps {
  exercise: PlanSessionExercise;
  isSelected: boolean;
  onClick: () => void;
  unit: 'imperial' | 'metric';
}

function SessionExerciseCard({ exercise, isSelected, onClick, unit }: SessionExerciseCardProps) {
  const exImg = useExerciseImageUrl(exercise.exercise?.image_url || '');

  return (
    <Card onClick={onClick} className={cn('cursor-pointer', isSelected && 'border-blue-200')}>
      <CardHeader>
        <CardTitle>{exercise.exercise?.name}</CardTitle>
        <CardDescription>{exercise.notes}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-nowrap items-start gap-2 w-full">
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden flex-shrink-0 w-32">
            <img
              src={exImg.data || '/placeholder.svg'}
              className="object-cover w-full h-full"
              onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
            />
          </AspectRatio>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {exercise?.plan_session_exercise_sets?.map((set) => (
              <div key={set.id} className="flex items-center gap-4 text-sm">
                <Badge variant="outline">{set.set_number}</Badge>
                {set.target_duration_seconds && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                {set.target_reps && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{set.target_reps} reps</span>
                  </div>
                )}
                {set.target_weight && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {unit === 'imperial' ? kgToLbs(set.target_weight) : set.target_weight}{' '}
                      {unit === 'imperial' ? 'lb' : 'kg'}
                    </span>
                  </div>
                )}
                {set.target_distance_meters && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{set.target_distance_meters}m</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExerciseOptionButtonProps {
  exercise: Exercise;
  onAdd: () => void;
}

function ExerciseOptionButton({ exercise, onAdd }: ExerciseOptionButtonProps) {
  const img = useExerciseImageUrl(exercise.image_url || '');
  return (
    <Button variant="outline" className="flex items-center gap-2 min-w-52 py-8 justify-between overflow-hidden " onClick={onAdd}>
      <AspectRatio ratio={16/9} className="bg-muted rounded w-24 overflow-hidden">
        <img src={img.data || '/placeholder.svg'} className="object-contain w-full h-full" onError={(e) => (e.currentTarget.src = '/placeholder.svg')} />
      </AspectRatio>
     <p className="flex-1 text-right ">{exercise.name}</p>
      <PlusCircle className="h-4 w-4" />
    </Button>
  );
}


export const Route = createFileRoute(
  '/_layout/plans/$planId/_layout/$weekId/_layout/$dayId/_layout/$sessionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId, planId, weekId, dayId } = Route.useParams()
  const { data: planData, isLoading, isError, error } = usePlanDetails(planId);
  const [editSession, setEditSession] = useState(false);
  const [selectedEx, setSelectedEx] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{ difficulty?: number; type?: string; category?: string; environment?: string; muscle?: string }>({});
  const updateExercise = useUpdatePlanSet()
  const {
    data: allExercises,
    fetchNextPage,
    hasNextPage,
    isFetching, // Overall fetching state (initial load + next page)
    isFetchingNextPage, // Specifically fetching the next page
  } = useInfiniteExercises(filters);

  console.log(allExercises)
  // --- Find current data ---
  const week = !isLoading && !isError && planData?.plan_weeks?.find(w => w.id === weekId);
  const day = !isLoading && !isError && week?.plan_days?.find(d => d.id === dayId);
  const currentSessions = day?.plan_sessions || [];
  const thisSession = currentSessions?.find(s => s.id === sessionId);
  const addExercise = useCreatePlanSessionExercise()

  const selectedExercise = thisSession?.plan_session_exercises?.find(ex => ex.id === selectedEx);
  const createSet = useCreatePlanSet()
  const { selectedTeamId } = useTeamStore()
  const thisUser = useActiveMemberInTeam(selectedTeamId);
  const unit = useAuthStore().getPreferredUnit();
  const exImg = useExerciseImageUrl(selectedExercise?.exercise.image_url || '')

  return (
    <div>
      <div className="flex flex-row flex-wrap gap-4">

        {thisSession.plan_session_exercises?.map((exercise) => (
          <SessionExerciseCard
            key={exercise.id}
            exercise={exercise as PlanSessionExercise}
            isSelected={exercise.id === selectedEx}
            onClick={() => {
              setEditSession(true);
              setSelectedEx(exercise.id);
            }}
            unit={unit}
          />
        ))}
        {thisUser?.role === 'coach' &&
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader>
                  <CardTitle>
                    <Plus className="mr-2" />
                  </CardTitle>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Select value={filters.difficulty?.toString()}
                    onValueChange={(v) => setFilters(f => ({ ...f, difficulty: v ? Number(v) : undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {[1,2,3,4,5].map(lvl => (
                        <SelectItem key={lvl} value={lvl.toString()}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.type}
                    onValueChange={(v) => setFilters(f => ({ ...f, type: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Constants.public.Enums.exercise_type_enum.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.category}
                    onValueChange={(v) => setFilters(f => ({ ...f, category: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Constants.public.Enums.exercise_category.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.environment}
                    onValueChange={(v) => setFilters(f => ({ ...f, environment: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Constants.public.Enums.exercise_environment.map(env => (
                        <SelectItem key={env} value={env}>{env}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.muscle}
                    onValueChange={(v) => setFilters(f => ({ ...f, muscle: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Muscle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Constants.public.Enums.muscle_group_enum.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
                <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
                  {allExercises?.pages?.map(page =>
                    page?.map(exercise => (
                      <ExerciseOptionButton
                        key={exercise.id}
                        exercise={exercise}
                        onAdd={() => {
                          addExercise.mutate({
                            plan_session_id: thisSession.id,
                            exercise_id: exercise.id,
                            order_index: Math.max(0, ...thisSession.plan_session_exercises.map(ex => ex.order_index)) + 1,
                            planId: planId
                          });
                          setIsAddDialogOpen(false);
                        }}
                      />
                    ))
                  )}
                  {hasNextPage && (
                    <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Loading...' : 'Load more'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      </div>
      <Sheet open={editSession} onOpenChange={(open) => {
        setEditSession(open);
        if (!open) {
          setSelectedEx('');
        }
      }} >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedExercise?.exercise?.name}
            </SheetTitle>
            <SheetDescription>
              {/* This action cannot be undone. This will permanently delete your account
              and remove your data from our servers. */}
              <div className='px-2 py-6 rounded '>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">

                  <img
                    // Use image_url from DB, provide a fallback
                    src={exImg?.data || '/placeholder.svg'}
                    // Use object-cover for better filling, ensure parent has overflow-hidden
                    className="object-cover w-full h-full"
                    // Add error handling for broken images (optional)
                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                  />
                </AspectRatio>
              </div>
            </SheetDescription>
          </SheetHeader>
          <div>
            <div>
              <div className="flex flex-col gap-2">
                {selectedExercise?.plan_session_exercise_sets?.map((set) => (
                  <div key={set.id} className="flex flex-col gap-1 border rounded-md p-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="text-xs w-10 justify-center py-1">
                        Set {set.set_number}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Repeat className="h-3.5 w-3.5" />
                        <Input
                          type="number"
                          className="h-7 w-16"
                          value={set.target_reps ?? ''}
                          onBlur={(e) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: {
                                target_reps: e.target.value === '' ? null : parseInt(e.target.value),
                              },
                              planId: planId,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Weight className="h-3.5 w-3.5" />
                        <Input
                          type="number"
                          className="h-7 w-16"
                          value={set.target_weight ?? ''}
                          onBlur={(e) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: {
                                target_weight: e.target.value === '' ? null : parseFloat(e.target.value),
                              },
                              planId: planId,
                            })
                          }
                        />
                        <Select
                          value={set.target_weight_unit || ''}
                          onValueChange={(v) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: { target_weight_unit: v as 'kg' | 'lb' },
                              planId: planId,
                            })
                          }
                        >
                          <SelectTrigger className="w-16 h-7">
                            <SelectValue placeholder="unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        <Input
                          type="number"
                          className="h-7 w-16"
                          value={set.target_duration_seconds ?? ''}
                          onBlur={(e) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: {
                                target_duration_seconds: e.target.value === '' ? null : parseInt(e.target.value),
                              },
                              planId: planId,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <RouteIcon className="h-3.5 w-3.5" />
                        <Input
                          type="number"
                          className="h-7 w-16"
                          value={set.target_distance_meters ?? ''}
                          onBlur={(e) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: {
                                target_distance_meters: e.target.value === '' ? null : parseFloat(e.target.value),
                              },
                              planId: planId,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <Input
                          type="number"
                          className="h-7 w-16"
                          value={set.target_rest_seconds ?? ''}
                          onBlur={(e) =>
                            updateExercise.mutate({
                              setId: set.id,
                              updateData: {
                                target_rest_seconds: e.target.value === '' ? null : parseInt(e.target.value),
                              },
                              planId: planId,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Input
                      className="mt-1"
                      placeholder="Set notes"
                      value={set.notes ?? ''}
                      onBlur={(e) =>
                        updateExercise.mutate({
                          setId: set.id,
                          updateData: { notes: e.target.value || null },
                          planId: planId,
                        })
                      }
                    />
                  </div>
                ))}
                <Button variant={'outline'} onClick={() => createSet.mutate({
                  plan_session_exercise_id: selectedExercise.id,
                  set_number: selectedExercise.plan_session_exercise_sets.length + 1,
                  planId: planId
                })}> Add Set</Button>
                {selectedExercise?.target_rest_seconds != null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Timer className="h-4 w-4" />
                    <span>{selectedExercise.target_rest_seconds}s rest after exercise</span>
                  </div>
                )}
                {selectedExercise?.notes && (
                  <p className="text-sm italic text-muted-foreground mt-1">Notes: {selectedExercise.notes}</p>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
