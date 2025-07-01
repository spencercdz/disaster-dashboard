'use client';

import { useState } from 'react';
import { Tweet } from '../app/types/tweet';
import dayjs from 'dayjs';

interface TweetsProps {
    tweets: Tweet[];
    predictions?: any[];
}

function removeLinks(text: string) {
    // Remove http, https, www, t.co, etc
    return text.replace(/https?:\/\/\S+|www\.\S+|t\.co\/\S+/gi, '').replace(/\s+/g, ' ').trim();
}

function formatTimestamp(timestamp: string) {
    // Try ISO first
    let date = new Date(timestamp);
    if (!isNaN(date.getTime())) return dayjs(date).format('YYYY-MM-DD HH:mm');
    // Try custom format: 2025-04-19_14-49-23
    const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
    if (match) {
        const [_, y, m, d, h, min, s] = match;
        date = new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
        if (!isNaN(date.getTime())) return dayjs(date).format('YYYY-MM-DD HH:mm');
    }
    return timestamp;
}

function getTweetUrl(tweet: Tweet) {
    if (!tweet.tweet_id) return '#';
    return `https://twitter.com/i/web/status/${tweet.tweet_id}`;
}

function getSentimentForTweet(tweetId: string, predictions: any[]): number | null {
    // Ensure both tweetId and prediction.tweet_id are strings for comparison
    const pred = predictions.find(p => String(p.tweet_id) === String(tweetId));
    if (!pred) {
        // Debug: log missing tweetId
        console.log('No prediction found for tweet_id:', tweetId);
        return null;
    }
    const s = typeof pred.sentiment === 'string' ? parseFloat(pred.sentiment) : pred.sentiment;
    return typeof s === 'number' && !isNaN(s) ? s : null;
}

function getSentimentColor(score: number | null) {
    if (score === null) return 'bg-gray-400';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-500';
}

function getSentimentHoverColor(score: number | null) {
    if (score === null) return 'bg-gray-300';
    if (score >= 60) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
}

export default function ContainerTweets({ tweets, predictions = [] }: TweetsProps) {
    const [sortType, setSortType] = useState<'recent' | 'popular'>('recent');
    const [hovered, setHovered] = useState<string | null>(null);

    // Sorting logic
    const sortedTweets = [...tweets].sort((a, b) => {
        if (sortType === 'recent') {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        } else {
            // Sort by sum of retweets + favorites (as numbers)
            const aScore = (parseInt(a.retweets) || 0) + (parseInt(a.favorites) || 0);
            const bScore = (parseInt(b.retweets) || 0) + (parseInt(b.favorites) || 0);
            return bScore - aScore;
        }
    });

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2 flex justify-between items-center">
                <h1 className="text-1xl font-bold">Tweets</h1>
                <div className="flex space-x-2">
                    <select
                        className="search-input text-xs py-1 px-2"
                        value={sortType}
                        onChange={e => setSortType(e.target.value as 'recent' | 'popular')}
                    >
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {sortedTweets.length === 0 ? (
                    <div className="text-gray-400">No tweets found for this query.</div>
                ) : (
                    sortedTweets.map(tweet => {
                        const sentimentScore = getSentimentForTweet(tweet.tweet_id, predictions);
                        const sentimentColor = getSentimentColor(sentimentScore);
                        const sentimentHoverColor = getSentimentHoverColor(sentimentScore);
                        return (
                            <div
                                key={tweet.tweet_id}
                                className={
                                    `flex transition-all duration-200 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group`
                                }
                                onMouseEnter={() => setHovered(tweet.tweet_id)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <div className={`w-2 rounded-l-lg ${sentimentColor} transition-colors duration-200 group-hover:${sentimentHoverColor} flex-shrink-0`}></div>
                                <div className="flex-1 p-3 relative">
                                    {/* Tweet Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <span className="font-semibold mr-1">@{tweet.username}</span>
                                            {tweet.verified && <span className="text-blue-400 text-sm">✓</span>}
                                        </div>
                                        <span className="text-gray-400 text-xs">{formatTimestamp(tweet.time)}</span>
                                    </div>
                                    {/* Tweet Content */}
                                    <p className="mb-2 text-base leading-snug">
                                        {removeLinks(tweet.text)}
                                    </p>
                                    {/* Tweet Location (if available) */}
                                    {tweet.location && tweet.location !== 'EMPTY' && (
                                        <div className="flex items-center text-xs text-gray-400 mb-2">
                                            <span className="mr-1">📍</span>
                                            <span>{tweet.location}</span>
                                        </div>
                                    )}
                                    {/* Tweet Metrics */}
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-700 items-center">
                                        <span>Retweets: {tweet.retweets}</span>
                                        <span>Favorites: {tweet.favorites}</span>
                                        <span>Replies: {tweet.replies}</span>
                                        <span>Followers: {tweet.followers}</span>
                                        {sentimentScore !== null && (
                                            <span className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                Sentiment: {sentimentScore.toFixed(1)}
                                            </span>
                                        )}
                                        <a
                                            href={getTweetUrl(tweet)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto hover:bg-neutral-700 text-blue-400 hover:text-blue-300 rounded shadow transition-colors duration-150 font-semibold"
                                        >
                                            View on X.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}