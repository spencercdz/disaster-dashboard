'use client';

import { useMemo } from 'react';
import { Prediction } from '../app/types/prediction';
import { getSentimentStats, sentimentText, sentimentTextColor, } from '../app/lib/analytics';

interface ContainerSentimentProps {
  predictions: Prediction[];
}

export default function ContainerSentiment({ predictions }: ContainerSentimentProps) {
    // Memoized computation of sentiment analytics
    const sentimentData = useMemo(() => getSentimentStats(predictions), [predictions]);

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
                        <span className={`text-xl font-bold ${sentimentTextColor(sentimentData.score)}`}>
                            {sentimentText(sentimentData.score)}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <span className={`text-3xl font-bold ${sentimentTextColor(sentimentData.score)}`}>
                            {sentimentData.score.toFixed(2)}
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
                        className="bg-yellow-300" 
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
                        <div className="w-2 h-2 bg-yellow-300 rounded-full mr-1" />
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