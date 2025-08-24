// (Conceptual - if you have dashboard.endpoint.ts and index.ts already set up)

// In src/api/dashboard/endpoint.ts
import { supabase } from "@/lib/supabase/supabaseClient";
import type { DashboardSummary } from "@/types/dashboard";

export const fetchDashboardSummary = async (): Promise<DashboardSummary | null> => {
  const { data, error } = await supabase.rpc('get_user_dashboard_summary');
  if (error) {
    console.error("API Error fetchDashboardSummary:", error);
    throw new Error(error.message);
  }
  return data as DashboardSummary | null; // Cast is still useful if database.types.ts is generic
};