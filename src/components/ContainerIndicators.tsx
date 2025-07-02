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

// CATEGORY AND DISPLAY NAME MAPPINGS
const INDICATOR_CATEGORY_MAP: Record<string, 'Sentiment' | 'Damages' | 'Elements' | 'Requests' | 'Misc'> = {
  // Example mappings, extend as needed
  water: 'Requests',
  money: 'Requests',
  injury: 'Damages',
  fire: 'Elements',
  sentiment: 'Sentiment',
};

const INDICATOR_DISPLAY_NAME_MAP: Record<string, string> = {
  water: 'Water Needed',
  money: 'Money',
  injury: 'Injury',
  fire: 'Fire',
  sentiment: 'Overall Sentiment',
};

// Color map for categories
const CATEGORY_COLOR_MAP: Record<string, string> = {
  Sentiment: 'text-yellow-400',
  Damages: 'text-red-400',
  Elements: 'text-blue-400',
  Requests: 'text-green-400',
  Misc: 'text-gray-400',
};

const CATEGORY_BAR_COLOR_MAP: Record<string, string> = {
  Sentiment: 'rgba(251, 191, 36, 0.7)', // yellow
  Damages: 'rgba(248, 113, 113, 0.7)', // red
  Elements: 'rgba(96, 165, 250, 0.7)', // blue
  Requests: 'rgba(74, 222, 128, 0.7)', // green
  Misc: 'rgba(156, 163, 175, 0.7)', // gray
};

// Category list for filter bar
const CATEGORY_LIST = ['Sentiment', 'Damages', 'Elements', 'Requests', 'Misc'] as const;
type CategoryType = typeof CATEGORY_LIST[number];

export default function ContainerRequests({ predictions }: ContainerRequestsProps) {
    // Filter state: all categories enabled by default
    const [enabledCategories, setEnabledCategories] = useState<CategoryType[]>([...CATEGORY_LIST]);

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

    // Filtering logic: only show indicators in enabled categories
    const filteredBreakdown = useMemo(() => {
        return Object.fromEntries(
            Object.entries(breakdown).filter(([k]) => {
                const cat = INDICATOR_CATEGORY_MAP[k] || 'Misc';
                return enabledCategories.includes(cat as CategoryType);
            })
        );
    }, [breakdown, enabledCategories]);

    // Prepare data for bar chart (top 10 indicators)
    const sortedIndicators = Object.entries(filteredBreakdown)
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
    // Bar chart: color each bar by category
    const barData = {
      labels: pagedIndicators.map(([k]) => INDICATOR_DISPLAY_NAME_MAP[k] || k.replace(/_/g, ' ')),
      datasets: [
        {
          label: 'Count',
          data: pagedIndicators.map(([, v]) => v),
          backgroundColor: pagedIndicators.map(([k]) => CATEGORY_BAR_COLOR_MAP[INDICATOR_CATEGORY_MAP[k] || 'Misc']),
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
                <div className="mb-2 flex justify-center w-full">
                    <div className="w-full max-w-2xl mx-auto flex flex-wrap justify-center gap-2 items-center bg-gradient-to-br from-black/60 to-black/30 rounded-lg shadow-md border border-neutral-800 py-2 px-3">
                        {CATEGORY_LIST.map(cat => {
                            const enabled = enabledCategories.includes(cat);
                            // Translucent pill bg per category
                            const pillBg = enabled
                                ? {
                                    Sentiment: 'bg-yellow-400/20 border-yellow-400/40',
                                    Damages: 'bg-red-400/20 border-red-400/40',
                                    Elements: 'bg-blue-400/20 border-blue-400/40',
                                    Requests: 'bg-green-400/20 border-green-400/40',
                                    Misc: 'bg-gray-400/20 border-gray-400/40',
                                  }[cat]
                                : 'bg-neutral-800 border-neutral-700 opacity-50';
                            return (
                                <span
                                    key={cat}
                                    className={`flex items-center px-3 py-1 rounded-full font-semibold text-xs cursor-pointer select-none border transition-all
                                        ${CATEGORY_COLOR_MAP[cat]} ${pillBg}
                                        ${enabled ? 'hover:bg-white/30 hover:scale-105' : 'hover:opacity-80'}
                                    `}
                                    onClick={() => {
                                        if (enabled) {
                                            setEnabledCategories(enabledCategories.filter(c => c !== cat));
                                        } else {
                                            setEnabledCategories([...enabledCategories, cat]);
                                        }
                                    }}
                                >
                                    {cat}
                                    {enabled && (
                                        <span className="ml-2 text-xs font-bold text-gray-300 hover:text-red-400" onClick={e => { e.stopPropagation(); setEnabledCategories(enabledCategories.filter(c => c !== cat)); }}>&times;</span>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                </div>
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
                        <table className="w-full text-sm text-gray-300">
                            <thead className="sticky top-0 bg-black/70 z-10">
                                <tr>
                                    <th className="text-left py-2 px-2">Indicator</th>
                                    <th className="text-right py-2 px-2">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedIndicators.map(([k, v]) => {
                                  const category = INDICATOR_CATEGORY_MAP[k] || 'Misc';
                                  const displayName = INDICATOR_DISPLAY_NAME_MAP[k] || k.replace(/_/g, ' ');
                                  const colorClass = CATEGORY_COLOR_MAP[category];
                                  return (
                                    <tr key={k} className="hover:bg-neutral-800 border-b border-neutral-800 transition-colors">
                                        <td className={`py-1 px-2 capitalize font-semibold ${colorClass}`}>{displayName}</td>
                                        <td className="text-right py-1 px-2 font-mono">{v}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}