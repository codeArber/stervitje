// src/components/PlansDashboard.tsx (Existing File)
import { useState } from 'react'; // Import useState
import { Button } from '@/components/ui/button';
import {
   PlusCircle // Import icon for create button
} from 'lucide-react';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePlanForm } from './CreatePlanForm';
import { useTeamStore } from '@/store/useTeamStore';
import { PersonalPlans } from './PersonalPlans';
import { TeamPlans } from './TeamPlans';
import { useActiveMemberInTeam } from '@/api/teams';


// --- Main Dashboard Component ---
const TrainingPlansDashboard = () => {
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // State for dialog
   const selectedTeamId = useTeamStore((state) => state.selectedTeamId); // Get selected team from store
   const thisUser = useActiveMemberInTeam(selectedTeamId);

console.log(selectedTeamId)
   return (
      <div className='p-4'>
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Training Plans</h1>
            {/* Dialog Trigger Button */}
            {(thisUser?.role === 'coach'  || selectedTeamId === null ) &&
               <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                     <Button >
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]"> {/* Adjust width */}
                     <DialogHeader>
                        <DialogTitle>Create New Training Plan</DialogTitle>
                        <DialogDescription>
                           Fill in the details below to create your new plan. You can add specific workouts later.
                        </DialogDescription>
                     </DialogHeader>
                     {/* Render the form inside */}
                     <div className="py-4">
                        <CreatePlanForm onSuccess={() => setIsCreateDialogOpen(false)} />
                     </div>
                  </DialogContent>
               </Dialog>
            }
         </div>
         {!selectedTeamId ? (
            <PersonalPlans />
         ) : (
            <TeamPlans teamId={selectedTeamId || ''} />

         )}
      </div>
   );
};

export default TrainingPlansDashboard;