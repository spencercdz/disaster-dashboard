'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Prediction } from '../app/types/prediction';
import { getPerDaySentiment, prepareLineChartData } from '../app/lib/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ContainerChartProps {
  predictions: Prediction[];
  tweets: { tweet_id: string; time: string }[];
}

export default function ContainerChart({ predictions, tweets }: ContainerChartProps) {
  // Build a lookup for tweet_id -> time
  const tweetTimeMap = useMemo(() => {
    const map: Record<string, string> = {};
    tweets.forEach(t => { map[t.tweet_id] = t.time; });
    return map;
  }, [tweets]);

  // Memoized computation of per-day sentiment analytics
  const sentimentData = useMemo(() => getPerDaySentiment(predictions, tweetTimeMap), [predictions, tweetTimeMap]);

  // State for chart type
  const [chartType, setChartType] = useState<'sentiment' | 'breakdown'>('breakdown');

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(tooltipItem: TooltipItem<'line'>) {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            if (typeof value === 'number') {
              return `${label}: ${value.toFixed(1)}`;
            }
            return label;
          },
        },
      },
    },
  };

  // Prepare data for sentiment chart
  const sentimentChartData = prepareLineChartData(sentimentData, 'sentiment');

  // Prepare data for sentiment breakdown chart
  const breakdownChartData = prepareLineChartData(sentimentData, 'breakdown');

  return (
    <div className="flex container-default flex-col h-full">
      <div className="mb-2 flex justify-between items-center">
        <h1 className="text-1xl font-bold">Sentiment Chart</h1>
        <div className="flex space-x-2">
          <button 
            className={`text-xs px-3 py-1 rounded ${chartType === 'sentiment' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setChartType('sentiment')}
          >
            Overall
          </button>
          <button 
            className={`text-xs px-3 py-1 rounded ${chartType === 'breakdown' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setChartType('breakdown')}
          >
            Breakdown
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <Line 
          options={options} 
          data={chartType === 'sentiment' ? sentimentChartData : breakdownChartData} 
          className="h-full"
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        <p>Comprehensive Chart Analysis Over Time</p>
      </div>
    </div>
  );
}