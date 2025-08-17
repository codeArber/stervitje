// FILE: src/components/teams/InviteMemberDialog.tsx
import { useState, useEffect } from "react";
import { useInviteMemberMutation } from "@/api/team";
import { useDiscoverableUsersQuery } from "@/api/user";
import type { DiscoverableUser } from "@/types/user";
import type { TeamMemberRole } from "@/types/team";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

// shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import { UserPlus, Mail } from "lucide-react";

// Zod
import { z } from "zod";
const emailSchema = z.string().email();

export function InviteMemberDialog({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
    
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"users" | "email">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<DiscoverableUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("member");

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data: users } = useDiscoverableUsersQuery({
    searchTerm: tab === "users" ? debouncedSearch : "",
    excludeTeamId: teamId, // The crucial addition
  });

  const { mutate: inviteMember, isPending } = useInviteMemberMutation();

  const isEmailValid = emailSchema.safeParse(searchTerm).success;

 const handleInvite = () => {
    // The payload is now much simpler. It does not need teamName or inviterName.
    const payload = {
      teamId,
      role: selectedRole,
      userId: tab === "users" ? selectedUser?.id : undefined,
      email: tab === "email" ? searchTerm : undefined,
    };

    toast.promise(
      // The promise simply calls the mutation with the clean payload.
      new Promise((resolve, reject) =>
        inviteMember(payload, { onSuccess: resolve, onError: reject })
      ),
      {
        loading: "Sending invitation...",
        success: `Invitation sent successfully!`,
        error: (err) => `Failed to send invite: ${err.message}`,
      }
    );
    setOpen(false);
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedUser(null);
      setSelectedRole("member");
      setTab("users");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {teamName}</DialogTitle>
          <DialogDescription>
            Select a user from the list or invite someone by email.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "users" | "email")} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="w-1/2">Users</TabsTrigger>
            <TabsTrigger value="email" className="w-1/2">Email</TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="mt-4 space-y-3">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto space-y-2">
              {users?.length ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${
                      selectedUser?.id === user.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_image_url || ""} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name || user.username}</span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No users found.</p>
              )}
            </div>
          </TabsContent>

          {/* EMAIL TAB */}
          <TabsContent value="email" className="mt-4 space-y-3">
            <Input
              placeholder="Enter email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {!isEmailValid && searchTerm.length > 0 && (
              <p className="text-xs text-red-500">Invalid email address</p>
            )}
          </TabsContent>
        </Tabs>

        {/* ROLE SELECT */}
        <div className="mt-4">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as TeamMemberRole)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleInvite}
            disabled={
              isPending ||
              (tab === "users" && !selectedUser) ||
              (tab === "email" && !isEmailValid)
            }
          >
            {isPending ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
