import { useTeamPlans, useUserCreatedPlans } from "@/api/plans/plan";
import { useTeamStore } from "@/store/useTeamStore";
import { PlanCard } from "./plan/PlanCard";

export const TeamPlans = ({teamId}:{teamId: string}) => {
    const { data: teamPlans, error } = useTeamPlans(teamId || '')
    if (error) return null
    console.log(teamPlans)
    return (
        <div className="w-full p-4 rounded-lg">
            <div>{teamId}</div>
            <div>
                {teamPlans?.map((plan) => (
                    <PlanCard id={plan.id} title={plan.title} description={plan.description} />
                ))}
            </div>
        </div>
    )
}