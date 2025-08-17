// FILE: src/components/auth/OnboardingDialog.tsx

import { useState, useEffect } from 'react';
import { useCompleteOnboardingMutation } from '@/api/user';
import { usePendingInvitationsQuery } from '@/api/team';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Icons
import { ArrowRight, PartyPopper } from 'lucide-react';
import { PendingInvitationsCard } from '@/routes/_app/_layout/index';

// Define the steps
const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome!' },
  { id: 'invitations', title: 'Team Invitations' }, // This step is conditional
  { id: 'finish', title: 'You are all set!' },
];

export function OnboardingDialog({ open, onFinish }: { open: boolean; onFinish: () => void; }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { data: invitations } = usePendingInvitationsQuery();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboardingMutation();

  const hasInvitations = invitations && invitations.length > 0;

  // Filter out the 'invitations' step if the user has no pending invites
  const steps = ONBOARDING_STEPS.filter(step => step.id !== 'invitations' || hasInvitations);
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // This is the final step
      completeOnboarding(undefined, {
        onSuccess: () => {
          onFinish(); // Call the parent function to close the dialog for good
        }
      });
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          <DialogDescription>
            Let's get you set up for success.
          </DialogDescription>
        </DialogHeader>
        
        <Progress value={progress} className="my-4" />

        <div className="min-h-[200px] py-4">
          {currentStep.id === 'welcome' && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Welcome to Stervitje!</h3>
              <p className="text-muted-foreground">We're excited to have you on board. Let's quickly get your workspace ready.</p>
            </div>
          )}
          
          {currentStep.id === 'invitations' && (
            <div>
              <p className="text-sm text-center mb-4 text-muted-foreground">It looks like you've been invited to join a team. You can accept or decline below.</p>
              <PendingInvitationsCard />
            </div>
          )}

          {currentStep.id === 'finish' && (
             <div className="text-center space-y-4">
               <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
               <h3 className="text-lg font-medium">Setup Complete!</h3>
               <p className="text-muted-foreground">You're ready to start your fitness journey. Enjoy the app!</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={isPending}>
            {currentStep.id === 'finish' ? (isPending ? 'Finishing...' : 'Finish Setup') : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}