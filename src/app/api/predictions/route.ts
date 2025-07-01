import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseClientWithAuth(req: NextRequest) {
  // Get the user's access token from the Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClientWithAuth(req);
  const { data, error } = await supabase.from('requests').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const body = await req.json();
  console.log('API /api/predictions: received body =', body);
  const tweetIds = (body.tweet_ids || []).map((id: any) => id.toString());
  console.log('API /api/predictions: tweetIds =', tweetIds);
  if (!Array.isArray(tweetIds) || tweetIds.length === 0) {
    console.error('API /api/predictions: tweet_ids must be a non-empty array');
    return NextResponse.json({ error: 'tweet_ids must be a non-empty array' }, { status: 400 });
  }
  // Select all columns up to and including 'genre' (ignoring confidence columns)
  const selectCols = [
    'tweet_id', 'verified', 'username', 'date', 'retweets', 'tweet', 'sentiment', 'sentiment_confidence',
    'request', 'request_confidence', 'offer', 'offer_confidence', 'aid_related', 'aid_related_confidence',
    'medical_help', 'medical_help_confidence', 'medical_products', 'medical_products_confidence',
    'search_and_rescue', 'search_and_rescue_confidence', 'security',
    'military', 'child_alone', 'water', 'food', 'shelter', 'clothing', 'money', 'missing_people',
    'refugees', 'death', 'other_aid', 'infrastructure_related', 'transport', 'buildings', 'electricity',
    'tools', 'hospitals', 'shops', 'aid_centers', 'other_infrastructure', 'weather_related', 'floods',
    'storm', 'fire', 'earthquake', 'cold', 'other_weather', 'direct_report', 'genre', 'related'
  ];
  // Batch the tweetIds into groups of 200
  const batchSize = 200;
  let allData: any[] = [];
  for (let i = 0; i < tweetIds.length; i += batchSize) {
    const batchIds = tweetIds.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('predictions')
      .select(selectCols.join(','))
      .in('tweet_id', batchIds.map((id: any) => id.toString()));
    if (error) {
      console.error('API /api/predictions: Supabase error =', error.message, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data) allData = allData.concat(data);
  }
  console.log('API /api/predictions: returned', allData.length, 'predictions');
  return NextResponse.json(allData, { status: 200 });
} 