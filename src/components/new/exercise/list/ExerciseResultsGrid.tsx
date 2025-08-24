// FILE: src/components/exercise/ExerciseResultsGrid.tsx

import React from 'react';
import { FixedSizeList as List } from 'react-window'; // Import for virtualization

// --- API Hooks & Types ---

// shadcn/ui components
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Icons
import { Search, Zap, Star } from 'lucide-react';

// --- Reusable Components ---
import { ExerciseCard } from './ExerciseCard';
import { ExerciseCardSkeleton } from './ExerciseCardSkeleton';
import { ExerciseFilters } from './ExerciseFiltersPanel';
import { useFilteredExercisesQuery } from '@/api/exercise';

interface ExerciseResultsGridProps {
  filters: ExerciseFilters;
}

export function ExerciseResultsGrid({ filters }: ExerciseResultsGridProps) {
  // --- FIX: Call all hooks unconditionally at the top level ---
  const { data: exercises, isLoading, isError, error } = useFilteredExercisesQuery(filters);

  const itemHeight = 380; // Approximate height of a single ExerciseCard. Adjust as needed.
  const listHeight = window.innerHeight - 80;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<List>(null);
  const [itemsPerRow, setItemsPerRow] = React.useState(1);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [isContainerReady, setIsContainerReady] = React.useState(false);

  // Calculate items per row and container width on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setIsContainerReady(true); // Mark container as ready
        
        if (width >= 1024) { // lg breakpoint
          setItemsPerRow(3);
        } else if (width >= 768) { // md breakpoint
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

  // Ensure `exercises` is an array for `useMemo` even if undefined during initial load
  const memoizedExercises = exercises || [];

  const itemData = React.useMemo(() => ({
    exercises: memoizedExercises,
    itemsPerRow,
  }), [memoizedExercises, itemsPerRow]);

  // Calculate total number of virtualized rows AFTER data is potentially loaded
  const rowCount = Math.ceil(memoizedExercises.length / itemsPerRow);

  const listKey = `${JSON.stringify(filters)}-${memoizedExercises.length}-${itemsPerRow}-${containerWidth}`;

  // --- Conditional Renders follow all hook calls ---
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => <ExerciseCardSkeleton key={i} />)}
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

  if (!memoizedExercises.length) {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">No exercises found</h3>
          <p className="text-slate-500 text-lg">Try adjusting your filters or search terms to discover more exercises.</p>
        </CardContent>
      </Card>
    );
  }

  // --- Row Renderer for Virtualized List ---
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const { exercises: rowExercises, itemsPerRow: rowItemsPerRow } = itemData;

    const startIndex = index * rowItemsPerRow;
    const endIndex = Math.min(startIndex + rowItemsPerRow, rowExercises.length);
    const exercisesInRow = rowExercises.slice(startIndex, endIndex);

    return (
      <div style={style} className="flex gap-6 px-4"> {/* Added px-1 for slight padding */}
        {exercisesInRow.map(exercise => (
          <div key={exercise.id} className="flex-1 min-w-0">
            <ExerciseCard exercise={exercise} />
          </div>
        ))}
        {/* Fill remaining space if last row has fewer items */}
        {exercisesInRow.length < rowItemsPerRow && 
          Array.from({ length: rowItemsPerRow - exercisesInRow.length }).map((_, i) => (
            <div key={`spacer-${index}-${i}`} className="flex-1 min-w-0" />
          ))
        }
      </div>
    );
  });
  Row.displayName = 'VirtualizedExerciseRow';

  return (
    <div className="space-y-2 ">
      <div 
        ref={containerRef} 
        className="exercise-grid-virtualized-container w-full space-y-4"
        style={{ height: listHeight }} // Ensure container has explicit height
      >
        {isContainerReady && containerWidth > 0 && rowCount > 0 ? (
          <List
            key={listKey}
            ref={listRef}
            height={listHeight}
            itemCount={rowCount}
            itemSize={itemHeight}
            width={containerWidth}
            itemData={itemData}
            overscanCount={2} // Pre-render 2 extra rows for smoother scrolling
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