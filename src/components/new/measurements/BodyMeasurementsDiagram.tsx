import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Model from "react-body-highlighter";
import { cn } from "@/lib/utils";
import { Scale, Ruler, Percent, Heart } from 'lucide-react';
import { MiniMeasurementGraph } from "./MiniMeasurementGraph";
import { Link } from "@tanstack/react-router";
import { useUserMeasurementsQuery } from "@/api/user";
import { useAuthStore } from "@/stores/auth-store";
import type { Tables } from '@/types/database.types'; // Your database types
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import { useUserWorkoutDatesQuery } from "@/api/performance";
import { Tooltip as ReactTooltip } from 'react-tooltip';

// --- DATA DEFINITIONS ---

const ALL_MEAS_DEFS = [
  { key: "weight", label: "Weight", icon: <Scale className="h-4 w-4 text-primary" /> },
  { key: "height", label: "Height", icon: <Ruler className="h-4 w-4 text-primary" /> },
  { key: "bodyFat", label: "Body Fat %", icon: <Percent className="h-4 w-4 text-primary" /> },
  { key: "restingHR", label: "Resting HR", icon: <Heart className="h-4 w-4 text-primary" /> },
  { key: "bicepsL", label: "Biceps L" },
  { key: "bicepsR", label: "Biceps R" },
  { key: "waist", label: "Waist" },
  { key: "chest", label: "Chest" },
  { key: "thighL", label: "Thigh L" },
  { key: "thighR", label: "Thigh R" },
  { key: "calfL", label: "Calf L" },
  { key: "calfR", label: "Calf R" },
  { key: "hips", label: "Hips" },
  { key: "forearmL", label: "Forearm L" },
  { key: "forearmR", label: "Forearm R" },
];

const CHARACTERISTIC_DEFS = ALL_MEAS_DEFS.filter(def => 'icon' in def);
const BODY_PART_DEFS = ALL_MEAS_DEFS.filter(def => !('icon' in def));

const POSITIONS: Record<"anterior" | "posterior", Record<string, { top: number; left: number; offsetY?: number }>> = {
  anterior: { chest: { top: 25, left: 50, offsetY: -80 }, bicepsL: { top: 30, left: 27, offsetY: -55 }, bicepsR: { top: 30, left: 72, offsetY: -55 }, forearmL: { top: 45, left: 13, offsetY: -50 }, forearmR: { top: 45, left: 85, offsetY: -50 }, waist: { top: 42, left: 50, offsetY: 30 }, hips: { top: 48, left: 48, offsetY: 35 }, thighL: { top: 65, left: 37, offsetY: 50 }, thighR: { top: 65, left: 65, offsetY: 50 }, },
  posterior: { waist: { top: 45, left: 50, offsetY: 30 }, hips: { top: 55, left: 48, offsetY: 15 }, thighL: { top: 65, left: 40, offsetY: 25 }, thighR: { top: 65, left: 60, offsetY: 25 }, calfL: { top: 92, left: 36, offsetY: 5 }, calfR: { top: 92, left: 67, offsetY: 5 }, },
};

// ==================================================================
// NEW: Map component keys to your database column names and units
// ==================================================================
const KEY_TO_DB_METRIC_MAP: Record<string, { key: keyof Tables<'user_measurements'>, unit: string }> = {
  weight: { key: 'weight_kg', unit: 'kg' },
  height: { key: 'height_cm', unit: 'cm' },
  bodyFat: { key: 'body_fat_percentage', unit: '%' },
  restingHR: { key: 'resting_hr', unit: 'bpm' },
  bicepsL: { key: 'biceps_l_cm', unit: 'cm' },
  bicepsR: { key: 'biceps_r_cm', unit: 'cm' },
  waist: { key: 'waist_cm', unit: 'cm' },
  chest: { key: 'chest_cm', unit: 'cm' },
  thighL: { key: 'thigh_l_cm', unit: 'cm' },
  thighR: { key: 'thigh_r_cm', unit: 'cm' },
  calfL: { key: 'calf_l_cm', unit: 'cm' },
  calfR: { key: 'calf_r_cm', unit: 'cm' },
  hips: { key: 'hips_cm', unit: 'cm' },
  forearmL: { key: 'forearm_l_cm', unit: 'cm' },
  forearmR: { key: 'forearm_r_cm', unit: 'cm' },
};

