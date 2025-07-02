'use client';

import { useState, useRef, useMemo } from 'react';
import { Tweet } from '../app/types/tweet';
import { Prediction } from '../app/types/prediction';
import {
  parseSentiment,
  sentimentText,
  sentimentColor,
  sentimentTextColor,
  removeLinks,
  formatTimestamp,
  getTweetUrl,
  getCategoryColor,
  getDisplayNameForIndicator,
  getActiveIndicatorKeys,
} from '../app/lib/analytics';

interface TweetsProps {
    tweets: Tweet[];
    predictions?: Prediction[];
    activeIndicatorFilters: string[];
    setActiveIndicatorFilters: (filters: string[]) => void;
}

function getSentimentForTweet(tweetId: string, predictions: Prediction[]): number | null {
    const pred = predictions.find(p => String(p.tweet_id) === String(tweetId));
    if (!pred) return null;
    return parseSentiment(pred);
}

function getSentimentHoverColor(score: number | null) {
    if (score === null) return 'bg-gray-300';
    if (score >= 60) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
}

export default function ContainerTweets({ tweets, predictions = [], activeIndicatorFilters, setActiveIndicatorFilters }: TweetsProps) {
    const [sortType, setSortType] = useState<'recent' | 'popular'>('recent');
    // Ref object to store refs for each tweet's indicator bar
    const barRefs = useRef<{ [tweetId: string]: HTMLDivElement | null }>({});
    // Ref for filter chip bar
    const filterBarRef = useRef<HTMLDivElement | null>(null);
    // Drag state for filter chip bar
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const onFilterBarMouseDown = (e: React.MouseEvent) => {
        isDown = true;
        startX = e.pageX - (filterBarRef.current?.offsetLeft || 0);
        scrollLeft = filterBarRef.current?.scrollLeft || 0;
        document.body.style.cursor = 'grabbing';
    };
    const onFilterBarMouseLeave = () => { isDown = false; document.body.style.cursor = ''; };
    const onFilterBarMouseUp = () => { isDown = false; document.body.style.cursor = ''; };
    const onFilterBarMouseMove = (e: React.MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - (filterBarRef.current?.offsetLeft || 0);
        const walk = (x - startX);
        if (filterBarRef.current) filterBarRef.current.scrollLeft = scrollLeft - walk;
    };
    // Touch events
    let touchStartX = 0;
    let touchScrollLeft = 0;
    const onFilterBarTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].pageX - (filterBarRef.current?.offsetLeft || 0);
        touchScrollLeft = filterBarRef.current?.scrollLeft || 0;
    };
    const onFilterBarTouchMove = (e: React.TouchEvent) => {
        const x = e.touches[0].pageX - (filterBarRef.current?.offsetLeft || 0);
        const walk = (x - touchStartX);
        if (filterBarRef.current) filterBarRef.current.scrollLeft = touchScrollLeft - walk;
    };

    // Filtering logic
    const filteredTweets = useMemo(() => {
        if (!activeIndicatorFilters.length) return tweets;
        return tweets.filter(tweet => {
            const pred = predictions.find(p => String(p.tweet_id) === String(tweet.tweet_id));
            if (!pred) return false;
            return activeIndicatorFilters.every(indicator => {
                if (indicator === 'sentiment_positive') {
                    const s = parseSentiment(pred);
                    return s >= 60;
                } else if (indicator === 'sentiment_neutral') {
                    const s = parseSentiment(pred);
                    return s >= 40 && s < 60;
                } else if (indicator === 'sentiment_negative') {
                    const s = parseSentiment(pred);
                    return s < 40;
                } else if (indicator === 'genre_social') {
                    return pred.genre === 'social';
                } else if (indicator === 'genre_news') {
                    return pred.genre === 'news';
                } else if (indicator === 'genre_direct') {
                    return pred.genre === 'direct';
                } else {
                    return pred[indicator] === 'yes';
                }
            });
        });
    }, [tweets, predictions, activeIndicatorFilters]);

    // Sorting logic (memoized)
    const sortedTweets = useMemo(() => {
        const arr = [...filteredTweets];
        if (sortType === 'recent') {
            return arr.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        } else {
            return arr.sort((a, b) => {
                const aScore = (parseInt(a.retweets) || 0) + (parseInt(a.favorites) || 0);
                const bScore = (parseInt(b.retweets) || 0) + (parseInt(b.favorites) || 0);
                return bScore - aScore;
            });
        }
    }, [filteredTweets, sortType]);

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2 flex flex-row items-center justify-between gap-2 flex-nowrap w-full min-w-0 max-w-full">
                <div className="flex flex-row items-center gap-2 min-w-0 w-full max-w-full">
                    <h1 className="text-1xl font-bold mr-2 flex-shrink-0">Tweets</h1>
                    {activeIndicatorFilters.length > 0 && (
                        <div
                            ref={filterBarRef}
                            className="flex flex-nowrap gap-2 overflow-x-auto min-w-0 w-full max-w-full cursor-grab select-none scrollbar-hide"
                            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseDown={onFilterBarMouseDown}
                            onMouseLeave={onFilterBarMouseLeave}
                            onMouseUp={onFilterBarMouseUp}
                            onMouseMove={onFilterBarMouseMove}
                            onTouchStart={onFilterBarTouchStart}
                            onTouchMove={onFilterBarTouchMove}
                        >
                            {activeIndicatorFilters.map(indicator => (
                                <span
                                    key={indicator}
                                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getCategoryColor(indicator)} bg-neutral-800 flex items-center gap-1`}>
                                    {getDisplayNameForIndicator(indicator)}
                                    <button
                                        className="ml-1 text-lg font-bold text-red-400 hover:text-red-200 focus:outline-none"
                                        style={{ lineHeight: 1 }}
                                        onClick={() => setActiveIndicatorFilters(activeIndicatorFilters.filter(f => f !== indicator))}
                                        title="Remove filter"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <style jsx>{`
                                div::-webkit-scrollbar { display: none; }
                            `}</style>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2 flex-shrink-0">
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
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 pr-1">
                {sortedTweets.length === 0 ? (
                    <div className="text-gray-400">No tweets found for this query.</div>
                ) : (
                    sortedTweets.map(tweet => {
                        const sentimentScore = getSentimentForTweet(tweet.tweet_id, predictions);
                        const sentimentColorClass = sentimentColor(sentimentScore);
                        const sentimentTextColorClass = sentimentTextColor(sentimentScore);
                        const sentimentHoverColor = getSentimentHoverColor(sentimentScore);
                        return (
                            <div
                                key={tweet.tweet_id}
                                className={
                                    `flex w-full min-w-0 max-w-full transition-all duration-200 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group`
                                }
                            >
                                <div className={`w-2 rounded-l-lg ${sentimentColorClass} transition-colors duration-200 group-hover:${sentimentHoverColor} flex-shrink-0`}></div>
                                <div className="flex-1 p-3 relative w-full min-w-0 max-w-full">
                                    {/* Tweet Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <span className="font-semibold mr-1">@{tweet.username}</span>
                                            {tweet.verified && <span className="text-blue-400 text-sm">✓</span>}
                                        </div>
                                        <span className="text-gray-400 text-xs">{formatTimestamp(tweet.time)}</span>
                                    </div>
                                    {/* Tweet Content */}
                                    {(() => {
                                        const text = removeLinks(tweet.text);
                                        const isLong = text.length > 140;
                                        const isExpanded = expanded[tweet.tweet_id];
                                        if (!isLong) {
                                            return <p className="mb-2 text-base leading-snug break-words overflow-hidden w-full">{text}</p>;
                                        }
                                        if (isExpanded) {
                                            return <>
                                                <p className="mb-2 text-base leading-snug break-words overflow-hidden w-full">{text}</p>
                                                <div className="flex justify-center mt-1">
                                                    <button className="text-blue-400 hover:underline" onClick={() => setExpanded(e => ({ ...e, [tweet.tweet_id]: false }))}>Minimize</button>
                                                </div>
                                            </>;
                                        } else {
                                            return <>
                                                <p className="mb-2 text-base leading-snug break-words overflow-hidden w-full">{text.slice(0, 140)}...</p>
                                                <div className="flex justify-center mt-1">
                                                    <button className="text-blue-400 hover:underline" onClick={() => setExpanded(e => ({ ...e, [tweet.tweet_id]: true }))}>Expand</button>
                                                </div>
                                            </>;
                                        }
                                    })()}
                                    {/* Tweet Location (if available) */}
                                    {tweet.location && tweet.location !== 'EMPTY' && (
                                        <div className="flex items-center text-xs text-gray-400 mb-2">
                                            <span className="mr-1">📍</span>
                                            <span>{tweet.location}</span>
                                        </div>
                                    )}
                                    {/* Tweet Metrics and Sentiment Row */}
                                    <div className="flex flex-row flex-nowrap gap-2 text-xs text-gray-400 pt-2 border-t border-gray-700 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                                        <span>Retweets: {tweet.retweets}</span>
                                        <span>Favorites: {tweet.favorites}</span>
                                        <span>Replies: {tweet.replies}</span>
                                        <span>Followers: {tweet.followers}</span>
                                        {sentimentScore !== null && (
                                            <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${sentimentTextColorClass} whitespace-nowrap`} style={{ background: 'rgba(255, 255, 255, 0)' }}>
                                                {sentimentText(sentimentScore)} Sentiment
                                            </span>
                                        )}
                                    </div>
                                    {/* Indicator bar and link row */}
                                    {(() => {
                                        const pred = predictions.find(p => String(p.tweet_id) === String(tweet.tweet_id));
                                        if (!pred) return null;
                                        const indicatorKeys = getActiveIndicatorKeys(pred);
                                        if (indicatorKeys.length === 0) return null;
                                        // Drag state (per render, not per tweet, but works for UI)
                                        let isDown = false;
                                        let startX = 0;
                                        let scrollLeft = 0;
                                        const onMouseDown = (e: React.MouseEvent) => {
                                            isDown = true;
                                            startX = e.pageX - (barRefs.current[tweet.tweet_id]?.offsetLeft || 0);
                                            scrollLeft = barRefs.current[tweet.tweet_id]?.scrollLeft || 0;
                                            document.body.style.cursor = 'grabbing';
                                        };
                                        const onMouseLeave = () => { isDown = false; document.body.style.cursor = ''; };
                                        const onMouseUp = () => { isDown = false; document.body.style.cursor = ''; };
                                        const onMouseMove = (e: React.MouseEvent) => {
                                            if (!isDown) return;
                                            e.preventDefault();
                                            const x = e.pageX - (barRefs.current[tweet.tweet_id]?.offsetLeft || 0);
                                            const walk = (x - startX);
                                            if (barRefs.current[tweet.tweet_id]) barRefs.current[tweet.tweet_id]!.scrollLeft = scrollLeft - walk;
                                        };
                                        // Touch events
                                        let touchStartX = 0;
                                        let touchScrollLeft = 0;
                                        const onTouchStart = (e: React.TouchEvent) => {
                                            touchStartX = e.touches[0].pageX - (barRefs.current[tweet.tweet_id]?.offsetLeft || 0);
                                            touchScrollLeft = barRefs.current[tweet.tweet_id]?.scrollLeft || 0;
                                        };
                                        const onTouchMove = (e: React.TouchEvent) => {
                                            const x = e.touches[0].pageX - (barRefs.current[tweet.tweet_id]?.offsetLeft || 0);
                                            const walk = (x - touchStartX);
                                            if (barRefs.current[tweet.tweet_id]) barRefs.current[tweet.tweet_id]!.scrollLeft = touchScrollLeft - walk;
                                        };
                                        return (
                                            <div className="flex flex-row items-center gap-2 mt-2 w-full min-w-0 max-w-full">
                                                <div
                                                    ref={el => { barRefs.current[tweet.tweet_id] = el; }}
                                                    className="flex-nowrap w-full min-w-0 max-w-full flex gap-1 cursor-grab select-none"
                                                    style={{
                                                        overflowX: 'auto',
                                                        WebkitOverflowScrolling: 'touch',
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none',
                                                    }}
                                                    onMouseDown={onMouseDown}
                                                    onMouseLeave={onMouseLeave}
                                                    onMouseUp={onMouseUp}
                                                    onMouseMove={onMouseMove}
                                                    onTouchStart={onTouchStart}
                                                    onTouchMove={onTouchMove}
                                                >
                                                    {indicatorKeys.map(key => (
                                                        <span
                                                            key={key}
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getCategoryColor(key)} bg-neutral-800 flex items-center gap-1`}
                                                            title={getDisplayNameForIndicator(key)}
                                                        >
                                                            {getDisplayNameForIndicator(key)}
                                                        </span>
                                                    ))}
                                                    {/* Hide scrollbar */}
                                                    <style jsx>{`
                                                        div::-webkit-scrollbar { display: none; }
                                                    `}</style>
                                                </div>
                                                <a
                                                    href={getTweetUrl(tweet)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 hover:bg-neutral-700 text-gray-400 hover:text-white shadow transition-colors duration-150 font-semibold flex-shrink-0"
                                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                                >
                                                    View on X.com
                                                </a>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}