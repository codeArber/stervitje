// FILE: src/components/new/measurements/MeasurementStatusDiagram.tsx

import React from "react";
import Model from "react-body-highlighter";
import type { Tables } from '@/types/database.types';
import { VisualProgressScrubber } from "./VisualProgressScrubber";

// --- DATA DEFINITIONS ---
const POSITIONS: Record<"anterior" | "posterior", Record<string, { top: number; left: number; offsetY?: number }>> = {
  anterior: { chest: { top: 25, left: 50, offsetY: -80 }, bicepsL: { top: 30, left: 27, offsetY: -55 }, bicepsR: { top: 30, left: 72, offsetY: -55 }, forearmL: { top: 45, left: 13, offsetY: -50 }, forearmR: { top: 45, left: 85, offsetY: -50 }, waist: { top: 42, left: 50, offsetY: 30 }, hips: { top: 48, left: 48, offsetY: 35 }, thighL: { top: 65, left: 37, offsetY: 50 }, thighR: { top: 65, left: 65, offsetY: 50 }, },
  posterior: { waist: { top: 45, left: 50, offsetY: 30 }, hips: { top: 55, left: 48, offsetY: 15 }, thighL: { top: 65, left: 40, offsetY: 25 }, thighR: { top: 65, left: 60, offsetY: 25 }, calfL: { top: 92, left: 36, offsetY: 5 }, calfR: { top: 92, left: 67, offsetY: 5 }, },
};
const KEY_TO_DB_METRIC_MAP: Record<string, { key: keyof Tables<'user_measurements'>, unit: string, label: string }> = {
  weight: { key: 'weight_kg', unit: 'kg', label: 'Weight' }, height: { key: 'height_cm', unit: 'cm', label: 'Height' },
  bodyFat: { key: 'body_fat_percentage', unit: '%', label: 'Body Fat %' }, restingHR: { key: 'resting_hr', unit: 'bpm', label: 'Resting HR' },
  bicepsL: { key: 'biceps_l_cm', unit: 'cm', label: 'Biceps L' }, bicepsR: { key: 'biceps_r_cm', unit: 'cm', label: 'Biceps R' },
  waist: { key: 'waist_cm', unit: 'cm', label: 'Waist' }, chest: { key: 'chest_cm', unit: 'cm', label: 'Chest' },
  thighL: { key: 'thigh_l_cm', unit: 'cm', label: 'Thigh L' }, thighR: { key: 'thigh_r_cm', unit: 'cm', label: 'Thigh R' },
  calfL: { key: 'calf_l_cm', unit: 'cm', label: 'Calf L' }, calfR: { key: 'calf_r_cm', unit: 'cm', label: 'Calf R' },
  hips: { key: 'hips_cm', unit: 'cm', label: 'Hips' }, forearmL: { key: 'forearm_l_cm', unit: 'cm', label: 'Forearm L' },
  forearmR: { key: 'forearm_r_cm', unit: 'cm', label: 'Forearm R' },
};
const BODY_PART_KEYS = Object.keys(KEY_TO_DB_METRIC_MAP).filter(k => !['weight', 'height', 'bodyFat', 'restingHR'].includes(k));
const CHARACTERISTIC_KEYS = ['weight', 'height', 'bodyFat', 'restingHR'];

