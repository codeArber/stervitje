// FILE: src/components/team/TeamManagementPlanGrid.tsx

import React from 'react';
import { FixedSizeList as List } from 'react-window'; // For virtualization

// --- API Hooks & Types ---
import type { TeamManagementPlanSummary, TeamManagementPlanFilters } from '@/types/team';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Search, Zap, Star } from 'lucide-react';

// --- Reusable Components ---
import { PlanCardTeamManagement } from './PlanCardTeamManagement'; // NEW COMPONENT
import { PlanCardTeamManagementSkeleton } from './PlanCardTeamManagementSkeleton'; // NEW COMPONENT
import { useTeamManagementPlansQuery } from '@/api/team';
import { Input } from '@/components/ui/input';
import { CreatePlanDialog } from '../plan/CreatePlanDialog';

interface TeamManagementPlanGridProps {
  teamId: string;
  filters: TeamManagementPlanFilters; // Filters passed from parent
}

export function TeamManagementPlanGrid({ teamId, filters }: TeamManagementPlanGridProps) {
  const { data: plans, isLoading, isError, error } = useTeamManagementPlansQuery(teamId, filters);

  // --- Virtualization Configuration ---
  const itemHeight = 550; // Approximate height of PlanCardTeamManagement. ADJUST AS NEEDED.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<List>(null);
  const [itemsPerRow, setItemsPerRow] = React.useState(1);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [listHeight, setListHeight] = React.useState(800); // Default fallback height
  const [isContainerReady, setIsContainerReady] = React.useState(false);

  // Calculate items per row, container width, and list height on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && headerRef.current) {
        const width = containerRef.current.offsetWidth;
        const headerHeight = headerRef.current.offsetHeight;
        const availableHeight = containerRef.current.offsetHeight - headerHeight - 8; // Subtract space-y-2 (0.5rem ~8px)
        console.log('Resize triggered:', { width, headerHeight, availableHeight }); // Debugging
        setContainerWidth(width || window.innerWidth); // Fallback to window width
        setListHeight(availableHeight > 0 ? availableHeight : 800); // Fallback height
        setIsContainerReady(true);

        if (width >= 1024) { // lg breakpoint
          setItemsPerRow(3); // Matches lg:grid-cols-3
        } else if (width >= 768) { // md breakpoint
          setItemsPerRow(2); // Matches md:grid-cols-2
        } else {
          setItemsPerRow(1); // Matches grid-cols-1
        }
      } else {
        console.warn('Refs not ready:', { containerRef: !!containerRef.current, headerRef: !!headerRef.current });
      }
    };

    // Use ResizeObserver for accurate dimension detection
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize(); // Initial calculation
    }

    // Fallback for older browsers or edge cases
    window.addEventListener('resize', handleResize);

    // Force a rerender after a small delay to ensure everything is ready
    const timeoutId = setTimeout(() => {
      handleResize();
      setIsContainerReady(true); // Force readiness after delay
    }, 100);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Ensure `plans` is an array for `useMemo` even if undefined during initial load
  const memoizedPlans = plans || [];

  const itemData = React.useMemo(() => ({
    plans: memoizedPlans,
    itemsPerRow,
  }), [memoizedPlans, itemsPerRow]);

  const rowCount = Math.ceil(memoizedPlans.length / itemsPerRow);

  // Key prop for the List to force re-mount when filters/data change, resetting scroll.
  const listKey = `${JSON.stringify(filters)}-${memoizedPlans.length}-${itemsPerRow}-${containerWidth}`;

  // Debugging render conditions
  console.log('Render conditions:', {
    isContainerReady,
    containerWidth,
    listHeight,
    rowCount,
    hasPlans: memoizedPlans.length > 0,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <PlanCardTeamManagementSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600">{error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!memoizedPlans.length) {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">No Plans Found</h3>
          <p className="text-slate-500 text-lg">Try adjusting your filters to find more plans.</p>
        </CardContent>
      </Card>
    );
  }

  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const { plans: rowPlans, itemsPerRow: rowItemsPerRow } = itemData;

    const startIndex = index * rowItemsPerRow;
    const endIndex = Math.min(startIndex + rowItemsPerRow, rowPlans.length);
    const plansInRow = rowPlans.slice(startIndex, endIndex);

    // Dynamically set grid-cols based on itemsPerRow
    const colClass = rowItemsPerRow === 3 ? 'grid-cols-3' : rowItemsPerRow === 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
      <div style={style} className={`grid ${colClass} gap-6 px-1`}>
        {plansInRow.map(plan => (
          <div key={plan.id} className="w-full">
            <PlanCardTeamManagement planData={plan} teamId={teamId} />
          </div>
        ))}
        {/* Fill remaining space if last row has fewer items */}
        {plansInRow.length < rowItemsPerRow &&
          Array.from({ length: rowItemsPerRow - plansInRow.length }).map((_, i) => (
            <div key={`spacer-${index}-${i}`} />
          ))
        }
      </div>
    );
  });
  Row.displayName = 'VirtualizedTeamManagementPlanRow';

  return (
    <div ref={containerRef} className="flex flex-col h-full space-y-2">
      <div ref={headerRef} className="w-full">
        <div className="w-full bg-muted rounded-xl p-4 flex flex-row justify-between">
          <div className="text-muted-foreground">
            Team overview stats (e.g., total members, total plans, aggregated forks/likes)
          </div>
          <CreatePlanDialog teamId={teamId} />
        </div>
        <Label variant="sectionTitle">Team Plans</Label>
      </div>

      <div className="team-management-plans-grid-virtualized-container flex-1 min-h-0">
        {isContainerReady && containerWidth > 0 && listHeight > 0 && rowCount > 0 ? (
          <List
            key={listKey}
            ref={listRef}
            height={listHeight}
            itemCount={rowCount}
            itemSize={itemHeight}
            width={containerWidth}
            itemData={itemData}
            overscanCount={2}
            className="overflow-auto"
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Initializing...</div>
          </div>
        )}
      </div>
    </div>
  );
}