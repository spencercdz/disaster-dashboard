'use client';

import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Prediction } from '../app/types/prediction';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ContainerRequestsProps {
  predictions: Prediction[];
}

export default function ContainerRequests({ predictions }: ContainerRequestsProps) {
    // Memoized computation of request/disaster/damage breakdown
    const breakdown = useMemo(() => {
        if (!predictions || predictions.length === 0) return {};
        // Exclude non-indicator fields and all confidence fields
        const exclude = ['tweet_id', 'sentiment', 'verified', 'username', 'date', 'retweets', 'tweet'];
        const keys = Object.keys(predictions[0]).filter(k => !exclude.includes(k) && !k.endsWith('_confidence'));
        const counts: Record<string, number> = {};
        keys.forEach(key => { counts[key] = 0; });
        predictions.forEach(p => {
            keys.forEach(key => {
                if (p[key] === 'yes') counts[key]++;
            });
        });
        return counts;
    }, [predictions]);

    // Prepare data for bar chart (top 10 indicators)
    const sortedIndicators = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1]);

    // Pagination state for bar chart
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const totalPages = Math.ceil(sortedIndicators.length / pageSize);
    // Find the last page where the first indicator has a count > 0
    let lastNonZeroPage = 0;
    for (let i = 0; i < totalPages; i++) {
      const idx = i * pageSize;
      if (sortedIndicators[idx] && sortedIndicators[idx][1] > 0) {
        lastNonZeroPage = i;
      } else {
        break;
      }
    }
    // Clamp page to lastNonZeroPage
    const safePage = Math.min(page, lastNonZeroPage);
    const pagedIndicators = sortedIndicators.slice(safePage * pageSize, (safePage + 1) * pageSize);
    const barData = {
      labels: pagedIndicators.map(([k]) => k.replace(/_/g, ' ')),
      datasets: [
        {
          label: 'Count',
          data: pagedIndicators.map(([, v]) => v),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
      ],
    };
    const barOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: '' },
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#fff' } },
        x: { ticks: { color: '#fff' } },
      },
    };

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2 flex justify-between items-center">
                <h1 className="text-1xl font-bold mb-2">Indicator Breakdown</h1>
            </div>
            <div className="flex-1 flex flex-col space-y-3 pr-1 overflow-hidden">
                <div className="mb-2 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-md font-semibold">Indicator Chart</span>
                        <div className="flex space-x-2">
                            <button
                                className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={safePage === 0}
                                aria-label="Previous"
                            >
                                &#8592;
                            </button>
                            <button
                                className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                                onClick={() => setPage(p => Math.min(lastNonZeroPage, p + 1))}
                                disabled={safePage >= lastNonZeroPage}
                                aria-label="Next"
                            >
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <Bar data={barData} options={barOptions} />
                </div>
                <div className="flex-1 flex flex-col rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-3 min-h-0">
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <table className="w-full text-xs text-gray-300">
                            <thead className="sticky top-0 bg-black/70 z-10">
                                <tr>
                                    <th className="text-left py-2 px-2">Indicator</th>
                                    <th className="text-right py-2 px-2">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedIndicators.map(([k, v]) => (
                                    <tr key={k} className="hover:bg-neutral-800 border-b border-neutral-800 transition-colors">
                                        <td className="py-1 px-2 capitalize">{k.replace(/_/g, ' ')}</td>
                                        <td className="text-right py-1 px-2 font-mono">{v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}