import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamDetail } from "@/types";

type TeamMembersListProps = {
  team: TeamDetail;
};

export function TeamMembersList({ team }: TeamMembersListProps) {
  console.log('ss', team)
  if (!team.team_members || team.team_members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No members in this team.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.team_members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Avatar>
                {/* <AvatarImage src={member.profile.profile_image_url || undefined} alt={member.profile.username} /> */}
                <AvatarFallback>{member.profiles.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.profiles.username}</p>
                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