// --- COMPONENT ---

export default function BodyMeasurementDiagram() {
  const { user } = useAuthStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const [side, setSide] = useState<"anterior" | "posterior">("anterior");
  const { user: authUser } = useAuthStore();
  const { data: measurements } = useUserMeasurementsQuery(authUser?.id);
  const { data: dateData, isLoading: isLoadingDates } = useUserWorkoutDatesQuery(user?.id);

  // By default, select 'weight' to show its graph initially
  const [selectedPart, setSelectedPart] = useState<string | null>('weight');

  const handlePartClick = (partKey: string) => {
    setSelectedPart(currentSelected => (currentSelected === partKey ? null : partKey));
  };

  const selectedPartInfo = useMemo(() => {
    if (!selectedPart) return null;
    const partDef = ALL_MEAS_DEFS.find(d => d.key === selectedPart);
    if (!partDef) return null;
    if (POSITIONS.anterior[selectedPart]) return { side: 'anterior', label: partDef.label };
    if (POSITIONS.posterior[selectedPart]) return { side: 'posterior', label: partDef.label };
    return null;
  }, [selectedPart]);

  // ==================================================================
  // NEW: Determine which metric to display based on the selected part
  // ==================================================================
  const displayedMetric = useMemo(() => {
    const key = selectedPart || 'weight'; // Default to weight if nothing is selected
    const mapping = KEY_TO_DB_METRIC_MAP[key];
    const definition = ALL_MEAS_DEFS.find(d => d.key === key);

    return {
      key: mapping?.key || 'weight_kg',
      label: definition?.label || 'Weight',
      unit: mapping?.unit || 'kg',
    };
  }, [selectedPart]);

  const modelWidth = 200;
  const modelHeight = 350;
  const svgTotalWidth = modelWidth + 200;
  const svgTotalHeight = modelHeight;
  const heatmapValues = dateData?.map(d => ({
    date: new Date(d.workout_date),
    count: 1,
  })) || [];

  return (
    <Card className="w-full bg-muted">
      <CardHeader>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          <div className="flex items-center flex-col">
            <div className="mt-2">
              <Tabs value={side} onValueChange={(v) => setSide(v as "anterior" | "posterior")}>
                <TabsList className="mb-2">
                  <TabsTrigger value="anterior">Front</TabsTrigger>
                  <TabsTrigger value="posterior">Back</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-row">
              {/* Diagram Section */}
              <div className="relative flex-shrink-0" style={{ width: `${svgTotalWidth}px`, height: `${svgTotalHeight}px` }}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Model data={[]} type={side} bodyColor="#cbd5e1" style={{ width: `${modelWidth}px`, height: `${modelHeight}px` }} />
                </div>
                <svg className="absolute inset-0" viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}>
                  {BODY_PART_DEFS.map((def) => {
                    const coords = POSITIONS[side][def.key];
                    if (!coords) return null;
                    const isSelected = selectedPart === def.key;
                    const modelOffsetX = (svgTotalWidth - modelWidth) / 2;
                    const anchorX = (coords.left / 100) * modelWidth + modelOffsetX;
                    const anchorY = (coords.top / 100) * modelHeight;
                    const isLeft = coords.left < 50;
                    const labelWidth = 75;
                    const labelHeight = 22;
                    const offsetY = coords.offsetY || 0;
                    const pathData = `M ${anchorX} ${anchorY} C ${anchorX + (isLeft ? -40 : 40)} ${anchorY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? 40 : -40)} ${anchorY + offsetY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? labelWidth : 0)} ${anchorY + offsetY}`;

                    return (
                      <g key={def.key} onClick={() => handlePartClick(def.key)} className="cursor-pointer">
                        <path d={pathData} stroke={isSelected ? '#0ea5e9' : 'hsl(var(--primary))'} strokeWidth={isSelected ? 2 : 1.5} fill="none" />
                        <foreignObject x={isLeft ? 5 : svgTotalWidth - 5 - labelWidth} y={anchorY + offsetY - labelHeight / 2} width={labelWidth} height={labelHeight} style={{ overflow: 'visible' }}>
                          <div className={cn("bg-background/80 border rounded-md px-2 py-0.5 text-[10px] text-center shadow-sm text-foreground transition-colors", isSelected ? "border-sky-500 text-sky-500 font-semibold" : "border-border")}>
                            {values[def.key] || def.label}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>
                {selectedPartInfo && selectedPartInfo.side !== side && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    Selected on {selectedPartInfo.side === 'anterior' ? 'Front' : 'Back'}: {selectedPartInfo.label}
                  </div>
                )}
              </div>

              {/* Characteristic Labels Column */}
              <div className="flex flex-col justify-center gap-y-3 w-24">
                {CHARACTERISTIC_DEFS.map(def => {
                  const isSelected = selectedPart === def.key;
                  return (
                    <div
                      key={def.key}
                      onClick={() => handlePartClick(def.key)}
                      className={cn("w-full bg-background/80 border rounded-md px-2 py-0.5 text-[10px] text-center shadow-sm text-foreground transition-colors cursor-pointer", isSelected ? "border-sky-500 text-sky-500 font-semibold" : "border-border")}>
                      {values[def.key] || def.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Section: Graph Card */}
          <div className="flex-1 space-y-6">
            <Card className="transition-shadow duration-200 border-none bg-transparent ">
              <CardHeader>
                {/* UPDATED: Title and description are now dynamic */}
                <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-green-500" /> {displayedMetric.label} History</CardTitle>
                <CardDescription>A summary of your {displayedMetric.label.toLowerCase()} changes over time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                {measurements && measurements.length > 0 ? (
                  // UPDATED: Pass the dynamic metric info to the graph component
                  <MiniMeasurementGraph
                    measurements={measurements}
                    metricKey={displayedMetric.key}
                    metricLabel={displayedMetric.label}
                    metricUnit={displayedMetric.unit}
                  />
                ) : (
                  <div className="text-muted-foreground text-xs text-center py-4">
                    No measurements to graph yet.
                  </div>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile/measurements">View All Measurements</Link>
                </Button>
              </CardContent>
            </Card>
            <CalendarHeatmap
              startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
              endDate={new Date()}
              values={heatmapValues}
              classForValue={(value) => {
                if (!value || !value.count || value.count === 0) {
                  return 'color-empty';
                }
                const count = Math.min(value.count, 4);
                return `color-scale-${count}`;
              }}
              tooltipDataAttrs={(value: ReactCalendarHeatmapValue<Date> | undefined) => {
                if (!value || !value.date || !value.count) {
                  return { 'data-tip': 'No activity on this day' };
                }
                const workoutLabel = value.count === 1 ? 'workout' : 'workouts';
                return {
                  'data-tip': `${value.count} ${workoutLabel} on ${value.date.toLocaleDateString()}`,
                };
              }}
            />

            <ReactTooltip id="heatmap-tooltip" />

            <style>{`
  .heatmap-container .color-empty { fill: hsl(var(--muted)); }
  .heatmap-container .color-scale-1 { fill: hsl(var(--primary) / 0.4); }
  .heatmap-container .color-scale-2 { fill: hsl(var(--primary) / 0.6); }
  .heatmap-container .color-scale-3 { fill: hsl(var(--primary) / 0.8); }
  .heatmap-container .color-scale-4 { fill: hsl(var(--primary)); }
`}</style>

          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link to={"/profile/performance"}>
            <Button variant={'outline'}>View Performance</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}