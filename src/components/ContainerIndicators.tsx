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
import {
  getIndicatorBreakdown,
  INDICATOR_CATEGORY_MAP,
  CATEGORY_LIST,
  CategoryType,
  getDisplayNameForIndicator,
  getCategoryColor,
  prepareBarChartData
} from '../app/lib/analytics';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ContainerIndicatorsProps {
  predictions: Prediction[];
  activeIndicatorFilters: string[];
  setActiveIndicatorFilters: (filters: string[]) => void;
}

export default function ContainerIndicators({ predictions, activeIndicatorFilters, setActiveIndicatorFilters }: ContainerIndicatorsProps) {
    // Filter state: all categories enabled by default
    const [enabledCategories, setEnabledCategories] = useState<CategoryType[]>([...CATEGORY_LIST]);

    // Memoized computation of request/disaster/damage breakdown
    const indicatorKeys = Object.keys(INDICATOR_CATEGORY_MAP).filter(key => !key.startsWith('sentiment_') && !key.startsWith('genre_'));
    const genreKeys = ['genre_social', 'genre_news', 'genre_direct'];
    const breakdown = useMemo(() => getIndicatorBreakdown(predictions, indicatorKeys, genreKeys), [predictions]);

    // Filtering logic: only show indicators in enabled categories
    const filteredBreakdown = useMemo(() => {
        return Object.fromEntries(
            Object.entries(breakdown).filter(([k]) => {
                const cat = INDICATOR_CATEGORY_MAP[k] || 'Miscellaneous';
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
    const barData = prepareBarChartData(pagedIndicators);
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
                <h1 className="text-1xl font-bold mb-2">Indicator Analytics</h1>
            </div>
            <div className="flex-1 flex flex-col space-y-3 pr-1 overflow-hidden">

                <div className="mb-2 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-md font-semibold">Count Overview</span>
                        <div className="flex space-x-2">
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-white border border-neutral-500 hover:bg-neutral-600 hover:text-white shadow transition-colors duration-150 focus:outline-none disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={safePage === 0}
                                aria-label="Previous"
                                title="Previous"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5 15L8 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-white border border-neutral-500 hover:bg-neutral-600 hover:text-white shadow transition-colors duration-150 focus:outline-none disabled:opacity-50"
                                onClick={() => setPage(p => Math.min(lastNonZeroPage, p + 1))}
                                disabled={safePage >= lastNonZeroPage}
                                aria-label="Next"
                                title="Next"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5L12.5 10L8 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <Bar data={barData} options={barOptions} />
                </div>

                <div className="mb-2 w-full">
                    <div className="flex flex-nowrap justify-between items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md">
                        <div className="flex flex-nowrap gap-2">
                            {CATEGORY_LIST.map(cat => {
                                const enabled = enabledCategories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            if (enabled) {
                                                setEnabledCategories(enabledCategories.filter(c => c !== cat));
                                            } else {
                                                setEnabledCategories([...enabledCategories, cat]);
                                            }
                                        }}
                                        className={`flex-grow px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out whitespace-nowrap
                                            ${enabled
                                                ? `${cat === 'Sentiment' ? 'bg-blue-700' : cat === 'Damages' ? 'bg-orange-700' : cat === 'Elements' ? 'bg-indigo-700' : cat === 'Requests' ? 'bg-cyan-700' : 'bg-purple-700'} text-white shadow-md`
                                                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/80'
                                            }
                                        `}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex-none flex items-center gap-2">
                            <div className="h-4 border-l border-neutral-600"></div>
                            <button
                                onClick={() => setEnabledCategories([...CATEGORY_LIST])}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                            >
                                All
                            </button>
                            <button
                                onClick={() => setEnabledCategories([])}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                            >
                                None
                            </button>
                        </div>
                    </div>
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
                                  const displayName = getDisplayNameForIndicator(k);
                                  const isActive = activeIndicatorFilters.includes(k);
                                  return (
                                    <tr key={k} className="hover:bg-neutral-800 border-b border-neutral-800 transition-colors">
                                        <td className={`py-1 px-2 capitalize font-semibold flex items-center gap-2`}>
                                            <span className={`${getCategoryColor(k)} font-semibold`}>{displayName}</span>
                                            <button
                                                className={`w-4 h-4 flex items-center justify-center rounded-full border shadow transition-colors duration-150 focus:outline-none
                                                    ${isActive ? 'bg-neutral-600 text-white border-neutral-400' : 'bg-neutral-800 text-white border-neutral-500 hover:bg-neutral-600 hover:text-white hover:border-neutral-400'}
                                                `}
                                                onClick={() => {
                                                    if (isActive) {
                                                        setActiveIndicatorFilters(activeIndicatorFilters.filter(f => f !== k));
                                                    } else {
                                                        setActiveIndicatorFilters([...activeIndicatorFilters, k]);
                                                    }
                                                }}
                                                title={isActive ? 'Remove filter' : 'Add filter'}
                                                aria-label={isActive ? 'Remove filter' : 'Add filter'}
                                            >
                                                {isActive ? (
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect x="2" y="4.25" width="6" height="1.5" rx="0.75" fill="white" />
                                                    </svg>
                                                ) : (
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect x="2" y="4.25" width="6" height="1.5" rx="0.75" fill="white" />
                                                        <rect x="4.25" y="2" width="1.5" height="6" rx="0.75" fill="white" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
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