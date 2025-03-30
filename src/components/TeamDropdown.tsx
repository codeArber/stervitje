import { Plus, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";

export const TeamDropdown = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleTeamSwitch = (teamName: string) => {
        // Implement team switching logic here
        console.log(`Switched to team: ${teamName}`);
    };

    const handleCreateTeam = () => {
        // Implement team creation logic here
        console.log("Creating new team");
        setIsDialogOpen(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start mb-4">
                        <Users className="mr-2 h-4 w-4" />
                        Current Team
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Teams</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleTeamSwitch("Team A")}>
                        Team A
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTeamSwitch("Team B")}>
                        Team B
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Team
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                    </DialogHeader>
                    <Input placeholder="Enter team name" className="mb-4" />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTeam}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
