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

  useEffect(() => {
    async function fetchPredictions() {
      if (tweets.length === 0) {
        setPredictions([]);
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
    }
    fetchPredictions();
  }, [tweets]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-col space-y-3">
        <Header />
      </div>
      <div className="flex-1 flex flex-row justify-between relative overflow-hidden pb-1">
        {/* Column 1: Search, Sentiment, Tweets */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4">
          <div className="flex-none">
            <ContainerSearch onTweetsFetched={setTweets} />
          </div>
          <div className="flex-grow h-[30%]">
            <Sentiment predictions={predictions} />
          </div>
          <div className="flex-grow h-[calc(70%-1rem)]">
            {tweets.length > 0 && predictions.length > 0 && (
              <ContainerTweets tweets={tweets} predictions={predictions} />
            )}
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
            <Requests predictions={predictions} />
          </div>
        </div>
      </div>
    </div>
  );
} 