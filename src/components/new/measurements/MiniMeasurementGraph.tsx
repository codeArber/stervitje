// FILE: src/components/profile/mini-measurement-graph.tsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip, // Only Tooltip, no Legend or Title needed for mini graph
} from 'chart.js';
import dayjs from 'dayjs';

import type { Tables } from '@/types/database.types'; // Your database types

// Register only the necessary Chart.js components for a mini graph
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface MiniMeasurementGraphProps {
  measurements: Tables<'user_measurements'>[];
}

export const MiniMeasurementGraph: React.FC<MiniMeasurementGraphProps> = ({ measurements }) => {
  const validMeasurements = measurements || [];

  // Filter for only 'weight_kg' data points that are not null, and sort by date
  const weightDataPoints = validMeasurements
    .filter(m => m.weight_kg !== null && m.weight_kg !== undefined)
    .sort((a, b) => dayjs(a.measurement_date).valueOf() - dayjs(b.measurement_date).valueOf());

  if (weightDataPoints.length < 2) { // Need at least two points to draw a line
    return (
      <div className="text-muted-foreground text-xs text-center py-2">
        Need at least 2 weight entries for graph.
      </div>
    );
  }

  const labels = weightDataPoints.map(m => dayjs(m.measurement_date).format('MMM YY'));
  const data = weightDataPoints.map(m => m.weight_kg);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Weight',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4, // Smooth line
        pointRadius: 3, // Smaller points
        pointHoverRadius: 5,
        fill: true, // Fill area under the line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // No legend for mini graph
      },
      title: {
        display: false, // No title for mini graph
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: () => '', // No title in tooltip for mini graph
          label: function(context: any) {
            return `${context.parsed.y} kg`; // Only show weight value
          },
        },
      },
    },
    scales: {
      x: {
        display: false, // No x-axis labels for mini graph
        grid: {
          display: false,
        },
      },
      y: {
        display: false, // No y-axis labels for mini graph
        grid: {
          display: false,
        },
        beginAtZero: false,
      },
    },
    elements: {
      line: {
        borderWidth: 2, // Thicker line
      },
      point: {
        hitRadius: 10, // Easier to hit points on touch devices
      },
    },
  };

  return (
    <div className="relative h-[100px] w-full"> {/* Fixed height for the mini graph */}
      <Line data={chartData} options={options} />
    </div>
  );
};