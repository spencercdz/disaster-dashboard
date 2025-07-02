import { Prediction } from '../types/prediction';

// Parse sentiment value from Prediction
export function parseSentiment(p: Prediction): number {
  if (typeof p.sentiment === 'string') {
    const parsed = parseFloat(p.sentiment);
    if (!isNaN(parsed)) return parsed;
  } else if (typeof p.sentiment === 'number') {
    return p.sentiment;
  }
  return 50;
}

// Categorize sentiment score
export function categorizeSentiment(score: number): 'Positive' | 'Neutral' | 'Negative' {
  if (score >= 60) return 'Positive';
  if (score >= 40) return 'Neutral';
  return 'Negative';
}

// WeakMap-based caches for analytics functions
const sentimentStatsCache: WeakMap<Prediction[], { score: number; breakdown: { positive: number; neutral: number; negative: number } }> = new WeakMap();
const sentimentBreakdownCache: WeakMap<Prediction[], { positive: number; neutral: number; negative: number }> = new WeakMap();
const indicatorBreakdownCache: WeakMap<Prediction[], Record<string, number>> = new WeakMap();
const perDaySentimentCache: WeakMap<Prediction[], Record<string, unknown>[]> = new WeakMap();

// Get sentiment stats (average score and breakdown)
export function getSentimentStats(predictions: Prediction[]): { score: number; breakdown: { positive: number; neutral: number; negative: number } } {
  if (sentimentStatsCache.has(predictions)) {
    return sentimentStatsCache.get(predictions)!;
  }
  if (!predictions || predictions.length === 0) {
    const result = {
      score: 50,
      breakdown: { positive: 0, neutral: 0, negative: 0 },
    };
    sentimentStatsCache.set(predictions, result);
    return result;
  }
  const total = predictions.length;
  let sum = 0;
  let positive = 0, neutral = 0, negative = 0;
  predictions.forEach(p => {
    const s = parseSentiment(p);
    sum += s;
    if (s >= 60) positive++;
    else if (s >= 40) neutral++;
    else negative++;
  });
  const result = {
    score: sum / total,
    breakdown: {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    }
  };
  sentimentStatsCache.set(predictions, result);
  return result;
}

// Get sentiment breakdown (counts only)
export function getSentimentBreakdown(predictions: Prediction[]): { positive: number; neutral: number; negative: number } {
  if (sentimentBreakdownCache.has(predictions)) {
    return sentimentBreakdownCache.get(predictions)!;
  }
  let positive = 0, neutral = 0, negative = 0;
  predictions.forEach(p => {
    const s = parseSentiment(p);
    if (s >= 60) positive++;
    else if (s >= 40) neutral++;
    else negative++;
  });
  const result = { positive, neutral, negative };
  sentimentBreakdownCache.set(predictions, result);
  return result;
}

// Get indicator breakdown (for ContainerIndicators)
export function getIndicatorBreakdown(predictions: Prediction[], indicatorKeys: string[], genreKeys: string[]): Record<string, number> {
  if (indicatorBreakdownCache.has(predictions)) {
    return indicatorBreakdownCache.get(predictions)!;
  }
  const counts: Record<string, number> = {};
  indicatorKeys.forEach(key => { counts[key] = 0; });
  genreKeys.forEach(key => { counts[key] = 0; });
  counts['sentiment_positive'] = 0;
  counts['sentiment_neutral'] = 0;
  counts['sentiment_negative'] = 0;
  predictions.forEach(p => {
    // Binary indicators
    indicatorKeys.forEach(key => {
      if (p[key] === 'yes') counts[key]++;
    });
    // Genre
    if (p.genre === 'social') counts['genre_social']++;
    else if (p.genre === 'news') counts['genre_news']++;
    else if (p.genre === 'direct') counts['genre_direct']++;
    // Sentiment
    const s = parseSentiment(p);
    if (s >= 60) counts['sentiment_positive']++;
    else if (s >= 40) counts['sentiment_neutral']++;
    else counts['sentiment_negative']++;
  });
  indicatorBreakdownCache.set(predictions, counts);
  return counts;
}

