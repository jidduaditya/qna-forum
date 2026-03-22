import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length === 0) {
    return NextResponse.json({ error: 'Query param "q" is required' }, { status: 400 });
  }

  try {
    const db = getServiceClient();

    // Full-text search with ILIKE fallback via Supabase's .or()
    const { data, error } = await db
      .from('questions')
      .select('*')
      .or(`text.ilike.%${q}%,text.fts.${q}`)
      .order('upvotes', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[GET /api/search] Supabase error:', error.message);

      // Fallback: pure ILIKE search if FTS fails
      const { data: fallback, error: fallbackError } = await db
        .from('questions')
        .select('*')
        .ilike('text', `%${q}%`)
        .order('upvotes', { ascending: false })
        .limit(20);

      if (fallbackError) {
        console.error('[GET /api/search] Fallback error:', fallbackError.message);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }

      return NextResponse.json(fallback);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/search] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
