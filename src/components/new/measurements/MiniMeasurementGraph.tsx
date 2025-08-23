// FILE: src/components/profile/mini-measurement-graph.tsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler, // Import Filler for the background color
} from 'chart.js';
import dayjs from 'dayjs';
import type { Tables } from '@/types/database.types';

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface MiniMeasurementGraphProps {
  measurements: Tables<'user_measurements'>[];
  // NEW: Props to make the graph dynamic
  metricKey: keyof Tables<'user_measurements'>; // The key in your database table (e.g., 'waist_cm')
  metricLabel: string; // The display name (e.g., 'Waist')
  metricUnit: string;  // The unit (e.g., 'cm' or 'kg')
}

export const MiniMeasurementGraph: React.FC<MiniMeasurementGraphProps> = ({ 
  measurements, 
  metricKey, 
  metricLabel,
  metricUnit
}) => {
  const validMeasurements = measurements || [];

  // UPDATED: Filter for the selected metric that is not null, and sort by date
  const dataPoints = validMeasurements
    .filter(m => m[metricKey] !== null && m[metricKey] !== undefined)
    .sort((a, b) => dayjs(a.measurement_date).valueOf() - dayjs(b.measurement_date).valueOf());

  // UPDATED: Show a generic message if not enough data
  if (dataPoints.length < 2) {
    return (
      <div className="text-muted-foreground text-xs text-center py-2">
        Need at least 2 entries for {metricLabel} to graph.
      </div>
    );
  }

  const labels = dataPoints.map(m => dayjs(m.measurement_date).format('MMM YY'));
  // UPDATED: Map the data from the dynamic metricKey
  const data = dataPoints.map(m => m[metricKey] as number);

  const chartData = {
    labels,
    datasets: [
      {
        label: metricLabel, // Use the dynamic label
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Adjusted for better visuals
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: () => '',
          // UPDATED: Show the dynamic value and unit in the tooltip
          label: function(context: any) {
            return `${context.parsed.y} ${metricUnit}`;
          },
        },
      },
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { display: false, grid: { display: false }, beginAtZero: false },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { hitRadius: 10 },
    },
  };

  return (
    <div className="relative h-[100px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};