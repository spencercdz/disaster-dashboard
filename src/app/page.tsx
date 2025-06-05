import Image from "next/image";
import Header from "@/components/Header";
import Search from "@/components/ContainerSearch";
import Chart from "@/components/ContainerChart";
import Map from "@/components/ContainerMap";
import Sentiment from "@/components/ContainerSentiment";
import Tweets from "@/components/ContainerTweets";
import Requests from "@/components/ContainerRequests";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 flex flex-row justify-between relative">
        <div className="flex justify-center flex-col w-1/3">
          <div className="flex justify-center flex-col flex-1">
            <Search />
            <Sentiment />
            <Tweets />
          </div>
        </div>
        <div className="flex justify-center flex-col w-1/3">
          <Map />
          <Chart />
        </div>
        <div className="flex justify-center flex-col w-1/3">
          <Requests />
        </div>
      </div>
    </div>
  );
}