// FILE: src/components/new/measurements/MeasurementHistoryDiagram.tsx

import React from 'react';
import { Card } from '@/components/ui/card';
import { BodyDiagramDisplay, CHARACTERISTIC_DEFS, KEY_TO_DB_METRIC_MAP } from './BodyDiagramDisplay';
import type { Tables } from '@/types/database.types';

interface MeasurementHistoryDiagramProps {
  measurement: Tables<'user_measurements'>;
}

export function MeasurementHistoryDiagram({ measurement }: MeasurementHistoryDiagramProps) {
  return (
    <Card className="w-full h-fit p-6">
      <div className="flex items-center gap-4">
        {/* Front View */}
        <BodyDiagramDisplay 
          side="anterior" 
          measurementData={measurement} 
          modelWidth={125}
          isHistory={true}
        />
        {/* Back View */}
        <BodyDiagramDisplay 
          side="posterior" 
          measurementData={measurement} 
          modelWidth={125}
          isHistory={true}
        />
        {/* Characteristics Column */}
        <div className="flex flex-col justify-center gap-y-2 w-24 self-stretch border-l pl-4">
          {CHARACTERISTIC_DEFS.map(def => {
            const metricInfo = KEY_TO_DB_METRIC_MAP[def.key];
            const value = measurement ? measurement[metricInfo.key] : null;
            const displayValue = value ? `${value}${metricInfo.unit}` : '-';
            return (
              <div key={def.key} className="flex flex-col items-center justify-center w-full bg-background/80 border rounded-md px-2 py-1 text-center shadow-sm text-foreground">
                <span className="text-[10px] font-semibold">{def.label}</span>
                <span className="text-sm font-bold text-primary">{displayValue}</span>
              </div>
            )
          })}
        </div>
        <div className='flex flex-col justify-center gap-y-2 w-24 self-stretch border-l pl-4'>
          hey
        </div>
      </div>
    </Card>
  );
}