// Get per-day sentiment stats (for ContainerChart)
export function getPerDaySentiment(predictions: Prediction[], tweetTimeMap: Record<string, string>): Record<string, unknown>[] {
  if (perDaySentimentCache.has(predictions)) {
    return perDaySentimentCache.get(predictions)!;
  }
  if (!predictions || predictions.length === 0) return [];
  const byDate: Record<string, Prediction[]> = {};
  predictions.forEach(p => {
    const tweetTime = tweetTimeMap[p.tweet_id];
    if (!tweetTime || typeof tweetTime !== 'string') return;
    let date = tweetTime.split('T')[0];
    if (!date || date.length !== 10) {
      const match = tweetTime.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) date = `${match[1]}-${match[2]}-${match[3]}`;
      else date = 'unknown';
    }
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({ ...p, sentiment: parseSentiment(p) });
  });
  const result = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, preds]) => {
      const total = preds.length;
      const sum = preds.reduce((acc, p) => acc + (typeof p.sentiment === 'number' ? p.sentiment : 50), 0);
      const overall = sum / total;
      let positive = 0, neutral = 0, negative = 0;
      preds.forEach(p => {
        const s = typeof p.sentiment === 'number' ? p.sentiment : 50;
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
  perDaySentimentCache.set(predictions, result);
  return result;
}

// Sentiment text label
export function sentimentText(score: number | null): string {
  if (score === null) return 'Neutral';
  if (score >= 60) return 'Positive';
  if (score >= 40) return 'Neutral';
  return 'Negative';
}

// Sentiment color class
export function sentimentColor(score: number | null): string {
  if (score === null) return 'bg-gray-400';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-300';
  return 'bg-red-500';
}

// Sentiment text color class
export function sentimentTextColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 60) return 'text-green-400';
  if (score >= 40) return 'text-yellow-300';
  return 'text-red-400';
}

// Get sentiment trend (optional, for future use)
export function getSentimentTrend(predictions: Prediction[], windowSize: number = 10): 'up' | 'down' | 'stable' {
  if (!predictions || predictions.length < windowSize * 2) return 'stable';
  const recent = predictions.slice(-windowSize);
  const previous = predictions.slice(-windowSize * 2, -windowSize);
  const avg = (arr: Prediction[]) => arr.reduce((acc, p) => acc + parseSentiment(p), 0) / arr.length;
  const recentAvg = avg(recent);
  const prevAvg = avg(previous);
  if (recentAvg > prevAvg + 2) return 'up';
  if (recentAvg < prevAvg - 2) return 'down';
  return 'stable';
}

