import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from './endpoint';
import type { DashboardSummary } from '@/types/dashboard/index';

const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

/**
 * Hook for fetching the complete summary data for the user's main dashboard.
 */
export const useDashboardSummaryQuery = () => {
  return useQuery<DashboardSummary | null, Error>({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
  });
};