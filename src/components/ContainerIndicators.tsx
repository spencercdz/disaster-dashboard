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
const INDICATOR_CATEGORY_MAP: Record<string, 'Sentiment' | 'Damages' | 'Elements' | 'Requests' | 'Miscellaneous'> = {
  sentiment_positive: 'Sentiment',
  sentiment_neutral: 'Sentiment',
  sentiment_negative: 'Sentiment',
  request: 'Requests',
  offer: 'Requests',
  aid_related: 'Miscellaneous',
  medical_help: 'Requests',
  medical_products: 'Requests',
  search_and_rescue: 'Miscellaneous',
  security: 'Miscellaneous',
  military: 'Miscellaneous',
  child_alone: 'Damages',
  water: 'Requests',
  food: 'Requests',
  shelter: 'Requests',
  clothing: 'Requests',
  money: 'Requests',
  missing_people: 'Miscellaneous',
  refugees: 'Miscellaneous',
  death: 'Damages',
  other_aid: 'Miscellaneous',
  infrastructure_related: 'Damages',
  transport: 'Damages',
  buildings: 'Damages',
  electricity: 'Damages',
  tools: 'Requests',
  hospitals: 'Damages',
  shops: 'Damages',
  aid_centers: 'Requests',
  other_infrastructure: 'Damages',
  weather_related: 'Elements',
  floods: 'Elements',
  storm: 'Elements',
  fire: 'Elements',
  earthquake: 'Elements',
  cold: 'Elements',
  other_weather: 'Elements',
  direct_report: 'Miscellaneous',
  genre_social: 'Miscellaneous',
  genre_news: 'Miscellaneous',
  genre_direct: 'Miscellaneous',
  related: 'Miscellaneous'
};

const INDICATOR_DISPLAY_NAME_MAP: Record<string, string> = {
  sentiment_positive: 'Positive',
  sentiment_neutral: 'Neutral',
  sentiment_negative: 'Negative',
  genre_social: 'Social Media',
  genre_news: 'News',
  genre_direct: 'Direct Message',
  request: 'General Request',
  offer: 'General Offer',
  aid_related: 'Aid Related',
  medical_help: 'Medical Help',
  medical_products: 'Medical Products',
  search_and_rescue: 'Search and Rescue',
  security: 'Security',
  military: 'Military',
  child_alone: 'Child Alone',
  water: 'Water',
  food: 'Food',
  shelter: 'Shelter',
  clothing: 'Clothing',
  money: 'Money',
  missing_people: 'Missing People',
  refugees: 'Refugees',
  death: 'Death',
  other_aid: 'Other Aid',
  infrastructure_related: 'Infrastructure',
  transport: 'Transport',
  buildings: 'Buildings',
  electricity: 'Electricity',
  tools: 'Tools',
  hospitals: 'Hospitals',
  shops: 'Shops',
  aid_centers: 'Aid Centers',
  other_infrastructure: 'Other Infrastructure',
  weather_related: 'Weather Related',
  floods: 'Floods',
  storm: 'Storm',
  fire: 'Fire',
  earthquake: 'Earthquake',
  cold: 'Cold',
  other_weather: 'Other Weather',
  direct_report: 'Direct Report',
  related: 'Related'
};

// Color map for categories
const CATEGORY_COLOR_MAP: Record<string, string> = {
  Sentiment: 'text-blue-400',
  Damages: 'text-red-400',
  Elements: 'text-yellow-400',
  Requests: 'text-green-400',
  Miscellaneous: 'text-purple-400',
};

const CATEGORY_BAR_COLOR_MAP: Record<string, string> = {
  Sentiment: 'rgba(96, 165, 250, 0.7)',
  Damages: 'rgba(248, 113, 113, 0.7)',
  Elements: 'rgba(251, 191, 36, 0.7)',
  Requests: 'rgba(74, 222, 128, 0.7)',
  Miscellaneous: 'rgba(192, 132, 252, 0.7)', // purple
};

// Category list for filter bar
const CATEGORY_LIST = ['Sentiment', 'Damages', 'Elements', 'Requests', 'Miscellaneous'] as const;
type CategoryType = typeof CATEGORY_LIST[number];

export default function ContainerRequests({ predictions }: ContainerRequestsProps) {
    // Filter state: all categories enabled by default
    const [enabledCategories, setEnabledCategories] = useState<CategoryType[]>([...CATEGORY_LIST]);

    // Memoized computation of request/disaster/damage breakdown
    const breakdown = useMemo(() => {
        if (!predictions || predictions.length === 0) return {};
        
        // Initialize counts for all indicators from our map
        const counts: Record<string, number> = {};
        Object.keys(INDICATOR_CATEGORY_MAP).forEach(key => {
            counts[key] = 0;
        });

        // Get the keys for binary indicators from the map
        const binaryIndicatorKeys = Object.keys(INDICATOR_CATEGORY_MAP).filter(
            key => !key.startsWith('sentiment_') && !key.startsWith('genre_')
        );

        predictions.forEach(p => {
            // Tally binary indicators
            binaryIndicatorKeys.forEach(key => {
                if (p[key] === 'yes') {
                    counts[key]++;
                }
            });

            // Tally genre
            if (p.genre === 'social') counts.genre_social++;
            else if (p.genre === 'news') counts.genre_news++;
            else if (p.genre === 'direct') counts.genre_direct++;

            // Tally sentiment using numeric thresholds (like ContainerSentiment)
            let s = 50;
            if (typeof p.sentiment === 'string') {
                const parsed = parseFloat(p.sentiment);
                if (!isNaN(parsed)) s = parsed;
            } else if (typeof p.sentiment === 'number') {
                s = p.sentiment;
            }
            if (s >= 60) counts.sentiment_positive++;
            else if (s >= 40) counts.sentiment_neutral++;
            else counts.sentiment_negative++;
        });

        return counts;
    }, [predictions]);

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
    const barData = {
      labels: pagedIndicators.map(([k]) => INDICATOR_DISPLAY_NAME_MAP[k] || k.replace(/_/g, ' ')),
      datasets: [
        {
          label: 'Count',
          data: pagedIndicators.map(([, v]) => v),
          backgroundColor: pagedIndicators.map(([k]) => CATEGORY_BAR_COLOR_MAP[INDICATOR_CATEGORY_MAP[k] || 'Miscellaneous']),
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
                        <span className="text-md font-semibold">Overview</span>
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

                <div className="mb-2 w-full">
                    <div className="flex flex-nowrap justify-between items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md">
                        <div className="flex flex-nowrap gap-2">
                            {CATEGORY_LIST.map(cat => {
                                const enabled = enabledCategories.includes(cat);
                                const categoryColors = {
                                    Sentiment: 'bg-blue-500',
                                    Damages: 'bg-red-500',
                                    Elements: 'bg-yellow-500',
                                    Requests: 'bg-green-500',
                                    Miscellaneous: 'bg-purple-500',
                                };
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
                                                ? `${categoryColors[cat]} text-white shadow-md`
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
                                  const category = INDICATOR_CATEGORY_MAP[k] || 'Miscellaneous';
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