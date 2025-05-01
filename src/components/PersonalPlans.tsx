import { useTeamPlans, useUserCreatedPlans } from "@/api/plans/plan";
import { useTeamStore } from "@/store/useTeamStore";
import { CreatePlanForm } from "./CreatePlanForm";
import { PlanCard } from "./plan/PlanCard";
import { Outlet } from "@tanstack/react-router";

export const PersonalPlans = () => {
    const { data: plans, isLoading, isError, error } = useUserCreatedPlans(); // Use hook results
    const teamId = useTeamStore((state) => state.selectedTeamId); // Get selected team from store
    const { data: teamPlans } = useTeamPlans(teamId || '')
    if (error) return (
        <div>
            loading...
        </div>
    )

    return (
        <div className="w-full p-4 rounded-lg">
            <div>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {plans?.map((plan) => (
                        <PlanCard id={plan.id} title={plan.title} description={plan.description} />
                    ))}

                </div>

                <Outlet />
            </div>
        </div>
    )
}