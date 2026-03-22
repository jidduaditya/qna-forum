import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('questions')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[GET /api/questions/top] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch top questions' }, { status: 500 });
    }

    // Add rank field (1-based)
    const ranked = (data || []).map((q, i) => ({ ...q, rank: i + 1 }));
    return NextResponse.json(ranked);
  } catch (err) {
    console.error('[GET /api/questions/top] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
