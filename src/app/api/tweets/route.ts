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
  console.log('API /api/tweets: query =', query);
  const { data, error } = await supabaseQuery;
  console.log('API /api/tweets: returned', Array.isArray(data) ? data.length : 0, 'tweets');
  if (error) {
    console.error('API /api/tweets: error =', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
} 