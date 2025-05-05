import { usePlanDetails } from '@/api/plans/plan';
import { AddExerciseToSessionForm } from '@/components/AddExerciseToSession';
import { PlanSessionExerciseItem } from '@/components/PlanSessionExercise';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createFileRoute } from '@tanstack/react-router'
import { Clock, Plus, PlusCircle, Trash2 } from 'lucide-react';
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
import { useCreatePlanSet, useUpdatePlanSet } from '@/api/plans/session_set';
import { useCreatePlanSessionExercise, useUpdatePlanSessionExercise } from '@/api/plans/exercise_entry';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useExerciseImageUrl, useInfiniteExercises } from '@/api/exercises';
import { Badge } from '@/components/ui/badge';
import { useTeamStore } from '@/store/useTeamStore';
import { useActiveMemberInTeam, useMemberInTeam } from '@/api/teams';
import { useAuthStore } from '@/hooks/useAuthStore';
import { kgToLbs } from '@/lib/unitConversion';
import { AspectRatio } from '@/components/ui/aspect-ratio';


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
  const updateExercise = useUpdatePlanSet()
  const {
    data: allExercises,
    fetchNextPage,
    hasNextPage,
    isFetching, // Overall fetching state (initial load + next page)
    isFetchingNextPage, // Specifically fetching the next page
  } = useInfiniteExercises({}); // Pass filter params here if needed

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
  if(!exImg.data) return null;

  return (
    <div>
      <div className="flex flex-row flex-wrap gap-4">

        {thisSession.plan_session_exercises?.map((exercise) => {
          console.log(exercise)
          return (
            <Card key={exercise.id} onClick={() => { setEditSession(true); setSelectedEx(exercise.id) }} className={cn("cursor-pointer", exercise.id === selectedEx && "border-blue-200")}>
              <CardHeader>
                <CardTitle>{exercise.exercise.name}</CardTitle>
                <CardDescription>{exercise.notes}</CardDescription>
              </CardHeader>
              <CardContent>

                <div className="flex flex-row flex-nowrap items-start gap-2 w-full">
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden flex-shrink-0 w-32">

                    <img
                      // Use image_url from DB, provide a fallback
                      src={exImg?.data || '/placeholder.svg'}
                      // Use object-cover for better filling, ensure parent has overflow-hidden
                      className="object-cover w-full h-full"
                      // Add error handling for broken images (optional)
                      onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                    />
                  </AspectRatio>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {exercise?.plan_session_exercise_sets?.map((set) => (
                      <div key={set.id} className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" >
                          {set.set_number}
                        </Badge>

                        {set.target_duration_seconds && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {/* <span>{formatDuration(set.target_duration_seconds)}</span> */}
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
                              {unit === 'imperial' ? kgToLbs(set.target_weight) : set.target_weight} {unit === 'imperial' ? 'lb' : 'kg'}
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
          )
        })}
        {thisUser?.role === 'coach' &&
          <Popover>
            <PopoverTrigger asChild>
              <Card className='cursor-pointer'>
                <CardHeader>
                  <CardTitle>
                    <Plus className='mr-2' />
                  </CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
              </Card>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col gap-2">
                <div>Select an exercise to add to the plan</div>
                <div>
                  hey
                </div>
                <div>
                  {allExercises?.pages?.map((page) => (
                    page?.map((exercise) => (
                      <Button key={exercise.id} variant={'outline'} className='flex flex-row items-center justify-between   rounded-md p-2' onClick={() => {
                        addExercise.mutate({
                          plan_session_id: thisSession.id,
                          exercise_id: exercise.id,
                          order_index: Math.max(0, ...thisSession.plan_session_exercises.map(ex => ex.order_index)) + 1,
                          planId: planId
                        });
                      }}>
                        <p>{exercise.name}</p>
                        <div  >
                          Add
                        </div>
                      </Button>
                    ))
                  ))}

                </div>
                {/* {planData?.exercises?.map((exercise) => (
              <Button
              key={exercise.id}
              variant="outline"
              onClick={() => {
                createSet.mutate({
                plan_session_exercise_id: exercise.id,
                set_number: 1,
                planId: planId,
                });
              }}
              >
              {exercise.name}
              </Button>
            ))} */}
              </div>
            </PopoverContent>
          </Popover>
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
                  <div key={set.id} className='flex flex-row items-center justify-between gap-2  rounded-md p-2'>
                    {/* Render set details here */}
                    <div>
                      {set.set_number}:

                    </div>
                    <div>
                      <Input value={set.target_reps} onBlur={(e) => updateExercise.mutate({

                        setId: set.id,
                        updateData: {
                          target_reps: parseInt(e.target.value),
                        },
                        planId: planId,
                      })} />
                    </div>
                    <div>
                      reps
                    </div>
                    <div>
                      <Input value={set.target_weight} onBlur={(e) => updateExercise.mutate({

                        setId: set.id,
                        updateData: {
                          target_weight: parseInt(e.target.value),
                        },
                        planId: planId,
                      })} />
                    </div>
                    <div>
                      {set.target_weight_unit}
                    </div>
                  </div>
                ))}
                <Button variant={'outline'} onClick={() => createSet.mutate({
                  plan_session_exercise_id: selectedExercise.id,
                  set_number: selectedExercise.plan_session_exercise_sets.length + 1,
                  planId: planId
                })}> Add Set</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
