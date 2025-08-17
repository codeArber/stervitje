import { supabase } from '@/lib/supabase/supabaseClient';
import type { DashboardSummary } from '@/types/dashboard/index';

/**
 * Fetches the complete, aggregated summary data for the logged-in user's dashboard.
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummary | null> => {
  // The RPC call itself does not change, only the data it returns
  const { data, error } = await supabase
    .rpc('get_user_dashboard_summary')
    .single(); // .single() is good practice here as we expect one object

  if (error) {
    console.error('API Error fetchDashboardSummary:', error);
    throw new Error(error.message);
  }
  return data as DashboardSummary | null;
};