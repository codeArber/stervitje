import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";// FILE: src/routes/_layout/explore/plans/index.tsx (or wherever you keep this component)
// ... imports ...
import type { Plan } from '@/types/index';
import { BarChart3, CalendarDays, CheckCircle2, Heart, Users } from 'lucide-react'; // Import a new icon
import { Link } from '@tanstack/react-router';
import { Badge } from "../ui/badge";
import { PlanWithStats } from "@/types/plan";

export const PlanCard = ({ plan }: { plan: PlanWithStats }) => {
    const difficultyMap: { [key: number]: string } = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
    
    return (
        <Link
            to="/explore/plans/$planId"
            params={{ planId: plan.id }}
            className="group"
        >
            <Card className="h-full flex flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="leading-tight">{plan.title}</CardTitle>
                        {plan.sport && <Badge variant="outline" className="capitalize shrink-0">{plan.sport}</Badge>}
                    </div>
                    <CardDescription className="line-clamp-2 h-[40px]">
                        {plan.description || "No description provided."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2" title="Plan Duration">
                        <CalendarDays className="h-4 w-4" />
                        <span>{plan.duration_weeks} Week{plan.duration_weeks === 1 ? '' : 's'}</span>
                    </div>
                    {plan.difficulty_level && (
                        <div className="flex items-center gap-2" title="Difficulty">
                            <BarChart3 className="h-4 w-4" />
                            <span>{difficultyMap[plan.difficulty_level]}</span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2" title="Active Users">
                        <Users className="h-4 w-4" />
                        <span>{plan.active_users_count} Active</span>
                    </div>
                    <div className="flex items-center gap-2" title="Users Finished">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{plan.finished_users_count} Finished</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
};