// Indicator/category maps and color maps
export const INDICATOR_CATEGORY_MAP: Record<string, 'Sentiment' | 'Damages' | 'Elements' | 'Requests' | 'Miscellaneous'> = {
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

export const INDICATOR_DISPLAY_NAME_MAP: Record<string, string> = {
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

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Sentiment: '', // handled per-indicator below
  Damages: 'text-orange-400',
  Elements: 'text-indigo-400',
  Requests: 'text-cyan-400',
  Miscellaneous: 'text-purple-400',
};

export function getCategoryColor(categoryOrKey: string): string {
  // Sentiment indicators
  if (categoryOrKey === 'sentiment_positive') return 'text-green-400';
  if (categoryOrKey === 'sentiment_neutral') return 'text-yellow-300';
  if (categoryOrKey === 'sentiment_negative') return 'text-red-400';
  // Damages
  if ([
    'death','child_alone','infrastructure_related','transport','buildings','electricity','hospitals','shops','other_infrastructure'
  ].includes(categoryOrKey)) return 'text-orange-400';
  // Requests
  if ([
    'request','offer','medical_help','medical_products','water','food','shelter','clothing','money','tools','aid_centers'
  ].includes(categoryOrKey)) return 'text-cyan-400';
  // Fallback: use the indicator's category color
  const category = INDICATOR_CATEGORY_MAP[categoryOrKey];
  if (category && CATEGORY_COLOR_MAP[category]) return CATEGORY_COLOR_MAP[category];
  return 'text-gray-400';
}

export const CATEGORY_BAR_COLOR_MAP: Record<string, string> = {
  Sentiment: 'rgba(96, 165, 250, 0.7)',
  Damages: 'rgba(251, 146, 60, 0.7)',
  Elements: 'rgba(129, 140, 248, 0.7)',
  Requests: 'rgba(6, 182, 212, 0.7)',
  Miscellaneous: 'rgba(192, 132, 252, 0.7)',
};

export const CATEGORY_LIST = ['Sentiment', 'Damages', 'Elements', 'Requests', 'Miscellaneous'] as const;
export type CategoryType = typeof CATEGORY_LIST[number];

export function getCategoryForIndicator(key: string): CategoryType {
  return INDICATOR_CATEGORY_MAP[key] || 'Miscellaneous';
}
export function getDisplayNameForIndicator(key: string): string {
  return INDICATOR_DISPLAY_NAME_MAP[key] || key.replace(/_/g, ' ');
}
export function getCategoryBarColor(category: string): string {
  return CATEGORY_BAR_COLOR_MAP[category] || 'rgba(156,163,175,0.7)';
}

// Tweet utilities
import dayjs from 'dayjs';
import { Tweet } from '../types/tweet';
export function removeLinks(text: string) {
  return text.replace(/https?:\/\/\S+|www\.\S+|t\.co\/\S+/gi, '').replace(/\s+/g, ' ').trim();
}
export function formatTimestamp(timestamp: string) {
  let date = new Date(timestamp);
  if (!isNaN(date.getTime())) return dayjs(date).format('YYYY-MM-DD HH:mm');
  const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d, h, min, s] = match;
    date = new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
    if (!isNaN(date.getTime())) return dayjs(date).format('YYYY-MM-DD HH:mm');
  }
  return timestamp;
}
export function getTweetUrl(tweet: Tweet) {
  if (!tweet.tweet_id) return '#';
  return `https://twitter.com/i/web/status/${tweet.tweet_id}`;
}

// Chart data helpers
export function prepareBarChartData(sortedIndicators: [string, number][]) {
  return {
    labels: sortedIndicators.map(([k]) => getDisplayNameForIndicator(k)),
    datasets: [
      {
        label: 'Count',
        data: sortedIndicators.map(([, v]) => v),
        backgroundColor: sortedIndicators.map(([k]) => {
          if (k === 'sentiment_positive') return '#4ade80';
          if (k === 'sentiment_neutral') return '#fde047';
          if (k === 'sentiment_negative') return '#f87171';
          return getCategoryBarColor(getCategoryForIndicator(k));
        }),
      },
    ],
  };
}
export function prepareLineChartData(sentimentData: Record<string, unknown>[], type: 'sentiment' | 'breakdown') {
  if (type === 'sentiment') {
    return {
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
  } else {
    return {
      labels: sentimentData.map(d => d.date),
      datasets: [
        {
          label: 'Positive',
          data: sentimentData.map(d => d.positive),
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.5)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Neutral',
          data: sentimentData.map(d => d.neutral),
          borderColor: '#fde047',
          backgroundColor: 'rgba(253, 224, 71, 0.5)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Negative',
          data: sentimentData.map(d => d.negative),
          borderColor: '#f87171',
          backgroundColor: 'rgba(248, 113, 113, 0.5)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }
}

export function getActiveIndicatorKeys(pred: Prediction): string[] {
  const keys = Object.keys(INDICATOR_CATEGORY_MAP).filter(key => pred[key] === 'yes');
  if (pred.genre === 'social') keys.push('genre_social');
  if (pred.genre === 'news') keys.push('genre_news');
  if (pred.genre === 'direct') keys.push('genre_direct');
  return keys;
} 