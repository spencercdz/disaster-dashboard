'use client';

import { useState } from 'react';

// Define types for tweet data
interface Tweet {
    id: string;
    user: {
        name: string;
        handle: string;
        avatar: string;
    };
    content: string;
    timestamp: string;
    location?: string;
    metrics: {
        likes: number;
        retweets: number;
        replies: number;
    };
    sentiment: 'positive' | 'neutral' | 'negative';
    verified: boolean;
    hasMedia: boolean;
}

export default function Tweets() {
    // Mock tweet data
    const [tweets, setTweets] = useState<Tweet[]>([
        {
            id: '1',
            user: {
                name: 'Myanmar Relief',
                handle: '@myanmarrelief',
                avatar: 'https://placehold.co/40x40'
            },
            content: 'Urgent need for medical supplies in Yangon region. Local hospitals are overwhelmed with patients. #MyanmarFlood #EmergencyRelief',
            timestamp: '2023-06-15T14:30:00Z',
            location: 'Yangon, Myanmar',
            metrics: {
                likes: 245,
                retweets: 189,
                replies: 42
            },
            sentiment: 'negative',
            verified: true,
            hasMedia: false
        },
        {
            id: '2',
            user: {
                name: 'Disaster Response',
                handle: '@disasterresponse',
                avatar: 'https://placehold.co/40x40'
            },
            content: 'Our team has successfully evacuated 120 people from flooded areas in Mandalay. Rescue operations continue. #RescueEfforts',
            timestamp: '2023-06-15T12:15:00Z',
            location: 'Mandalay, Myanmar',
            metrics: {
                likes: 512,
                retweets: 302,
                replies: 78
            },
            sentiment: 'positive',
            verified: true,
            hasMedia: true
        },
        {
            id: '3',
            user: {
                name: 'Weather Alert',
                handle: '@weatheralert',
                avatar: 'https://placehold.co/40x40'
            },
            content: 'Heavy rainfall expected to continue for the next 48 hours across central Myanmar. Please stay indoors if possible. #WeatherWarning',
            timestamp: '2023-06-15T10:45:00Z',
            metrics: {
                likes: 189,
                retweets: 245,
                replies: 36
            },
            sentiment: 'neutral',
            verified: true,
            hasMedia: false
        },
        {
            id: '4',
            user: {
                name: 'Local Volunteer',
                handle: '@helpinghand',
                avatar: 'https://placehold.co/40x40'
            },
            content: 'Distributing food and water in Bago region today. So many families in need but the community spirit is strong! #CommunitySupport',
            timestamp: '2023-06-15T09:20:00Z',
            location: 'Bago, Myanmar',
            metrics: {
                likes: 324,
                retweets: 156,
                replies: 42
            },
            sentiment: 'positive',
            verified: false,
            hasMedia: true
        }
    ]);

    // Function to format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Function to get sentiment color
    const getSentimentColor = (sentiment: string) => {
        switch(sentiment) {
            case 'positive': return 'border-green-500';
            case 'neutral': return 'border-blue-400';
            case 'negative': return 'border-red-500';
            default: return 'border-gray-400';
        }
    };

    // Function to format numbers (e.g., 1.2K instead of 1200)
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2 flex justify-between items-center">
                <h1 className="text-1xl font-bold">Recent Tweets</h1>
                <div className="flex space-x-2">
                    <select className="search-input text-xs py-1 px-2">
                        <option value="all">All Tweets</option>
                        <option value="verified">Verified Only</option>
                        <option value="media">With Media</option>
                    </select>
                    <select className="search-input text-xs py-1 px-2">
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>
            
            {/* Tweets List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {tweets.map(tweet => (
                    <div 
                        key={tweet.id} 
                        className={`p-3 bg-black bg-opacity-20 rounded-md border-l-4 ${getSentimentColor(tweet.sentiment)}`}
                    >
                        {/* Tweet Header */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                                    <img src={tweet.user.avatar} alt={tweet.user.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold mr-1">{tweet.user.name}</span>
                                        {tweet.verified && (
                                            <span className="text-blue-400 text-sm">✓</span>
                                        )}
                                    </div>
                                    <span className="text-gray-400 text-sm">{tweet.user.handle}</span>
                                </div>
                            </div>
                            <span className="text-gray-400 text-xs">{formatTimestamp(tweet.timestamp)}</span>
                        </div>
                        
                        {/* Tweet Content */}
                        <p className="mb-2">{tweet.content}</p>
                        
                        {/* Tweet Location (if available) */}
                        {tweet.location && (
                            <div className="flex items-center text-xs text-gray-400 mb-2">
                                <span className="mr-1">📍</span>
                                <span>{tweet.location}</span>
                            </div>
                        )}
                        
                        {/* Tweet Media Indicator */}
                        {tweet.hasMedia && (
                            <div className="mb-2 p-2 bg-black bg-opacity-30 rounded-md text-center text-sm text-gray-300">
                                [Media content]                                
                            </div>
                        )}
                        
                        {/* Tweet Metrics */}
                        <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                            <div className="flex items-center">
                                <span className="mr-1">💬</span>
                                <span>{formatNumber(tweet.metrics.replies)}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-1">🔄</span>
                                <span>{formatNumber(tweet.metrics.retweets)}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-1">❤️</span>
                                <span>{formatNumber(tweet.metrics.likes)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}