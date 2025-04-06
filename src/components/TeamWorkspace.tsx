import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamWorkspaceProps {
    teamName: string;
    publicPlans: { id: string; title: string; description?: string }[];
    users: { id: string; name: string; role: string; avatarUrl?: string }[];
}

export const TeamWorkspace = ({ teamName, publicPlans, users }: TeamWorkspaceProps) => {
    return (
        <div className="space-y-6">
            {/* Team Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold">{teamName}</h1>
                <p className="text-muted-foreground">Explore the public plans and team members.</p>
            </div>

            {/* Team Members */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                <div className="flex flex-col gap-2 ">
                    {users.map((user) => (
                        <Card key={user.id} >
                            <CardHeader>
                                <CardTitle className="text-base font-medium flex flex-row gap-2 items-center">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2">
                                        {user.name}
                                        {user.role === 'Coach' && <Badge variant="outline" className="text-xs">{user.role}</Badge>}
                                        {user.role === 'Student' && <Badge variant='secondary' className="text-xs">{user.role}</Badge>}
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                  
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-center space-x-4">

                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>


            {/* Public Plans */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Public Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicPlans.map((plan) => (
                        <Card key={plan.id}>
                            <CardHeader>
                                <CardTitle>{plan.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{plan.description || "No description available."}</p>
                                <Button variant="link" className="mt-2">
                                    View Plan
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>


        </div>
    );
};
