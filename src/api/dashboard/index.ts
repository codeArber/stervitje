import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "./endpoint";
import type { DashboardSummary } from "@/types/dashboard";
import { useAuthStore } from "@/stores/auth-store"; // Assuming you have an auth store

const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

export const useDashboardSummaryQuery = () => {
  const { user } = useAuthStore(); // Assuming you check if user is authenticated
  return useQuery<DashboardSummary | null, Error>({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
    enabled: !!user, // Only fetch if user is logged in
  });
};