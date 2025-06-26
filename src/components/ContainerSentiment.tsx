'use client';

import { useState } from 'react';

// Define types for sentiment data
interface SentimentData {
    score: number;
    trend: 'up' | 'down' | 'stable';
    breakdown: {
        positive: number;
        neutral: number;
        negative: number;
    }
}

export default function Sentiment() {
    // Mock sentiment data
    const [sentimentData, setSentimentData] = useState<SentimentData>({
        score: 0.35,
        trend: 'up',
        breakdown: {
            positive: 45,
            neutral: 35,
            negative: 20
        },
    });

    // Function to get sentiment color
    const getSentimentColor = (sentiment: string) => {
        switch(sentiment) {
            case 'positive': return 'text-green-500';
            case 'neutral': return 'text-blue-400';
            case 'negative': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

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
        if (score >= 0.6) return 'Very Positive';
        if (score >= 0.2) return 'Positive';
        if (score >= -0.2) return 'Neutral';
        if (score >= -0.6) return 'Negative';
        return 'Very Negative';
    };

    // Calculate sentiment score color
    const getScoreColor = (score: number) => {
        if (score >= 0.6) return 'text-green-500';
        if (score >= 0.2) return 'text-green-400';
        if (score >= -0.2) return 'text-blue-400';
        if (score >= -0.6) return 'text-red-400';
        return 'text-red-500';
    };

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2">
                <h1 className="text-1xl font-bold">Sentiment Analysis</h1>
            </div>
            
            {/* Sentiment Score */}
            <div className="flex justify-between items-center mb-4 p-3 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group">
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
            
            {/* Sentiment Breakdown */}
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group">
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