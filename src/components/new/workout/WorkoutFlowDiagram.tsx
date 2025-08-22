import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlanExercise } from '@/types/plan';
import { getExerciseImageUrl } from '@/types/storage';

// NodePosition type
interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  node: {
    id: string;
    exercises: {
      id: string;
      name: string;
      rawImageUrl: string;
      displaySetsInfo: string;
    }[];
    isSuperset: boolean;
    postGroupRest: number | undefined;
    maxSets: number;
  };
  individualExerciseContentWidth?: number;
  rowIndex?: number;
}

interface WorkoutFlowDiagramProps {
  exerciseGroups: PlanExercise[][];
  containerWidth?: number;
  className?: string;
}

// NodePosition type
interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  node: {
    id: string;
    exercises: {
      id: string;
      name: string;
      rawImageUrl: string;
      displaySetsInfo: string;
    }[];
    isSuperset: boolean;
    postGroupRest: number | undefined;
    maxSets: number;
  };
  individualExerciseContentWidth?: number;
  rowIndex?: number;
}

interface WorkoutFlowDiagramProps {
  exerciseGroups: PlanExercise[][];
  // containerWidth prop removed as we're using dynamicContainerWidth from ResizeObserver
  className?: string;
}

export const WorkoutFlowDiagram: React.FC<WorkoutFlowDiagramProps> = ({
  exerciseGroups,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicContainerWidth, setDynamicContainerWidth] = useState(800); // Sensible default

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          setDynamicContainerWidth(entry.contentBoxSize[0].inlineSize);
        } else {
          setDynamicContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const effectiveContainerWidth = dynamicContainerWidth; // Use this for layout logic

  const nodePadding = 10;
  const imageSize = 60;
  const textLineHeight = 16;
  const setHeight = 15;

  const baseNodeHeight = imageSize + (textLineHeight * 2) + (nodePadding * 2);
  const supersetBadgeHeight = 25;
  const postGroupRestHeight = 15;

  const horizontalSpacing = 30;
  const verticalSpacing = 80;
  const startEndPadding = 20;

  const supersetExerciseInternalMargin = 15;
  const staggerOffset = 15;

  const createNodesFromGroups = () => {
    return exerciseGroups.map((groupExercises, index) => {
      const isSuperset = groupExercises.length > 1;
      const postGroupRest = groupExercises[groupExercises.length - 1]?.post_group_rest_seconds;
      const maxSetsInGroup = Math.max(...groupExercises.map(ex => ex.sets?.length || 0));

      return {
        id: `group-${index}`,
        exercises: groupExercises.map(ex => {
          const firstSet = ex.sets?.[0];
          const repsText = firstSet?.target_reps ? ` × ${firstSet.target_reps}` : '';
          const setsCount = ex.sets?.length || 0;
          return {
            id: ex.id,
            name: ex.exercise_details?.name || 'Unknown Exercise',
            rawImageUrl: ex.exercise_details?.image_url || '',
            displaySetsInfo: `${setsCount} sets${repsText}`,
          };
        }),
        isSuperset,
        postGroupRest,
        maxSets: maxSetsInGroup > 0 ? maxSetsInGroup : 1,
      };
    });
  };

  const nodes = createNodesFromGroups();

  const calculateNodeDimensions = (node: any) => {
    const isSuperset = node.isSuperset;
    let width;
    let height;
    let individualExerciseContentWidth: number | undefined;

    if (isSuperset) {
      const minIndividualContentWidth = 100;
      const longestIndividualNameLength = Math.max(
          ...node.exercises.map((ex: any) => ex.name.length)
      );
      individualExerciseContentWidth = Math.max(minIndividualContentWidth, longestIndividualNameLength * 7 + 20);

      width = (node.exercises.length * individualExerciseContentWidth) + // FIX: Corrected variable name here
        ((node.exercises.length - 1) * supersetExerciseInternalMargin) + (2 * nodePadding);
      width = Math.max(width, 200);

      height = supersetBadgeHeight + nodePadding + imageSize + textLineHeight + textLineHeight + nodePadding + 10;
      if (node.postGroupRest && node.postGroupRest > 0) height += postGroupRestHeight;
    } else {
      const longestNameLength = Math.max(
          ...node.exercises.map((ex: any) => ex.name.length)
      );
      const baseSingleWidth = 160;
      width = (Math.max(baseSingleWidth, longestNameLength * 8 + 40) + (2 * nodePadding)) - 50;
      height = baseNodeHeight + ((node.maxSets - 1) * setHeight);
      if (node.postGroupRest && node.postGroupRest > 0) height += postGroupRestHeight;
    }

    height = Math.max(height, 120);
    return { width, height, individualExerciseContentWidth };
  };

  const layoutNodes = (): NodePosition[] => {
    const positions: NodePosition[] = [];
    let currentRowStartX = startEndPadding;
    let currentX = currentRowStartX;
    let currentY = startEndPadding;
    let maxRowHeight = 0;
    let nodesInCurrentRow = 0;

    nodes.forEach((node, index) => {
      const dimensions = calculateNodeDimensions(node);

      const rightBoundary = effectiveContainerWidth - startEndPadding;

      if (currentX + dimensions.width > rightBoundary && nodesInCurrentRow > 0) {
        currentY += maxRowHeight + verticalSpacing;
        currentX = currentRowStartX;
        maxRowHeight = 0;
        nodesInCurrentRow = 0;
      }

      const staggeredY = currentY + (nodesInCurrentRow * staggerOffset);

      positions.push({
        x: currentX,
        y: staggeredY,
        width: dimensions.width,
        height: dimensions.height,
        node,
        individualExerciseContentWidth: dimensions.individualExerciseContentWidth,
        rowIndex: nodesInCurrentRow
      });

      maxRowHeight = Math.max(maxRowHeight, dimensions.height + (nodesInCurrentRow * staggerOffset));
      currentX += dimensions.width + horizontalSpacing;
      nodesInCurrentRow++;
    });

    return positions;
  };

  const positions = layoutNodes();
  const totalHeight = positions.length > 0
    ? Math.max(...positions.map(p => p.y + p.height)) + startEndPadding
    : startEndPadding + baseNodeHeight + startEndPadding;

  const createConnectionPath = (fromPos: NodePosition, toPos: NodePosition) => {
    if (fromPos.rowIndex === undefined || toPos.rowIndex === undefined) return null;
    const isSameLogicalRow = Math.abs((toPos.y + toPos.height/2) - (fromPos.y + fromPos.height/2)) < (verticalSpacing/2);

    if (toPos.x > fromPos.x && isSameLogicalRow) {
        const fromPoint = {
            x: fromPos.x + fromPos.width,
            y: fromPos.y + fromPos.height / 2
        };
        const toPoint = {
            x: toPos.x,
            y: toPos.y + toPos.height / 2
        };

        const controlOffset = Math.min(40, (toPoint.x - fromPoint.x) / 3);

        return `M ${fromPoint.x} ${fromPoint.y}
                C ${fromPoint.x + controlOffset} ${fromPoint.y},
                  ${toPoint.x - controlOffset} ${toPoint.y},
                  ${toPoint.x} ${toPoint.y}`;
    }
    return null;
  };

  const renderConnections = () => {
    const connections = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const pathData = createConnectionPath(positions[i], positions[i + 1]);
      if (pathData) {
        connections.push(
          <path
            key={`connection-${i}`}
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/60"
            markerEnd="url(#arrowhead)"
          />
        );
      }
    }
    return connections;
  };

  const getNodeColor = (node: any) => {
    if (node.isSuperset) {
      return 'fill-primary/10 stroke-gray-700 stroke-2';
    }
    return 'fill-muted stroke-border stroke-2';
  };

  if (nodes.length === 0) {
    return (
      <div className={cn("p-8 text-center text-muted-foreground", className)}>
        No exercises to display
      </div>
    );
  }

  const svgContentWidth = positions.length > 0
    ? Math.max(...positions.map(p => p.x + p.width)) + startEndPadding
    : effectiveContainerWidth;


  return (
    <div ref={containerRef} className={cn("p-4 bg-card rounded-lg border overflow-x-auto", className)}>
      <svg
        width={svgContentWidth}
        height={totalHeight}
        viewBox={`0 0 ${svgContentWidth} ${totalHeight}`}
        className="w-full block"
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-primary/60" />
          </marker>
        </defs>

        {renderConnections()}

        {positions.map((pos) => (
          <g key={pos.node.id}>
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.width}
              height={pos.height}
              rx="8"
              className={getNodeColor(pos.node)}
            />

            {pos.node.isSuperset && (
              <g>
                <rect
                  x={pos.x + nodePadding}
                  y={pos.y + nodePadding}
                  width="80"
                  height="18"
                  rx="9"
                  className="fill-primary"
                />
                <text
                  x={pos.x + nodePadding + 40}
                  y={pos.y + nodePadding + 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-primary-foreground uppercase"
                >
                  Superset
                </text>
              </g>
            )}

            {pos.node.isSuperset ? (
              pos.node.exercises.map((exercise: any, exIndex: number) => {
                const currentIndividualContentWidth = pos.individualExerciseContentWidth || 100;
                const currentExerciseBlockX = pos.x + nodePadding + (exIndex * (currentIndividualContentWidth + supersetExerciseInternalMargin));
                const contentCenterX = currentExerciseBlockX + currentIndividualContentWidth / 2;

                const imageUrl = getExerciseImageUrl(exercise.rawImageUrl);
                const startYForContent = pos.y + supersetBadgeHeight + nodePadding;

                return (
                  <g key={exercise.id + "-superset-item"}>
                    <defs>
                      <clipPath id={`rect-clip-${exercise.id}`}>
                        <rect
                          x={contentCenterX - imageSize / 2}
                          y={startYForContent}
                          width={imageSize}
                          height={imageSize}
                          rx="8"
                        />
                      </clipPath>
                    </defs>

                    {exercise.rawImageUrl && (
                      <image
                        href={imageUrl}
                        x={contentCenterX - imageSize / 2}
                        y={startYForContent}
                        width={imageSize}
                        height={imageSize}
                        clipPath={`url(#rect-clip-${exercise.id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    )}

                    <text
                      x={contentCenterX}
                      y={startYForContent + imageSize + textLineHeight}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-medium fill-foreground"
                    >
                      {exercise.name.length > 15 ? `${exercise.name.substring(0, 15)}...` : exercise.name}
                    </text>

                    <text
                      x={contentCenterX}
                      y={startYForContent + imageSize + (textLineHeight * 2) + 5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-muted-foreground font-medium"
                    >
                      {exercise.displaySetsInfo}
                    </text>
                  </g>
                );
              })
            ) : (
              <g>
                <defs>
                  <clipPath id={`rect-clip-${pos.node.exercises[0].id}`}>
                    <rect
                      x={pos.x + pos.width / 2 - imageSize / 2}
                      y={pos.y + nodePadding}
                      width={imageSize}
                      height={imageSize}
                      rx="8"
                    />
                  </clipPath>
                </defs>
                {pos.node.exercises[0].rawImageUrl && (
                  <image
                    href={getExerciseImageUrl(pos.node.exercises[0].rawImageUrl)}
                    x={pos.x + pos.width / 2 - imageSize / 2}
                    y={pos.y + nodePadding}
                    width={imageSize}
                    height={imageSize}
                    clipPath={`url(#rect-clip-${pos.node.exercises[0].id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}

                <text
                  x={pos.x + pos.width / 2}
                  y={pos.y + nodePadding + imageSize + textLineHeight}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-medium fill-foreground"
                >
                  {pos.node.exercises[0].name.length > 20 ? `${pos.node.exercises[0].name.substring(0, 17)}...` : pos.node.exercises[0].name}
                </text>

                <text
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height - (pos.node.postGroupRest && pos.node.postGroupRest > 0 ? (nodePadding + postGroupRestHeight + setHeight/2) : nodePadding + setHeight/2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground font-medium"
                >
                  {pos.node.exercises[0].displaySetsInfo}
                </text>
              </g>
            )}

            {pos.node.postGroupRest && pos.node.postGroupRest > 0 && (
              <g>
                <text
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height - nodePadding}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                >
                  Rest: {pos.node.postGroupRest}s
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};