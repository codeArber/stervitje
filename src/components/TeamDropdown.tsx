import { Plus, Users, Users2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
// Corrected Import Path (adjust if your path structure is different)
import { useSession } from "@supabase/auth-helpers-react";
import { useTeamStore } from "@/store/useTeamStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useUsers } from "@/api/user";
import { useAddTeamMember, useFetchAllTeamsForMember, useMemberInTeam } from "../api/teams";
import { Badge } from "./ui/badge";

export const TeamDropdown = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [role, setRole] = useState<'coach' | 'student'>('student');
    const user = useSession()?.user; // Already getting user here
    const selectedTeamId = useTeamStore((state) => state.selectedTeamId); // Zustand store for selected team ID
    const { data: users } = useUsers()
    const addTeamMember = useAddTeamMember();
    const thisUser = useMemberInTeam(selectedTeamId, user?.id);

    // Assuming useFetchAllTeamsForMember returns { data: Team[] | undefined, isLoading, error }
    const { data: userTeams, isLoading: isLoadingTeams } = useFetchAllTeamsForMember(user?.id);

    // --- Find the selected team's name ---
    const selectedTeam = userTeams?.find(team => team.id === selectedTeamId);
    const displayLabel = selectedTeamId === null ? "Personal Account" : selectedTeam?.name ?? "Select Team"; // Show name or fallback

    // --- Event Handlers ---
    const handleTeamSwitch = (teamId: string | null) => {
        if (teamId !== selectedTeamId) {
            // Update Zustand store with the new team ID
            useTeamStore.setState({ selectedTeamId: teamId });
        }
        setIsDialogOpen(false); // Close dialog if open
    };

    const handleAddTeamMember = () => {
        addTeamMember.mutate({
            teamId: selectedTeamId || '',
            userId: inputValue,
            role: role
        })
    };

    console.log(thisUser)
    return (
        <div className="flex flex-row gap-2 items-center">
            {selectedTeam &&
                <div className="flex flex-row gap-1 items-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant={'outline'}>
                                <Users2 />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Member to Team</DialogTitle>
                            </DialogHeader>
                            <div className="my-4">
                                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                                    Select User
                                </label>
                                <Select onValueChange={(value) => setInputValue(value)} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="my-4">
                                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">
                                    Select Role
                                </label>
                                <Select value={role} onValueChange={(value)=>setRole(value as 'coach' | 'student')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coach">Coach</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => handleAddTeamMember()}>
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            }
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Display actual selected context name */}
                    <Button variant={'outline'} className="w-full h-full" disabled={isLoadingTeams}>
                        {/* <Users className="mr-2 h-4 w-4" /> */}
                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                        {isLoadingTeams ? "Loading..." : displayLabel}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Switch Context</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Option for Personal Account */}
                    <DropdownMenuItem onSelect={() => handleTeamSwitch(null)}>
                        Personal Account
                    </DropdownMenuItem>

                    {/* Options for each team */}
                    {userTeams?.map((team) => (
                        <DropdownMenuItem key={team.id} onSelect={() => handleTeamSwitch(team.id)}>
                            {team.name}
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    {/* Option to Create New Team */}
                    <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Team
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          {thisUser?.role && selectedTeamId &&   <RoleBadge role={thisUser?.role} />}

        </div>
    );
};

const RoleBadge = ({ role }: { role: 'coach' | 'student' }) => {
    return (
        <Badge variant={role === 'coach' ? 'destructive' : 'default'}>
            {role === 'coach' ? 'Coach' : 'Student'}
        </Badge>
    );
};