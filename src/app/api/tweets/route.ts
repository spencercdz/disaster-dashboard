import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  let supabaseQuery = supabase.from('tweets').select('*').order('time', { ascending: false });
  if (query) {
    supabaseQuery = supabaseQuery.ilike('query', `%${query}%`);
  }
  // Supabase limits to 1000 rows per request, so we batch fetch all rows
  let allData: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let done = false;
  while (!done) {
    const { data, error } = await supabaseQuery.range(from, from + batchSize - 1);
    if (error) {
      console.error('API /api/tweets: error =', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data && data.length > 0) {
      allData = allData.concat(data);
      if (data.length < batchSize) {
        done = true;
      } else {
        from += batchSize;
      }
    } else {
      done = true;
    }
  }
  console.log('API /api/tweets: query =', query);
  console.log('API /api/tweets: returned', allData.length, 'tweets');
  return NextResponse.json(allData, { status: 200 });
} 