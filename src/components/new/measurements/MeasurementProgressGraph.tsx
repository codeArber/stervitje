// FILE: src/components/measurements/measurement-progress-graph.tsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';

import { getMeasurementImageUrl } from '@/types/storage';
import type { Tables } from '@/types/database.types'; // Your database types

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MeasurementProgressGraphProps {
  measurements: Tables<'user_measurements'>[];
  selectedMetricKeys: string[]; // <--- NEW PROP: Keys of metrics to display
}

// Define the full configuration for all possible datasets
const ALL_DATASETS_CONFIG = [
  { key: 'weight_kg', label: 'Weight (kg)', borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' },
  { key: 'height_cm', label: 'Height (cm)', borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.5)' },
  { key: 'body_fat_percentage', label: 'Body Fat (%)', borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)', photoKey: 'body_fat_photo_url' },
  { key: 'resting_heart_rate', label: 'Resting HR (bpm)', borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' },
  { key: 'biceps_left_cm', label: 'Biceps Left (cm)', borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', photoKey: 'biceps_left_photo_url' },
  { key: 'biceps_right_cm', label: 'Biceps Right (cm)', borderColor: 'rgb(53, 235, 162)', backgroundColor: 'rgba(53, 235, 162, 0.5)', photoKey: 'biceps_right_photo_url' },
  { key: 'waist_cm', label: 'Waist (cm)', borderColor: 'rgb(255, 205, 86)', backgroundColor: 'rgba(255, 205, 86, 0.5)', photoKey: 'waist_photo_url' },
  { key: 'chest_cm', label: 'Chest (cm)', borderColor: 'rgb(100, 100, 100)', backgroundColor: 'rgba(100, 100, 100, 0.5)', photoKey: 'chest_photo_url' },
  { key: 'thigh_left_cm', label: 'Thigh Left (cm)', borderColor: 'rgb(201, 203, 207)', backgroundColor: 'rgba(201, 203, 207, 0.5)', photoKey: 'thigh_left_photo_url' },
  { key: 'thigh_right_cm', label: 'Thigh Right (cm)', borderColor: 'rgb(100, 203, 207)', backgroundColor: 'rgba(100, 203, 207, 0.5)', photoKey: 'thigh_right_photo_url' },
  { key: 'calf_left_cm', label: 'Calf Left (cm)', borderColor: 'rgb(75, 100, 192)', backgroundColor: 'rgba(75, 100, 192, 0.5)', photoKey: 'calf_left_photo_url' },
  { key: 'calf_right_cm', label: 'Calf Right (cm)', borderColor: 'rgb(192, 75, 100)', backgroundColor: 'rgba(192, 75, 100, 0.5)', photoKey: 'calf_right_photo_url' },
  { key: 'hips_cm', label: 'Hips (cm)', borderColor: 'rgb(235, 53, 162)', backgroundColor: 'rgba(235, 53, 162, 0.5)', photoKey: 'hips_photo_url' },
  { key: 'forearm_left_cm', label: 'Forearm Left (cm)', borderColor: 'rgb(162, 235, 53)', backgroundColor: 'rgba(162, 235, 53, 0.5)', photoKey: 'forearm_left_photo_url' },
  { key: 'forearm_right_cm', label: 'Forearm Right (cm)', borderColor: 'rgb(86, 205, 255)', backgroundColor: 'rgba(86, 205, 255, 0.5)', photoKey: 'forearm_right_photo_url' },
];

export const MeasurementProgressGraph: React.FC<MeasurementProgressGraphProps> = ({ measurements, selectedMetricKeys }) => {
  const validMeasurements = measurements || [];
  const sortedMeasurements = [...validMeasurements].sort((a, b) =>
    dayjs(a.measurement_date).valueOf() - dayjs(b.measurement_date).valueOf()
  );

  const labels = sortedMeasurements.map(m => dayjs(m.measurement_date).format('MMM D, YY'));

  const prepareMetricData = (
    metricKey: keyof Tables<'user_measurements'>,
    photoKey?: keyof Tables<'user_measurements'>
  ) => {
    const data = sortedMeasurements.map(m => m[metricKey] as number | null);
    const pointStyles: (HTMLImageElement | string)[] = [];
    
    if (photoKey) {
      sortedMeasurements.forEach(m => {
        const imageUrl = m[photoKey] as string | null | undefined;
        if (imageUrl) {
          const img = new Image(30, 30);
          img.src = getMeasurementImageUrl(imageUrl);
          pointStyles.push(img);
        } else {
          pointStyles.push('circle');
        }
      });
    }

    return {
      data,
      pointStyles: photoKey ? pointStyles : 'circle',
    };
  };

  // Filter datasets based on selectedMetricKeys. If no keys are selected, show all.
  const filteredDatasetsConfig = selectedMetricKeys.length > 0
    ? ALL_DATASETS_CONFIG.filter(config => selectedMetricKeys.includes(config.key))
    : ALL_DATASETS_CONFIG; // Default to all if nothing is selected

  const chartDatasets = filteredDatasetsConfig
    .map(config => {
      const { data, pointStyles } = prepareMetricData(config.key, config.photoKey);
      
      if (data.some(val => val !== null && val !== undefined)) {
        return {
          label: config.label,
          data: data,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          tension: 0.3,
          pointStyle: pointStyles,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: false,
        };
      }
      return null;
    })
    .filter(Boolean);

  const chartData = {
    labels,
    datasets: chartDatasets as any[],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Body Measurement Progress Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Value',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  if (validMeasurements.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No measurements available to generate a graph. Add your first measurement to see your trends!
      </div>
    );
  }
  
  if (chartDatasets.length === 0) {
    return (
        <div className="text-muted-foreground text-center py-8">
            No selected measurements have data to display in the graph.
            <br />Please select metrics using the filter options above.
        </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};