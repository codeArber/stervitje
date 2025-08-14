import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Team, TeamDetail } from "@/types";
import { Link } from "@tanstack/react-router";


export function TeamCard({ team}: { team: Team  }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{team.description || "No description provided"}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Created: {team.created_at ? new Date(team.created_at).toLocaleDateString() : "Unknown"}</span>
          <span>Plans: {team.plans_count || 0}</span>
          <span>Members: {team.members_count || 0}</span>

        </div>
        <div className="mt-4">
          <Link to={'/teams/$teamId'} params={{ teamId: team.id }} className="text-blue-600 hover:underline">
            <Button className="w-full">
              View Team
            </Button>
          </Link>

        </div>
      </CardContent>
    </Card>
  );
};
