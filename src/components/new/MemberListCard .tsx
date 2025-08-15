import { TeamMemberWithProfile } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const MemberListCard = ({ title, icon: Icon, members }: { title: string; icon: React.ElementType; members: TeamMemberWithProfile[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{title} ({members.length})</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {members.map(member => (
                <Link
                    key={member.profile.id}
                    to="/explore/users/$userId"
                    params={{ userId: member.profile.id }}
                    className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted"
                >
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={member.profile.profile_image_url || ''} />
                        <AvatarFallback>{member.profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold leading-tight">{member.profile.full_name || member.profile.username}</p>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                </Link>
            ))}
        </CardContent>
    </Card>
);