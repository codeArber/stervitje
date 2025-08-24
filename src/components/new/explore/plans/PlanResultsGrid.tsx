// FILE: src/components/explore/plans/PlanResultsGrid.tsx

import React from 'react';
import { FixedSizeList as List } from 'react-window'; // For virtualization (npm install react-window)

// --- API & Types ---
import { useRichPlanCardsQuery } from '@/api/plan/usePlan';
import type { PlanFilters, FilteredPlanRich } from '@/types/plan';

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Search, Zap, Star } from 'lucide-react';

// --- Reusable Components ---
import { PlanCardSkeleton } from './PlanCardSkeleton'; // NEW IMPORT
import { PlanCardExplore } from './PlanCardExplore';

interface PlanResultsGridProps {
  filters: PlanFilters;
}

export function PlanResultsGrid({ filters }: PlanResultsGridProps) {
  const { data: plans, isLoading, isError, error } = useRichPlanCardsQuery(filters);
  // --- Virtualization Configuration ---
  const itemHeight = 450; // Approximate height of a PlanCardExplore. Adjust based on your card's actual height.
  const listHeight = window.innerHeight - 68;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<List>(null);
  const [itemsPerRow, setItemsPerRow] = React.useState(1);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [isContainerReady, setIsContainerReady] = React.useState(false);

  // Calculate items per row, container width, and list height on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current ) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setIsContainerReady(true);
        
        if (width >= 768) { // md and lg breakpoint (matches md:grid-cols-2 lg:grid-cols-2)
          setItemsPerRow(2);
        } else {
          setItemsPerRow(1);
        }
      }
    };

    // Use ResizeObserver for more accurate dimension detection
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <PlanCardSkeleton key={i} />)}
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

    return (
      <div style={style} className="flex gap-6 px-4"> {/* Added px-1 for slight padding */}
        {plansInRow.map(plan => (
          <div key={plan.id} className="flex-1 min-w-0">
            <PlanCardExplore planData={plan} />
          </div>
        ))}
        {/* Fill remaining space if last row has fewer items */}
        {plansInRow.length < rowItemsPerRow && Array.from({ length: rowItemsPerRow - plansInRow.length }).map((_, i) => (
          <div key={`spacer-${index}-${i}`} className="flex-1 min-w-0" />
        ))}
      </div>
    );
  });
  Row.displayName = 'VirtualizedPlanRow';


  return (
    <div ref={containerRef} className="flex flex-col h-full space-y-6 ">
      <div className="plan-grid-virtualized-container flex-1 min-h-0 " >
        {isContainerReady && containerWidth > 0 && listHeight > 0 && rowCount > 0 ? (
          <List
            key={listKey}
            ref={listRef}
            height={listHeight}
            itemCount={rowCount}
            itemSize={itemHeight}
            width={containerWidth}
            itemData={itemData}
            overscanCount={2} // Pre-render 2 extra rows for smoother scrolling
            className="overflow-auto"
          >
            {Row}
          </List>
        ) : (
          // Fallback loading state while container dimensions are being calculated
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Initializing...</div>
          </div>
        )}
      </div>
    </div>
  );
}