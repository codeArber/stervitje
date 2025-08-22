// src/components/teams/InvitationCard.tsx
import React from 'react';
import { useRespondToInvitationMutation } from '@/api/team';
import type { TeamInvitationWithRelations } from '@/types/team';
import { toast } from 'sonner';

// shadcn/ui
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import { Check, X, Loader2 } from 'lucide-react';

interface InvitationCardProps {
  invitation: TeamInvitationWithRelations;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation }) => {
  const respondToInvitationMutation = useRespondToInvitationMutation();

  const handleResponse = (accept: boolean) => {
    toast.promise(
      respondToInvitationMutation.mutateAsync({ invitationId: invitation.id, accept }),
      {
        loading: `${accept ? 'Accepting' : 'Declining'} invitation to ${invitation.teams?.name}...`,
        success: `Invitation to ${invitation.teams?.name} ${accept ? 'accepted' : 'declined'}!`,
        error: (err) => `Failed to ${accept ? 'accept' : 'decline'} invite: ${err.message}`,
      }
    );
  };

  const isPending = respondToInvitationMutation.isPending;

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4 flex-grow">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={invitation.teams?.logo_url || ""} alt={invitation.teams?.name || "Team"} />
            <AvatarFallback className="text-xl">
              {invitation.teams?.name?.charAt(0).toUpperCase() || 'T'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-center sm:text-left">
            <h3 className="font-semibold text-lg">{invitation.teams?.name || 'Unknown Team'}</h3>
            <p className="text-sm text-muted-foreground">
              Invited by {invitation.profiles?.full_name || invitation.profiles?.username || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleResponse(true)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResponse(false)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};