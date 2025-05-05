import { useTeamPlans, useUserCreatedPlans } from "@/api/plans/plan";
import { useTeamStore } from "@/store/useTeamStore";
import { PlanCard } from "./plan/PlanCard";
import { useTeamMembers } from "@/api/teams";
import { useSession } from "@supabase/auth-helpers-react";
import { Link } from "@tanstack/react-router";

export const TeamPlans = ({ teamId }: { teamId: string }) => {
    const { data: teamPlans, error } = useTeamPlans(teamId || '')
    const { selectedTeamId } = useTeamStore()
    const { data: teamMembers } = useTeamMembers(selectedTeamId)
    const user = useSession()?.user
    if (error) return null
    return (
        <div className="w-full py-4 rounded-lg gap-4 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {teamPlans?.map((plan) => (
                    <PlanCard key={plan.id} {...plan} />
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {teamMembers?.map((member) => (
                    <Link
                        to='/discover/user/$userId'
                        params={{userId: member.user_id}}
                        key={member.user_id}
                        className={`p-4 border border-border rounded-lg shadow-sm ${member.user_id === user?.id && "bg-blue-100/10"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-lg">
                                {member.profile?.username}
                            </p>
                            <span
                                className={`px-2 py-1 text-sm rounded ${member.role === "coach"
                                        ? "bg-green-200 text-green-800"
                                        : "bg-yellow-200 text-yellow-800"
                                    }`}
                            >
                                {member.role}
                            </span>
                        </div>
                        {/* Uncomment the line below if you want to display the full name */}
                        {/* <p className="text-sm text-gray-600">{member.profile?.full_name}</p> */}
                    </Link>
                ))}
            </div>
        </div>
    )
}