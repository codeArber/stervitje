import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamDetail } from "@/types";

type TeamInfoCardProps = {
  team: TeamDetail;
};

export function TeamInfoCard({ team }: TeamInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{team.description || "No description provided"}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Created: {team.created_at ? new Date(team.created_at).toLocaleDateString() : "Unknown"}</span>
          <span>Members: {team.members?.length || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
