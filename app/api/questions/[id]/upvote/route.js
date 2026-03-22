import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request, { params }) {
  const { id: questionId } = await params;

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const db = getServiceClient();

    // Check if this session has already upvoted
    const { data: existing, error: checkError } = await db
      .from('upvote_sessions')
      .select('id')
      .eq('question_id', questionId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (checkError) {
      console.error('[POST upvote] Check error:', checkError.message);
      return NextResponse.json({ error: 'Failed to check upvote status' }, { status: 500 });
    }

    let newCount;
    let voted;

    if (existing) {
      // Un-vote: delete session record and decrement
      const { error: deleteError } = await db
        .from('upvote_sessions')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('[POST upvote] Delete error:', deleteError.message);
        return NextResponse.json({ error: 'Failed to remove upvote' }, { status: 500 });
      }

      const { data: updated, error: decrementError } = await db.rpc('decrement_upvotes', {
        question_id: questionId,
      });

      if (decrementError) {
        // Fallback: manual update
        const { data: q } = await db
          .from('questions')
          .select('upvotes')
          .eq('id', questionId)
          .single();

        await db
          .from('questions')
          .update({ upvotes: Math.max(0, (q?.upvotes || 1) - 1) })
          .eq('id', questionId);

        newCount = Math.max(0, (q?.upvotes || 1) - 1);
      } else {
        newCount = updated;
      }

      voted = false;
    } else {
      // Upvote: insert session record and increment
      const { error: insertError } = await db
        .from('upvote_sessions')
        .insert({ question_id: questionId, session_id: sessionId });

      if (insertError) {
        console.error('[POST upvote] Insert error:', insertError.message);
        return NextResponse.json({ error: 'Failed to record upvote' }, { status: 500 });
      }

      const { data: q, error: fetchError } = await db
        .from('questions')
        .select('upvotes')
        .eq('id', questionId)
        .single();

      if (fetchError) {
        console.error('[POST upvote] Fetch error:', fetchError.message);
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      const { error: incrementError } = await db
        .from('questions')
        .update({ upvotes: q.upvotes + 1 })
        .eq('id', questionId);

      if (incrementError) {
        console.error('[POST upvote] Increment error:', incrementError.message);
        return NextResponse.json({ error: 'Failed to update upvote count' }, { status: 500 });
      }

      newCount = q.upvotes + 1;
      voted = true;
    }

    return NextResponse.json({ newCount, voted });
  } catch (err) {
    console.error('[POST upvote] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
