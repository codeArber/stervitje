import { DiscoverableUser } from "@/types/explore";
import { Link } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

// A single User Card, linking to the detail page
export const UserCard = ({ user }: { user: DiscoverableUser }) => (
  <Link
    to="/explore/users/$userId"
    params={{ userId: user.id }}
    className="group"
  >
    <Card className="p-4 flex flex-col items-center text-center h-full transition-all group-hover:shadow-lg group-hover:-translate-y-1">
      <Avatar className="w-20 h-20 mb-4 border-2">
        <AvatarImage src={user.profile_image_url || ''} alt={user.username} />
        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <h3 className="font-semibold truncate w-full">{user.full_name || user.username}</h3>
      <p className="text-sm text-muted-foreground">@{user.username}</p>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {user.roles?.map(role => (
          <Badge key={role} variant={role === 'coach' || role === 'admin' ? 'default' : 'secondary'} className="capitalize">
            {role}
          </Badge>
        ))}
      </div>
    </Card>
  </Link>
);
