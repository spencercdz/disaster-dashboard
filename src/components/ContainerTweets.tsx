'use client';

import { useState } from 'react';
import { Tweet } from '../app/types/tweet';

interface TweetsProps {
    tweets: Tweet[];
}

function removeLinks(text: string) {
    // Remove http, https, www, t.co, etc
    return text.replace(/https?:\/\/\S+|www\.\S+|t\.co\/\S+/gi, '').replace(/\s+/g, ' ').trim();
}

function formatTimestamp(timestamp: string) {
    // Try ISO first
    let date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', year: 'numeric' });
    // Try custom format: 2025-04-19_14-49-23
    const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
    if (match) {
        const [_, y, m, d, h, min, s] = match;
        date = new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
        if (!isNaN(date.getTime())) return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', year: 'numeric' });
    }
    return timestamp;
}

function getTweetUrl(tweet: Tweet) {
    return `https://twitter.com/i/web/status/${tweet.tweet_id}`;
}

export default function ContainerTweets({ tweets }: TweetsProps) {
    const [sortType, setSortType] = useState<'recent' | 'popular'>('recent');
    const [hovered, setHovered] = useState<number | null>(null);

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
                    sortedTweets.map(tweet => (
                        <a
                            key={tweet.tweet_id}
                            href={getTweetUrl(tweet)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block transition-all duration-200 rounded-lg border-l-4 border-blue-400 bg-gradient-to-br from-black/60 to-black/30 shadow-md hover:shadow-2xl hover:scale-[1.025] hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-900/60 hover:to-black/60 cursor-pointer group ${hovered === tweet.tweet_id ? 'z-10' : ''}`}
                            onMouseEnter={() => setHovered(tweet.tweet_id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="p-3">
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
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-700">
                                    <span>Retweets: {tweet.retweets}</span>
                                    <span>Favorites: {tweet.favorites}</span>
                                    <span>Replies: {tweet.replies}</span>
                                    <span>Followers: {tweet.followers}</span>
                                </div>
                                {/* Hover hint */}
                                <div className={`transition-opacity duration-200 text-xs text-blue-300 mt-2 ${hovered === tweet.tweet_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    Click to view on Twitter
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}