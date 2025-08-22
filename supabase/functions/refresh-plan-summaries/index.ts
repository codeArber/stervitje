import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  // Ensure the request is coming from a trusted source (e.g., a specific header or IP)
  // For a Supabase Scheduled Job, the request will come from Supabase infrastructure.
  // For external cron, you might add an API key check here.

  // Create a Supabase client with the Service Role Key
  // This allows the Edge Function to bypass RLS and execute SECURITY DEFINER functions.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Call the RPC function to refresh the materialized view
    const { error } = await supabase.rpc('refresh_plan_content_summary');

    if (error) {
      console.error('Error refreshing plan_content_summary:', error.message);
      return new Response(
        JSON.stringify({ error: 'Failed to refresh materialized view', details: error.message }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('plan_content_summary materialized view refreshed successfully via cron.');
    return new Response(
      JSON.stringify({ message: 'Materialized view refreshed successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unhandled error in Edge Function:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});