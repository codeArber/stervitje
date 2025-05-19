import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import Model, { IExerciseData } from "react-body-highlighter";
import { Plan } from "@/types/planTypes";
import { formatDistanceToNow } from 'date-fns';
import { BarChartIcon, CalendarIcon, DumbbellIcon, EyeIcon, GitForkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

    const exercises: IExerciseData[] = [
        { name: 'Bench Press', muscles: ['chest', 'triceps', 'front-deltoids'] },
        { name: 'Push Ups', muscles: ['chest', 'triceps', 'front-deltoids'] },
        { name: 'Pull Ups', muscles: ['upper-back', 'biceps', 'back-deltoids'] },
        { name: 'Deadlift', muscles: ['hamstring', 'gluteal', 'lower-back', 'forearm'] },
        { name: 'Squats', muscles: ['quadriceps', 'gluteal', 'hamstring'] },
        { name: 'Overhead Press', muscles: ['front-deltoids', 'triceps', 'trapezius'] },
        { name: 'Barbell Row', muscles: ['upper-back', 'back-deltoids', 'biceps'] },
        { name: 'Bicep Curls', muscles: ['biceps', 'forearm'] },
        { name: 'Tricep Dips', muscles: ['triceps', 'chest'] },
        { name: 'Lunges', muscles: ['quadriceps', 'gluteal', 'hamstring', 'calves'] },
        { name: 'Plank', muscles: ['abs', 'obliques'] },
        { name: 'Russian Twists', muscles: ['obliques', 'abs'] },
    ]

    export const PlanCard = (plan: Plan) => {
        // Rest of your existing code...
    
        return (
            <Link to="/plans/$planId" params={{ planId: plan.id }} className="w-full rounded-lg">
                <Card className="p-4 border-border hover:shadow-md transition-shadow">
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{plan.description}</CardDescription>
                    <CardContent className="p-0 mt-4">
                        <div className='flex w-full flex-row justify-between mb-4'>
                            <Model
                                data={exercises}
                                style={{ width: '10rem', padding: '1rem' }}
                            // onClick={handleClick}
                            />
                            <Model
                                data={exercises}
                                style={{ width: '10rem', padding: '1rem' }}
                                type="posterior"
                            // onClick={handleClick}
                            />
                        </div>
                        
                        {/* New component to display plan information */}
                        <PlanInfoSection plan={plan} />
                    </CardContent>
                </Card>
            </Link>
        )
    }

// Custom component for displaying plan information with an icon
export const PlanInfoBadge = ({ 
    icon: Icon, 
    label, 
    value ,
    className
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number | boolean | null | undefined;
    className?: string
  }) => {
    if (value === undefined || value === null) return null;
    
    return (
      <div className={cn("flex items-center gap-1.5 text-sm", className)}>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-medium no-wrap overflow-hidden ellipsis inline-block">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
      </div>
    );
  };
  
  // Component to organize plan info badges
  const PlanInfoSection = ({ plan }: { plan: Plan }) => {
    // Format the date
    const formattedDate = plan.created_at 
      ? formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })
      : '';
  
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <PlanInfoBadge 
          icon={BarChartIcon} 
          label="Difficulty" 
          value={plan.difficulty_level} 
        />
        <PlanInfoBadge 
          icon={DumbbellIcon} 
          label="Sport" 
          value={plan.sport} 
        />
        <PlanInfoBadge 
          icon={EyeIcon} 
          label="Visibility" 
          value={plan.visibility} 
        />
        <PlanInfoBadge 
          icon={GitForkIcon} 
          label="Public Forking" 
          value={plan.allow_public_forking} 
        />
        <PlanInfoBadge 
          icon={CalendarIcon} 
          label="Created" 
          value={formattedDate} 
          className="col-span-2"
        />
      </div>
    );
  };
  