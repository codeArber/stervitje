import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import Model, { IExerciseData } from "react-body-highlighter";

interface PlanCardProps {
    id: string
    title: string;
    description?: string | null;
}


export const PlanCard = ({ id, title, description }: PlanCardProps) => {

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

    return (
        <Link to="/plans/$planId" params={{ planId: id }} className="w-full  rounded-lg">
            <Card className="p-4 border-border">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardContent>
                    <div className='flex w-full flex-row justify-between'>
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
                </CardContent>
            </Card>
        </Link>
    )
}