// --- INTERNAL SUB-COMPONENT (To avoid repeating code) ---
const SingleDiagramView = ({ side, measurementData }: { side: 'anterior' | 'posterior', measurementData: Tables<'user_measurements'> | null }) => {
  // UPDATED: Scaled model size (100 * 1.3)
  const modelWidth = 130;
  const modelHeight = 228; // Maintain aspect ratio (130 * 1.75)
  const svgTotalWidth = modelWidth + 170; // Adjusted padding for new scale
  const svgTotalHeight = modelHeight;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold capitalize mb-1">{side}</h3>
      <div className="relative flex-shrink-0" style={{ width: `${svgTotalWidth}px`, height: `${svgTotalHeight}px` }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Model data={[]} type={side} bodyColor="#cbd5e1" style={{ width: `${modelWidth}px`, height: `${modelHeight}px` }} />
        </div>
        <svg className="absolute inset-0 pointer-events-none" viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}>
          {BODY_PART_KEYS.map((defKey) => {
            const coords = POSITIONS[side][defKey];
            if (!coords) return null;

            const metricInfo = KEY_TO_DB_METRIC_MAP[defKey];
            const value = measurementData ? measurementData[metricInfo.key] : null;
            const displayValue = value != null ? `${value}${metricInfo.unit}` : '-';

            const modelOffsetX = (svgTotalWidth - modelWidth) / 2;
            const anchorX = (coords.left / 100) * modelWidth + modelOffsetX;
            const anchorY = (coords.top / 100) * modelHeight;
            const isLeft = coords.left < 50;
            const labelWidth = 70;
            const labelHeight = 38;
            // UPDATED: Scale the offset based on the new model size
            const offsetY = (coords.offsetY || 0) * 0.65;
            // UPDATED: Adjusted curve control points for new scale
            const pathData = `M ${anchorX} ${anchorY} C ${anchorX + (isLeft ? -35 : 35)} ${anchorY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? 35 : -35)} ${anchorY + offsetY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? labelWidth : 0)} ${anchorY + offsetY}`;

            return (
              <g key={defKey}>
                <path d={pathData} stroke={'hsl(var(--primary))'} strokeWidth={1.5} fill="none" />
                <foreignObject x={isLeft ? 5 : svgTotalWidth - 5 - labelWidth} y={anchorY + offsetY - labelHeight / 2} width={labelWidth} height={labelHeight} style={{ overflow: 'visible' }}>
                  <div className="flex flex-col items-center justify-center bg-background/80 border border-border rounded-md px-1 py-0.5 text-center shadow-sm text-foreground">
                    <span className="text-[9px] font-semibold">{metricInfo.label}</span>
                    <span className="text-xs font-bold text-primary">{displayValue}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// --- THE MAIN COMPONENT EXPORT ---
interface MeasurementStatusDiagramProps {
  latestMeasurement: Tables<'user_measurements'> | null;
  measurements: Tables<'user_measurements'>[];
}

export function MeasurementStatusDiagram({ latestMeasurement, measurements }: MeasurementStatusDiagramProps) {
  return (
    // UPDATED: Main container is a flex row that centers its children
    <div className="flex flex-row items-center justify-center gap-x-6 w-full">

      {/* LEFT SECTION: Contains the two models in a row */}
      <div className="flex flex-row items-start gap-x-4">
        <SingleDiagramView side="anterior" measurementData={latestMeasurement} />
        <SingleDiagramView side="posterior" measurementData={latestMeasurement} />
      </div>

      {/* RIGHT SECTION: Contains the vitals */}
      <div className="flex flex-col justify-center gap-y-3 w-32">
        <h3 className="text-lg font-bold text-center mb-1">Vitals</h3>
        {CHARACTERISTIC_KEYS.map(defKey => {
          const metricInfo = KEY_TO_DB_METRIC_MAP[defKey];
          const value = latestMeasurement ? latestMeasurement[metricInfo.key] : null;
          const displayValue = value != null ? `${value}${metricInfo.unit}` : '-';
          return (
            <div key={defKey} className="flex flex-col items-center justify-center w-full bg-background/80 border border-border rounded-md px-2 py-1 text-center shadow-sm text-foreground">
              <span className="text-[10px] font-semibold">{metricInfo.label}</span>
              <span className="text-sm font-bold text-primary">{displayValue}</span>
            </div>
          )
        })}
      </div>
      <div className="w-full h-full">
        <section className="space-y-4">
          <VisualProgressScrubber measurements={measurements || []} />
        </section>
      </div>
    </div>
  );
}