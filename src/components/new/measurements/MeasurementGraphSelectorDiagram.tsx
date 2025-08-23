// FILE: src/components/new/measurements/MeasurementGraphSelectorDiagram.tsx

import React from 'react';
import Model from 'react-body-highlighter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- DATA DEFINITIONS (Specific to this selector) ---
// We map the UI key to the database key the graph expects.
const KEY_MAP: Record<string, string> = {
  weight: 'weight_kg', height: 'height_cm', bodyFat: 'body_fat_percentage', restingHR: 'resting_heart_rate',
  bicepsL: 'biceps_left_cm', bicepsR: 'biceps_right_cm', waist: 'waist_cm', chest: 'chest_cm',
  thighL: 'thigh_left_cm', thighR: 'thigh_right_cm', calfL: 'calf_left_cm', calfR: 'calf_right_cm',
  hips: 'hips_cm', forearmL: 'forearm_left_cm', forearmR: 'forearm_right_cm',
};

const ALL_UI_KEYS = Object.keys(KEY_MAP);
const ALL_DB_KEYS = Object.values(KEY_MAP);

const CHARACTERISTIC_DEFS = [ { key: 'weight', label: 'Weight' }, { key: 'height', label: 'Height' }, { key: 'bodyFat', label: 'Body Fat %' }, { key: 'restingHR', label: 'Resting HR' }];
const BODY_PART_DEFS = [ { key: 'bicepsL', label: 'Biceps L' }, { key: 'bicepsR', label: 'Biceps R' }, { key: 'waist', label: 'Waist' }, { key: 'chest', label: 'Chest' }, { key: 'thighL', label: 'Thigh L' }, { key: 'thighR', label: 'Thigh R' }, { key: 'calfL', label: 'Calf L' }, { key: 'calfR', label: 'Calf R' }, { key: 'hips', label: 'Hips' }, { key: 'forearmL', label: 'Forearm L' }, { key: 'forearmR', label: 'Forearm R' }];
const POSITIONS: Record<string, { top: number; left: number; offsetY?: number }> = { chest: { top: 25, left: 50, offsetY: -80 }, bicepsL: { top: 30, left: 27, offsetY: -55 }, bicepsR: { top: 30, left: 72, offsetY: -55 }, forearmL: { top: 45, left: 13, offsetY: -50 }, forearmR: { top: 45, left: 85, offsetY: -50 }, waist: { top: 42, left: 50, offsetY: 30 }, hips: { top: 48, left: 48, offsetY: 35 }, thighL: { top: 65, left: 37, offsetY: 50 }, thighR: { top: 65, left: 65, offsetY: 50 }};


// --- COMPONENT PROPS ---
interface MeasurementGraphSelectorDiagramProps {
  selectedMetricKeys: string[]; // The DB keys that are currently selected
  onSelectionChange: (newKeys: string[]) => void; // Callback to update the parent's state
}

// --- THE NEW COMPONENT ---
export function MeasurementGraphSelectorDiagram({ selectedMetricKeys, onSelectionChange }: MeasurementGraphSelectorDiagramProps) {
  
  const handleToggleMetric = (uiKey: string) => {
    const dbKey = KEY_MAP[uiKey];
    const isSelected = selectedMetricKeys.includes(dbKey);
    if (isSelected) {
      onSelectionChange(selectedMetricKeys.filter(key => key !== dbKey));
    } else {
      onSelectionChange([...selectedMetricKeys, dbKey]);
    }
  };

  const handleSelectAll = () => onSelectionChange(ALL_DB_KEYS);
  const handleClearAll = () => onSelectionChange([]);

  const modelWidth = 150;
  const modelHeight = 263; // 150 * 1.75
  const svgTotalWidth = modelWidth + 180;
  const svgTotalHeight = modelHeight;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Metrics</CardTitle>
        <CardDescription>Click on a body part to add or remove it from the graph.</CardDescription>
        <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-auto py-1">Select All</Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs h-auto py-1">Clear</Button>
        </div>
      </CardHeader>
      <CardContent className="flex items-start justify-center gap-4">
        {/* Diagram */}
        <div className="relative flex-shrink-0" style={{ width: `${svgTotalWidth}px`, height: `${svgTotalHeight}px` }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Model data={[]} type="anterior" bodyColor="#cbd5e1" style={{ width: `${modelWidth}px`, height: `${modelHeight}px` }} />
          </div>
          <svg className="absolute inset-0" viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}>
            {BODY_PART_DEFS.map((def) => {
              const coords = POSITIONS[def.key];
              if (!coords) return null;
              const isSelected = selectedMetricKeys.includes(KEY_MAP[def.key]);
              const modelOffsetX = (svgTotalWidth - modelWidth) / 2;
              const anchorX = (coords.left / 100) * modelWidth + modelOffsetX;
              const anchorY = (coords.top / 100) * modelHeight;
              const isLeft = coords.left < 50;
              const labelWidth = 70;
              const labelHeight = 22;
              const offsetY = (coords.offsetY || 0) * 0.75;
              const pathData = `M ${anchorX} ${anchorY} C ${anchorX + (isLeft ? -35 : 35)} ${anchorY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? 35 : -35)} ${anchorY + offsetY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? labelWidth : 0)} ${anchorY + offsetY}`;
              return (
                <g key={def.key} onClick={() => handleToggleMetric(def.key)} className="cursor-pointer">
                  <path d={pathData} stroke={isSelected ? '#0ea5e9' : 'hsl(var(--primary))'} strokeWidth={isSelected ? 2 : 1.5} fill="none" />
                  <foreignObject x={isLeft ? 5 : svgTotalWidth - 5 - labelWidth} y={anchorY + offsetY - labelHeight / 2} width={labelWidth} height={labelHeight} style={{ overflow: 'visible' }}>
                    <div className={cn("bg-background/80 border rounded-md px-2 py-0.5 text-[10px] text-center shadow-sm text-foreground transition-colors", isSelected ? "border-sky-500 text-sky-500 font-semibold" : "border-border")}>
                      {def.label}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Vitals Column */}
        <div className="flex flex-col justify-center gap-y-2 w-28 pt-4">
            {CHARACTERISTIC_DEFS.map(def => {
                const isSelected = selectedMetricKeys.includes(KEY_MAP[def.key]);
                return (
                    <div key={def.key} onClick={() => handleToggleMetric(def.key)} className={cn("w-full bg-background/80 border rounded-md px-2 py-1 text-sm text-center shadow-sm text-foreground transition-colors cursor-pointer", isSelected ? "border-sky-500 text-sky-500 font-semibold" : "border-border")}>
                        {def.label}
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}