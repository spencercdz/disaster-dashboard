'use client';

import { useMemo } from 'react';
import { Prediction } from '../app/types/prediction';

interface ContainerSentimentProps {
  predictions: Prediction[];
}

export default function ContainerSentiment({ predictions }: ContainerSentimentProps) {
    // Memoized computation of sentiment analytics
    const sentimentData = useMemo(() => {
        if (!predictions || predictions.length === 0) {
            return {
                score: 50,
                trend: 'stable',
                breakdown: { positive: 0, neutral: 0, negative: 0 },
            };
        }
        // Weighted average
        const total = predictions.length;
        const sum = predictions.reduce((acc, p) => acc + (typeof p.sentiment === 'string' ? parseFloat(p.sentiment) : (typeof p.sentiment === 'number' ? p.sentiment : 50)), 0);
        const score = sum / total;
        // Breakdown
        let positive = 0, neutral = 0, negative = 0;
        predictions.forEach(p => {
            const s = typeof p.sentiment === 'string' ? parseFloat(p.sentiment) : (typeof p.sentiment === 'number' ? p.sentiment : 50);
            if (s >= 60) positive++;
            else if (s >= 40) neutral++;
            else negative++;
        });
        return {
            score,
            trend: 'stable', // TODO: add trend logic if needed
            breakdown: {
                positive: Math.round((positive / total) * 100),
                neutral: Math.round((neutral / total) * 100),
                negative: Math.round((negative / total) * 100),
            },
        };
    }, [predictions]);

    // Function to get trend icon
    const getTrendIcon = (trend: string) => {
        switch(trend) {
            case 'up': return '↑';
            case 'down': return '↓';
            case 'stable': return '→';
            default: return '-';
        }
    };

    // Function to get trend color
    const getTrendColor = (trend: string) => {
        switch(trend) {
            case 'up': return 'text-green-500';
            case 'down': return 'text-red-500';
            case 'stable': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    // Function to get sentiment score description
    const getSentimentDescription = (score: number) => {
        if (score >= 80) return 'Very Positive';
        if (score >= 60) return 'Positive';
        if (score >= 40) return 'Neutral';
        if (score >= 20) return 'Negative';
        return 'Very Negative';
    };

    // Calculate sentiment score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        if (score >= 20) return 'text-red-500';
        return 'text-red-600';
    };

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2">
                <h1 className="text-1xl font-bold mb-2">Sentiment Analysis</h1>
            </div>
            {/* Sentiment Score */}
            <div className="mb-2 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-3">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold mb-2">Overall Sentiment</span>
                        <span className={`text-xl font-bold ${getScoreColor(sentimentData.score)}`}>
                            {getSentimentDescription(sentimentData.score)}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <span className={`text-3xl font-bold ${getScoreColor(sentimentData.score)}`}>
                            {sentimentData.score.toFixed(2)}
                        </span>
                        <span className={`ml-2 text-xl ${getTrendColor(sentimentData.trend)}`}>
                            {getTrendIcon(sentimentData.trend)}
                        </span>
                    </div>
                </div>
            </div>
            {/* Sentiment Breakdown */}
            <div className="rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-3">
                <h2 className="text-sm font-semibold mb-2">Sentiment Breakdown</h2>
                <div className="flex h-2 rounded-md overflow-hidden mb-2">
                    <div 
                        className="bg-green-500" 
                        style={{ width: `${sentimentData.breakdown.positive}%` }}
                    />
                    <div 
                        className="bg-blue-400" 
                        style={{ width: `${sentimentData.breakdown.neutral}%` }}
                    />
                    <div 
                        className="bg-red-500" 
                        style={{ width: `${sentimentData.breakdown.negative}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        <span>Positive: {sentimentData.breakdown.positive}%</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                        <span>Neutral: {sentimentData.breakdown.neutral}%</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        <span>Negative: {sentimentData.breakdown.negative}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}