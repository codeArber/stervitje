import { Plus, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
// Corrected Import Path (adjust if your path structure is different)
import { useCreateTeam, useFetchAllTeamsForMember } from "@/api/teams"; // Assuming these exist
import { useSession } from "@supabase/auth-helpers-react";
import { useTeamStore } from "@/store/useTeamStore";

export const TeamDropdown = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const user = useSession()?.user; // Already getting user here
    const selectedTeamId = useTeamStore((state) => state.selectedTeamId); // Zustand store for selected team ID

    const createTeam = useCreateTeam(user?.id || '');
    
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

    const handleCreateTeam = () => {
        if (!inputValue.trim()) return; // Prevent creating empty names
        createTeam.mutate(
            { name: inputValue.trim() },
            {
                onSuccess: () => {
                    // Optional: Invalidate teams query cache here if using React Query
                    // queryClient.invalidateQueries(['teams', user?.id]);
                    setIsDialogOpen(false);
                    setInputValue(""); // Clear input on success
                },
                onError: (error) => {
                    console.error("Failed to create team:", error);
                    // Handle error display if needed
                }
            }
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Display actual selected context name */}
                    <Button variant="ghost" className="w-full justify-start mb-4" disabled={isLoadingTeams}>
                        <Users className="mr-2 h-4 w-4" />
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

            {/* Dialog for Creating Team */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Enter team name"
                        className="my-4" // Added margin
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTeam} disabled={ !inputValue.trim()}>
                        Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};