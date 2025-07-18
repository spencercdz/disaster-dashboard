"use client";
import Header from "@/components/Header";
import ContainerSearch from "@/components/ContainerSearch";
import Chart from "@/components/ContainerChart";
import Map from "@/components/ContainerMap";
import Sentiment from "@/components/ContainerSentiment";
import ContainerTweets from "@/components/ContainerTweets";
import Requests from "@/components/ContainerIndicators";
import { useState, useEffect } from "react";
import { Tweet } from "./types/tweet";
import { Prediction } from './types/prediction';

export default function ClientHome() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndicatorFilters, setActiveIndicatorFilters] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPredictions() {
      if (tweets.length === 0) {
        setPredictions([]);
        setLoading(false);
        return;
      }
      const tweetIds = tweets.map(t => t.tweet_id.toString());
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweet_ids: tweetIds })
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      } else {
        setPredictions([]);
      }
      setLoading(false);
    }
    if (tweets.length > 0) setLoading(true);
    fetchPredictions();
  }, [tweets]);

  // Animated loading dots
  const [dotCount, setDotCount] = useState(1);
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDotCount(d => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group p-6 border border-neutral-700 flex flex-col items-center">
            <span className="text-xl font-bold text-yellow-400 font-mono tracking-wider">
              Loading{'.'.repeat(dotCount)}
            </span>
            <span className="mt-2 text-xs text-neutral-400 font-mono tracking-widest">
              Fetching tweets & predictions
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-3">
        <Header />
      </div>
      <div className="flex-1 flex flex-row justify-between relative overflow-hidden pb-1">
        {/* Column 1: Search, Sentiment, Tweets */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4">
          <div className="flex-none">
            <ContainerSearch onTweetsFetched={setTweets} onSearchStart={() => setLoading(true)} />
          </div>
          <div className="flex-none" style={{ minHeight: 0 }}>
            <Sentiment predictions={predictions} />
          </div>
          <div className="flex-grow min-h-0 flex flex-col">
            <ContainerTweets tweets={tweets} predictions={predictions} activeIndicatorFilters={activeIndicatorFilters} setActiveIndicatorFilters={setActiveIndicatorFilters} />
          </div>
        </div>
        {/* Column 2: Map, Chart */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4">
          <div className="h-1/2">
            <Map />
          </div>
          <div className="h-1/2">
            <Chart predictions={predictions} tweets={tweets || []} />
          </div>
        </div>
        {/* Column 3: Requests */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden">
          <div className="h-full">
            <Requests predictions={predictions} activeIndicatorFilters={activeIndicatorFilters} setActiveIndicatorFilters={setActiveIndicatorFilters} />
          </div>
        </div>
      </div>
    </div>
  );
} 