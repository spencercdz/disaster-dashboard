'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

// Define types for sentiment data
interface SentimentDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  overall: number;
}

export default function Chart() {
  // Mock sentiment data over time
  const [sentimentData] = useState<SentimentDataPoint[]>([
    { date: 'Jun 10', positive: 35, neutral: 40, negative: 25, overall: 0.1 },
    { date: 'Jun 11', positive: 30, neutral: 45, negative: 25, overall: 0.05 },
    { date: 'Jun 12', positive: 25, neutral: 45, negative: 30, overall: -0.05 },
    { date: 'Jun 13', positive: 20, neutral: 40, negative: 40, overall: -0.2 },
    { date: 'Jun 14', positive: 15, neutral: 35, negative: 50, overall: -0.35 },
    { date: 'Jun 15', positive: 10, neutral: 30, negative: 60, overall: -0.5 },
    { date: 'Jun 16', positive: 15, neutral: 35, negative: 50, overall: -0.35 },
    { date: 'Jun 17', positive: 20, neutral: 40, negative: 40, overall: -0.2 },
    { date: 'Jun 18', positive: 25, neutral: 45, negative: 30, overall: -0.05 },
    { date: 'Jun 19', positive: 30, neutral: 45, negative: 25, overall: 0.05 },
    { date: 'Jun 20', positive: 35, neutral: 40, negative: 25, overall: 0.1 },
  ]);

  // State for chart type
  const [chartType, setChartType] = useState<'sentiment' | 'breakdown'>('sentiment');

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: chartType === 'breakdown',
        min: chartType === 'sentiment' ? -1 : undefined,
        max: chartType === 'sentiment' ? 1 : undefined,
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
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (chartType === 'sentiment') {
              return `${label}: ${value.toFixed(2)}`;
            } else {
              return `${label}: ${value}%`;
            }
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
        <p>Sentiment trend for Myanmar flood disaster over the past 10 days</p>
      </div>
    </div>
  );
}