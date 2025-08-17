// FILE: src/routes/onboarding.tsx

import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCompleteOnboardingMutation } from '@/api/user';
import { usePendingInvitationsQuery, useRespondToInvitationMutation } from '@/api/team';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { Profile } from '@/stores/auth-store';

// shadcn/ui and icon imports...
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, PartyPopper, Mail, Check, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
});

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome!' },
  { id: 'invitations', title: 'Team Invitations' },
  { id: 'finish', title: 'You are all set!' },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { data: invitations } = usePendingInvitationsQuery();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboardingMutation();
  
  const { user, profile, checkUserSession } = useAuthStore(); // Get checkUserSession
  

  const hasInvitations = invitations && invitations.length > 0;
  const steps = ONBOARDING_STEPS.filter(step => step.id !== 'invitations' || hasInvitations);
  const currentStep = steps[currentStepIndex];

  console.log("Current Profile in OnboardingPage:", profile);

  useEffect(() => {
    if (profile?.onboarding_completed) { 
      navigate({ to: '/' });
    }
  }, [profile, navigate]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding(undefined, {
        onSuccess: async () => { // Make onSuccess async
          toast.success("Onboarding completed successfully!");
          
          // Force a refetch of the user's session and profile.
          // This will update the Zustand store with the latest `onboarding_completed: true` status.
          await checkUserSession(); 

          // After the Zustand store is updated, navigate.
          navigate({ to: '/' }); 
        },
        onError: (error) => {
          toast.error(`Failed to complete onboarding: ${error.message}`);
        }
      });
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
          <CardDescription>Let's get you set up for success.</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-8" />
          <div className="min-h-[250px] flex flex-col justify-center">
            {currentStep.id === 'welcome' && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-medium">Welcome to Stervitje!</h3>
                <p className="text-muted-foreground">We're excited to have you on board. Let's quickly get your workspace ready.</p>
              </div>
            )}
            
            {currentStep.id === 'invitations' && (
              <div>
                <p className="text-sm text-center mb-4 text-muted-foreground">It looks like you have pending invitations. You can accept or decline below.</p>
                <PendingInvitationsCard />
              </div>
            )}

            {currentStep.id === 'finish' && (
               <div className="text-center space-y-4">
                 <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
                 <h3 className="text-xl font-medium">Setup Complete!</h3>
                 <p className="text-muted-foreground">You're ready to start your fitness journey. Let's go!</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-8">
            <Button onClick={handleNext} disabled={isPending}>
              {currentStep.id === 'finish' ? (isPending ? 'Finishing...' : 'Go to Dashboard') : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const PendingInvitationsCard = () => {
    const { data: invitations, isLoading } = usePendingInvitationsQuery();
    const { mutate: respond, isPending } = useRespondToInvitationMutation();

    const handleResponse = (invitationId: string, accept: boolean, teamName: string) => {
        const promise = new Promise((resolve, reject) => 
            respond({ invitationId, accept }, { onSuccess: resolve, onError: reject })
        );
        toast.promise(promise, {
            loading: 'Responding to invitation...',
            success: `Successfully ${accept ? 'joined' : 'declined'} ${teamName}!`,
            error: (err) => `Error: ${err.message}`,
        });
    };

    if (isLoading || !invitations || invitations.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span>You Have Pending Invitations!</span>
                </CardTitle>
                <CardDescription>Respond to join new teams and start collaborating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {invitations.map(invite => (
                    <div key={invite.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted gap-4">
                        <p className="text-sm">
                            <span className="font-semibold">{invite.profiles.full_name || invite.profiles.username}</span> invited you to join
                            <Link to="/explore/teams/$teamId" params={{ teamId: invite.teams.id }} className="font-semibold hover:underline"> {invite.teams.name}</Link> as a {invite.role}.
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <Button size="icon" variant="outline" onClick={() => handleResponse(invite.id, false, invite.teams.name)} disabled={isPending}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Decline</span>
                            </Button>
                            <Button size="icon" onClick={() => handleResponse(invite.id, true, invite.teams.name)} disabled={isPending}>
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Accept</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};