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
      
      <div className="flex-1 justify-between md:flex relative">
        <div className="flex justify-center flex-col flex-grow">
          <div className="flex justify-center flex-col flex-grow">
            <Search />
            <Sentiment />
          </div>
          <div className="flex justify-center flex-col flex-grow">
            <Requests />
          </div>
        </div>
        <div className="flex justify-center flex-col flex-grow">
          <Map />
          <Chart />
        </div>
        <div className="flex justify-center flex-col flex-grow">
          <Tweets />
        </div>
      </div>
    </div>
  );
}