"use client";
import Image from "next/image";
import Header from "@/components/Header";
import ContainerSearch from "@/components/ContainerSearch";
import Chart from "@/components/ContainerChart";
import Map from "@/components/ContainerMap";
import Sentiment from "@/components/ContainerSentiment";
import ContainerTweets from "@/components/ContainerTweets";
import Requests from "@/components/ContainerRequests";
import { useState } from "react";
import { Tweet } from "./types/tweet";

export default function ClientHome() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
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
            <Sentiment />
          </div>
          <div className="flex-grow h-[calc(70%-1rem)]">
            <ContainerTweets tweets={tweets} />
          </div>
        </div>
        {/* Column 2: Map, Chart */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4">
          <div className="h-1/2">
            <Map />
          </div>
          <div className="h-1/2">
            <Chart />
          </div>
        </div>
        {/* Column 3: Requests */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden">
          <div className="h-full">
            <Requests />
          </div>
        </div>
      </div>
    </div>
  );
} 