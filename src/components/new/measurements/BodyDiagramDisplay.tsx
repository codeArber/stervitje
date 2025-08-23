// FILE: src/components/new/measurements/BodyDiagramDisplay.tsx

import React from 'react';
import Model from 'react-body-highlighter';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/database.types';

// --- SHARED DATA DEFINITIONS ---
const ALL_MEAS_DEFS = [
    { key: "weight", label: "Weight" }, { key: "height", label: "Height" },
    { key: "bodyFat", label: "Body Fat %" }, { key: "restingHR", label: "Resting HR" },
    { key: "bicepsL", label: "Biceps L" }, { key: "bicepsR", label: "Biceps R" },
    { key: "waist", label: "Waist" }, { key: "chest", label: "Chest" },
    { key: "thighL", label: "Thigh L" }, { key: "thighR", label: "Thigh R" },
    { key: "calfL", label: "Calf L" }, { key: "calfR", label: "Calf R" },
    { key: "hips", label: "Hips" }, { key: "forearmL", label: "Forearm L" },
    { key: "forearmR", label: "Forearm R" },
];
export const BODY_PART_DEFS = ALL_MEAS_DEFS.filter(def => !["weight", "height", "bodyFat", "restingHR"].includes(def.key));
export const CHARACTERISTIC_DEFS = ALL_MEAS_DEFS.filter(def => ["weight", "height", "bodyFat", "restingHR"].includes(def.key));
const POSITIONS: Record<"anterior" | "posterior", Record<string, { top: number; left: number; offsetY?: number }>> = {
  anterior: { chest: { top: 25, left: 50, offsetY: -80 }, bicepsL: { top: 30, left: 27, offsetY: -55 }, bicepsR: { top: 30, left: 72, offsetY: -55 }, forearmL: { top: 45, left: 13, offsetY: -50 }, forearmR: { top: 45, left: 85, offsetY: -50 }, waist: { top: 42, left: 50, offsetY: 30 }, hips: { top: 48, left: 48, offsetY: 35 }, thighL: { top: 65, left: 37, offsetY: 50 }, thighR: { top: 65, left: 65, offsetY: 50 }, },
  posterior: { waist: { top: 45, left: 50, offsetY: 30 }, hips: { top: 55, left: 48, offsetY: 15 }, thighL: { top: 65, left: 40, offsetY: 25 }, thighR: { top: 65, left: 60, offsetY: 25 }, calfL: { top: 92, left: 36, offsetY: 5 }, calfR: { top: 92, left: 67, offsetY: 5 }, },
};
export const KEY_TO_DB_METRIC_MAP: Record<string, { key: keyof Tables<'user_measurements'>, unit: string }> = {
  weight: { key: 'weight_kg', unit: 'kg' }, height: { key: 'height_cm', unit: 'cm' }, bodyFat: { key: 'body_fat_percentage', unit: '%' }, restingHR: { key: 'resting_hr', unit: 'bpm' }, bicepsL: { key: 'biceps_l_cm', unit: 'cm' }, bicepsR: { key: 'biceps_r_cm', unit: 'cm' }, waist: { key: 'waist_cm', unit: 'cm' }, chest: { key: 'chest_cm', unit: 'cm' }, thighL: { key: 'thigh_l_cm', unit: 'cm' }, thighR: { key: 'thigh_r_cm', unit: 'cm' }, calfL: { key: 'calf_l_cm', unit: 'cm' }, calfR: { key: 'calf_r_cm', unit: 'cm' }, hips: { key: 'hips_cm', unit: 'cm' }, forearmL: { key: 'forearm_l_cm', unit: 'cm' }, forearmR: { key: 'forearm_r_cm', unit: 'cm' },
};

// --- COMPONENT PROPS ---
interface BodyDiagramDisplayProps {
  side: 'anterior' | 'posterior';
  measurementData: Tables<'user_measurements'> | null;
  modelWidth: number;
  selectedPart?: string | null;
  onPartClick?: (partKey: string) => void;
  isHistory?: boolean; // Special flag for history version
}

// --- THE REUSABLE COMPONENT ---
export function BodyDiagramDisplay({ side, measurementData, modelWidth, selectedPart, onPartClick, isHistory = false }: BodyDiagramDisplayProps) {
  const modelHeight = modelWidth * 1.75; // Maintain aspect ratio
  const svgTotalWidth = modelWidth + (isHistory ? 120 : 200); // Less padding for history
  const svgTotalHeight = modelHeight;

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-semibold mb-1 capitalize">{side}</h3>
      <div className="relative flex-shrink-0" style={{ width: `${svgTotalWidth}px`, height: `${svgTotalHeight}px` }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Model data={[]} type={side} bodyColor="#cbd5e1" style={{ width: `${modelWidth}px`, height: `${modelHeight}px` }} />
        </div>
        <svg className="absolute inset-0" viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}>
          {BODY_PART_DEFS.map((def) => {
            const coords = POSITIONS[side][def.key];
            if (!coords) return null;

            const isSelected = selectedPart === def.key;
            const metricInfo = KEY_TO_DB_METRIC_MAP[def.key];
            const value = measurementData ? measurementData[metricInfo.key] : null;
            const displayValue = value ? `${value}${metricInfo.unit}` : '-';

            const modelOffsetX = (svgTotalWidth - modelWidth) / 2;
            const anchorX = (coords.left / 100) * modelWidth + modelOffsetX;
            const anchorY = (coords.top / 100) * modelHeight;
            const isLeft = coords.left < 50;
            const labelWidth = 65;
            const labelHeight = isHistory ? 22 : 40; // Smaller label for history
            const offsetY = (coords.offsetY || 0) * (modelWidth / 200); // Scale offset
            const pathData = `M ${anchorX} ${anchorY} C ${anchorX + (isLeft ? -40 : 40)} ${anchorY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? 40 : -40)} ${anchorY + offsetY}, ${(isLeft ? 5 : svgTotalWidth - 5 - labelWidth) + (isLeft ? labelWidth : 0)} ${anchorY + offsetY}`;

            return (
              <g key={def.key} onClick={() => onPartClick?.(def.key)} className={onPartClick ? 'cursor-pointer' : 'pointer-events-none'}>
                <path d={pathData} stroke={isSelected ? '#0ea5e9' : 'hsl(var(--primary))'} strokeWidth={isSelected ? 2 : 1.5} fill="none" />
                <foreignObject x={isLeft ? 5 : svgTotalWidth - 5 - labelWidth} y={anchorY + offsetY - labelHeight / 2} width={labelWidth} height={labelHeight} style={{ overflow: 'visible' }}>
                  <div className={cn("flex flex-col items-center justify-center bg-background/80 border rounded-md px-1 py-0.5 text-center shadow-sm text-foreground", isSelected && "border-sky-500")}>
                    <span className="text-[9px] font-semibold">{def.label}</span>
                    {!isHistory && <span className="text-sm font-bold text-primary">{displayValue}</span>}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}