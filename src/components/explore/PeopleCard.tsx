import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types";
import { Link } from "@tanstack/react-router";

export function PeopleCard({ profile, className }: { profile: Profile, className?: string }) {
  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <CardTitle>{profile.full_name || profile.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{profile.bio || "No bio provided"}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Username: {profile.username}</span>
          <span>Unit: {profile.unit}</span>
        </div>
        <div className="mt-4">
          <Link to={'/explore/people/$peopleId'} params={{ peopleId: profile.id }} className="block w-full">
            <Button className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
