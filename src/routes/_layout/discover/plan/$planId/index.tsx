import { usePlanDetails } from '@/api/plans/plan'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/discover/plan/$planId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { planId } = Route.useParams()
  const { data: planDetails } = usePlanDetails(planId)

  return (
    <div className='flex flex-1 flex-col space-y-12 '>
      <div className='flex flex-row '>
        <div className=' bg-sidebar flex items-center shadow px-4 py-4 z-10 w-full justify-between h-18'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/'>
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink >

                  <Link to='/discover'>
                    Discover
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink >

                  <Link to='/discover'>
                    Plans   
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{planDetails?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <section className='flex flex-col p-4'>
        {planDetails && <WorkoutPlanDisplay plan={planDetails} />}
      </section>
    </div>
  )
}



import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, Calendar, ChevronDown, ChevronRight, Clock, Moon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface PlanOverviewProps {
  plan: any;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ plan }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{plan.title}</CardTitle>
        {plan.sport && <Badge className="ml-2">{plan.sport}</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.description && (
          <div className="text-sm text-muted-foreground">{plan.description}</div>
        )}

        <div className="flex items-center space-x-2">
          <span className="font-medium">Created By:</span>
          <Link to='/discover/user/$userId' params={{ userId: plan.created_by.id }}>

            <span className="text-sm text-muted-foreground">{plan.created_by.username}</span> {/* Consider fetching and showing the actual username */}
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Visibility:</span>
          <span className="text-sm text-muted-foreground">{plan.visibility}</span>
        </div>

        <Separator />

        <div className="font-semibold">Plan Details:</div>
        <div className="space-y-2">
          {plan.duration_weeks !== null && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Duration:</span>
              <span className="text-sm text-muted-foreground">{plan.duration_weeks} Weeks</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-sm">Created At:</span>
            <span className="text-sm text-muted-foreground">{new Date(plan.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Last Updated:</span>
            <span className="text-sm text-muted-foreground">{new Date(plan.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator />

        {plan.plan_weeks && plan.plan_weeks.length > 0 ? (
          <Accordion type="single" collapsible>
            {plan.plan_weeks.map((week) => (
              <AccordionItem key={week.id} value={`week-${week.week_number}`}>
                <AccordionTrigger className="font-semibold">Week {week.week_number}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {week.description && (
                    <div className="text-sm text-muted-foreground">{week.description}</div>
                  )}
                  {week.plan_days && week.plan_days.length > 0 ? (
                    <div className="space-y-1">
                      {week.plan_days.map((day) => (
                        <div key={day.id} className="border rounded-md p-2">
                          <div className="font-medium">{day.title || `Day ${day.day_number}`}</div>
                          {day.description && <div className="text-sm text-muted-foreground">{day.description}</div>}
                          {day.plan_sessions && day.plan_sessions.length > 0 ? (
                            <ul className="mt-2 list-disc list-inside text-sm">
                              {day.plan_sessions.map((session) => (
                                <li key={session.id}>
                                  {session.title || `Session ${session.order_index}`}
                                  {session.plan_session_exercises && session.plan_session_exercises.length > 0 && (
                                    <ul className="ml-4 list-disc list-inside text-xs text-muted-foreground">
                                      {session.plan_session_exercises.map((exerciseItem) => (
                                        <li key={exerciseItem.id}>
                                          {exerciseItem.exercise?.name}
                                          {exerciseItem.plan_session_exercise_sets && exerciseItem.plan_session_exercise_sets.length > 0 && (
                                            <span className="ml-2">
                                              ({exerciseItem.plan_session_exercise_sets.length} sets)
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-muted-foreground">No sessions for this day.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No days planned for this week.</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-sm text-muted-foreground">No weeks planned for this training plan.</div>
        )}
      </CardContent>
    </Card>
  );
};

export function WorkoutPlanDisplay({ plan }: { plan: PlanOverviewProps }) {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({})

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }))
  }

  // Function to format seconds into minutes and seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Function to get exercise icon based on exercise name
  const getExerciseIcon = (exerciseName: string) => {
    if (exerciseName.toLowerCase().includes("running")) {
      return <Moon className="h-5 w-5 text-blue-500" />
    }
    return <Moon className="h-5 w-5 text-purple-500" />
  }

  return (
    <div className="space-y-6">
      <Card >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
            <Badge variant="outline" className="bg-white">
              {plan.visibility === "public" ? "Public" : "Private"}
            </Badge>
          </div>
          <CardDescription>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Award className="h-4 w-4" />
              <span>By: {plan.created_by.username}</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="weeks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weeks">Weeks View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="weeks" className="space-y-4 mt-4">
          {plan.plan_weeks.map((week) => (
            <Card key={week.id} className="overflow-hidden">
              <CardHeader
                className={cn(
                  "cursor-pointer flex flex-row items-center justify-between py-4",
                  expandedWeeks[week.id] ? "bg-muted/50" : "",
                )}
                onClick={() => toggleWeek(week.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    {week.week_number}
                  </div>
                  <CardTitle className="text-xl">Week {week.week_number}</CardTitle>
                </div>
                <div>
                  {expandedWeeks[week.id] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </CardHeader>

              {expandedWeeks[week.id] && (
                <CardContent className="pt-4">
                  <Accordion type="multiple" className="space-y-4">
                    {week.plan_days.map((day) => (
                      <AccordionItem key={day.id} value={day.id} className="border rounded-lg px-2">
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 text-secondary font-medium">
                              {day.day_number}
                            </div>
                            <span className="font-medium">{day.title || `Day ${day.day_number}`}</span>
                            {day.is_rest_day && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Rest Day
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          {day.is_rest_day ? (
                            <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                              <p className="text-green-700 font-medium">Rest and recover today!</p>
                            </div>
                          ) : (
                            <div className="space-y-4 flex flex-col flex-wrap gap-4 h-full ">
                              {day.plan_sessions.map((session) => (
                                <Card key={session.id} className="border-l-4 border-l-primary  ">
                                  <CardHeader className="py-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Moon className="h-4 w-4" />
                                      {session.title || `Session ${session.order_index}`}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="py-0">
                                    {session.plan_session_exercises.length === 0 ? (
                                      <p className="text-muted-foreground text-sm italic py-2">
                                        No exercises added yet
                                      </p>
                                    ) : (
                                      <ul className="space-y-3 flex flex-row p-2 gap-4">
                                        {session.plan_session_exercises.map((exercise) => (
                                          <li key={exercise.id} className="bg-muted/30 rounded-lg p-3 border norder-2 ">
                                            <div className='flex flex-row gap-1'>
                                              <div>
                                                <img src="" alt="" className='w-12 h-12 rounded-lg' />
                                              </div>
                                              <div className="flex flex-col">
                                                <div className="flex items-start gap-3 mb-2">
                                                  {getExerciseIcon(exercise.exercise.name)}
                                                  <span className="font-medium">{exercise.exercise.name}</span>
                                                </div>

                                                <div className="space-y-2">
                                                  {exercise.plan_session_exercise_sets.map((set) => (
                                                    <div key={set.id} className="flex items-center gap-4 text-sm">
                                                      <Badge variant="outline" className="bg-white">
                                                        Set {set.set_number}
                                                      </Badge>

                                                      {set.target_duration_seconds && (
                                                        <div className="flex items-center gap-1">
                                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                                          <span>{formatDuration(set.target_duration_seconds)}</span>
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
                                                            {set.target_weight} {set.target_weight_unit || "kg"}
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

                                            </div>
                                            {exercise.notes && (
                                              <div className="mt-2 ml-8 text-sm text-muted-foreground italic">
                                                Note: {exercise.notes}
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View your workout plan in a calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="font-medium text-sm py-2 bg-muted/30 rounded">
                    {day}
                  </div>
                ))}
              </div>

              {plan.plan_weeks.map((week) => (
                <div key={week.id} className="mb-6">
                  <h3 className="font-medium mb-2">Week {week.week_number}</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const day = week.plan_days.find((d) => d.day_number === i + 1)
                      console.log(day)
                      return (
                        <Popover>
                          <PopoverTrigger>
                            <div
                              key={i}
                              className={cn(
                                "min-h-24 border rounded-lg p-2",
                                day && "bg-muted/40",
                                day?.is_rest_day && "bg-green-300/20 border-green-200/30" ,
                              )}
                            >
                              <div className="text-right mb-1">
                                <span className="text-xs font-medium">{i + 1}</span>
                              </div>

                              {day && (
                                <div className="text-xs">
                                  <p className="font-medium truncate">{day.title || `Day ${day.day_number}`}</p>
                                  {day.is_rest_day ? (
                                    <Badge
                                      variant="outline"
                                      className="mt-1 text-xs bg-green-50/80 text-green-700 border-green-200"
                                    >
                                      Rest
                                    </Badge>
                                  ) : (
                                    <div className="mt-1">
                                      {day.plan_sessions.map((session) => (
                                        <div key={session.id} className="mb-1 truncate">
                                          <span className="text-xs text-muted-foreground">
                                            {session.plan_session_exercises.length} exercises
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 p-4 rounded-md shadow-md bg-white dark:bg-gray-800 dark:text-white max-h-72 overflow-y-scroll ">
                            {day?.plan_sessions?.length === 0 ? (
                              <p className="text-gray-500 dark:text-gray-400">No sessions planned for this day.</p>
                            ) : (
                              <ul className="space-y-4">
                                {day?.plan_sessions?.map((ses) => (
                                  <li key={ses.id} className="border rounded-md p-4 dark:border-gray-700">
                                    <h4 className="text-lg font-semibold mb-2 dark:text-gray-100">
                                      {ses?.title || `Session: ${ses?.order_index}`}
                                    </h4>
                                    {ses?.plan_session_exercises?.length === 0 ? (
                                      <p className="text-gray-500 dark:text-gray-400">No exercises in this session.</p>
                                    ) : (
                                      <ul className="space-y-3">
                                        {ses?.plan_session_exercises?.map((ex) => (
                                          <li key={ex.id} className="border rounded-md p-3 dark:border-gray-700">
                                            <div className="font-semibold text-blue-500 dark:text-blue-400">
                                              {ex?.exercise?.name || 'Unnamed Exercise'}
                                            </div>
                                            {ex.plan_session_exercise_sets.length > 0 ? (
                                              <div className="mt-2">
                                                <div className="grid grid-cols-3 gap-2 text-sm font-medium dark:text-gray-300">
                                                  <div>Sets</div>
                                                  <div>Reps</div>
                                                  <div>Weight</div>
                                                </div>
                                                {ex.plan_session_exercise_sets.map((set, index) => (
                                                  <div
                                                    key={set.id}
                                                    className="grid grid-cols-3 gap-2 mt-1 text-sm dark:text-gray-300"
                                                  >
                                                    <div>{index + 1}</div>
                                                    <div>{set.target_reps || '-'}</div>
                                                    <div>{set.target_weight || '-'}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No sets defined for this exercise.</p>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </PopoverContent>
                        </Popover>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button className="bg-primary hover:bg-primary/90">Start Workout</Button>
      </div>
    </div>
  )
}