// FILE: supabase/functions/send-invite-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) throw new Error('Missing RESEND_API_KEY secret.');
    const resend = new Resend(apiKey);
    
    const { invitationId } = await req.json();
    if (!invitationId) throw new Error("invitationId is required.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the full invitation details securely on the backend
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select(`
        invited_email,
        role,
        team:teams(name),
        inviter:profiles!team_invitations_invited_by_fkey(full_name, username)
      `)
      .eq('id', invitationId)
      .single();

    if (inviteError) throw inviteError;
    if (!invite || !invite.invited_email) throw new Error("Invitation not found or has no email.");

    const teamName = invite.team.name;
    const inviterName = invite.inviter.full_name || invite.inviter.username;
console.log("Sending email to:", invite.invited_email);

 await resend.emails.send({
      // UPDATED: Use your verified domain for a professional appearance
      from: 'Stervitje App <no-reply@trupi.app>', 
      to: [invite.invited_email],
      subject: `You've been invited to join ${teamName} on Stervitje!`,
      html: `
        <div>
          <h1>You're Invited!</h1>
          <p>${inviterName} has invited you to join "${teamName}" as a ${invite.role}.</p>
          <a href="http://localhost:5173/login">Join Now</a>
        </div>
      `,
    });


    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500, headers: { ...corsHeaders } });
  }
});