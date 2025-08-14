import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamDetail } from "@/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { CreatePlanForm } from "./CreatePlanForm";

type TeamPlansListProps = {
  team: TeamDetail;
};

export function TeamPlansList({ team }: TeamPlansListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!team.plans || team.plans.length === 0) {
    return (
      <Card>
        <CardHeader className="w-full flex flex-row justify-between items-center">
          <CardTitle>Team Plans</CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Plan</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <CreatePlanForm teamId={team.id} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No plans assigned to this team.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.plans.map((plan, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Plan {index + 1}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Basic plan information</p>
                </div>
                <Badge variant="secondary">Public</Badge>
              </div>
              <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                <span>Created: Unknown</span>
                <span>Weeks: 0</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
