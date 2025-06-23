import { Tweet } from '../types/tweet';

async function getTweets(): Promise<Tweet[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/tweets`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch tweets');
  return res.json();
}

export default async function TweetsPage() {
  const tweets = await getTweets();

  return (
    <div className="container-default mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Tweets</h1>
      <ul className="space-y-4">
        {tweets.map(tweet => (
          <li key={tweet.tweet_id} className="p-4 rounded bg-black bg-opacity-30">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">@{tweet.username}</span>
              {tweet.verified && <span className="text-blue-400 text-xs">✓</span>}
              <span className="text-xs text-gray-400 ml-2">{tweet.time}</span>
            </div>
            <div className="mb-2">{tweet.text}</div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Retweets: {tweet.retweets}</span>
              <span>Favorites: {tweet.favorites}</span>
              <span>Replies: {tweet.replies}</span>
              <span>Followers: {tweet.followers}</span>
              {tweet.location && <span>Location: {tweet.location}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 