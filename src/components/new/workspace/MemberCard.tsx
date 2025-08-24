import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberWithProfile } from "@/types/team";
import { User } from "lucide-react";

interface MemberCardProps {
  data: TeamMemberWithProfile;
  role?: string;
}

export function MemberCard({ data, role }: MemberCardProps) {
    const { profile } = data;
  return (
   <Card className="relative p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200">
      {/* Role Label - top-left corner */}
      {role && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-background/50 backdrop-blur-md border border-border/30 rounded-md text-xs font-medium text-foreground">
          {role}
        </div>
      )}

      {/* Profile Image */}
      {profile.profile_image_url ? (
        <img
          src={profile.profile_image_url}
          alt={profile.full_name || ''}
          className="w-16 h-16 rounded-full object-cover mb-2"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <User className="w-8 h-8 text-foreground" />
        </div>
      )}

      {/* Name */}
      <p className="font-medium">{profile.full_name}</p>

      {/* Username */}
      <p className="text-sm text-muted-foreground">{profile.username}</p>

      {/* Bio */}
      {profile.bio && <p className="text-xs text-muted-foreground mt-1">{profile.bio}</p>}
    </Card>
  );
}
