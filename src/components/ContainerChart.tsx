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
  const sentimentData = useMemo(() => {
    if (!predictions || predictions.length === 0) return [];
    // Group by date (YYYY-MM-DD) using tweet time from tweets table
    const byDate: Record<string, Prediction[]> = {};
    predictions.forEach(p => {
      const tweetTime = tweetTimeMap[p.tweet_id];
      if (!tweetTime || typeof tweetTime !== 'string') return;
      // Use only the date part (YYYY-MM-DD)
      let date = tweetTime.split('T')[0];
      if (!date || date.length !== 10) {
        // Try custom format: 2025-03-28_06-57-53
        const match = tweetTime.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) date = `${match[1]}-${match[2]}-${match[3]}`;
        else date = 'unknown';
      }
      // Convert sentiment to number
      const sentiment = typeof p.sentiment === 'string' ? parseFloat(p.sentiment) : p.sentiment;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push({ ...p, sentiment });
    });
    // For each day, compute the average sentiment and breakdown
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, preds]) => {
        const total = preds.length;
        const sum = preds.reduce((acc, p) => acc + (typeof p.sentiment === 'number' ? p.sentiment : 50), 0);
        const overall = sum / total;
        let positive = 0, neutral = 0, negative = 0;
        preds.forEach(p => {
          const s = typeof p.sentiment === 'string' ? parseFloat(p.sentiment) : p.sentiment;
          if (s >= 60) positive++;
          else if (s >= 40) neutral++;
          else negative++;
        });
        return {
          date,
          positive: Math.round((positive / total) * 100),
          neutral: Math.round((neutral / total) * 100),
          negative: Math.round((negative / total) * 100),
          overall,
        };
      });
  }, [predictions, tweetTimeMap]);

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
  const sentimentChartData = {
    labels: sentimentData.map(d => d.date),
    datasets: [
      {
        label: 'Overall Sentiment',
        data: sentimentData.map(d => d.overall),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
        fill: false,
      },
    ],
  };

  // Prepare data for sentiment breakdown chart
  const breakdownChartData = {
    labels: sentimentData.map(d => d.date),
    datasets: [
      {
        label: 'Positive',
        data: sentimentData.map(d => d.positive),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Neutral',
        data: sentimentData.map(d => d.neutral),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Negative',
        data: sentimentData.map(d => d.negative),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

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