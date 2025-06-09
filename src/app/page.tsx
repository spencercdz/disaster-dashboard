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
    <div className="flex flex-col h-screen overflow-hidden"> {/* Changed min-h-screen to h-screen and added overflow-hidden */}
      <div className="flex flex-col space-y-3">
        <Header />
      </div>

      {/* Main content area takes remaining height and uses flex */}
      <div className="flex-1 flex flex-row justify-between relative overflow-hidden pb-1"> {/* Added pb-2 for bottom padding */}
        {/* Column 1: Search, Sentiment, Tweets */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4"> {/* Added h-full, overflow-hidden, padding and space */}
          <div className="flex-none"> {/* Search container takes its content height */}
            <Search />
          </div>
          <div className="flex-grow h-[30%]"> {/* Sentiment takes a portion of the remaining height */}
            <Sentiment />
          </div>
          <div className="flex-grow h-[calc(70%-1rem)]"> {/* Tweets takes the rest, accounting for spacing */}
            <Tweets />
          </div>
        </div>

        {/* Column 2: Map, Chart */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden space-y-4"> {/* Added h-full, overflow-hidden, padding and space */}
          <div className="h-1/2"> {/* Map takes 50% height */}
            <Map />
          </div>
          <div className="h-1/2"> {/* Chart takes 50% height */}
            <Chart />
          </div>
        </div>

        {/* Column 3: Requests */}
        <div className="flex flex-col w-1/3 h-full overflow-hidden"> {/* Added h-full, overflow-hidden and padding */}
          <div className="h-full"> {/* Requests takes full height of its column */}
            <Requests />
          </div>
        </div>
      </div>
    </div>
  );
}