import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { id: questionId } = await params;

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('comments')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET comments] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET comments] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id: questionId } = await params;

  try {
    const body = await request.json();
    const { text, commenterName = 'Anonymous' } = body;

    // Validate
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }
    if (text.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or fewer' }, { status: 400 });
    }

    const db = getServiceClient();

    // Insert comment
    const { data: comment, error: insertError } = await db
      .from('comments')
      .insert({
        question_id: questionId,
        text: text.trim(),
        commenter_name: commenterName,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[POST comments] Insert error:', insertError.message);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    // Increment comment_count on the question
    const { data: q } = await db
      .from('questions')
      .select('comment_count')
      .eq('id', questionId)
      .single();

    await db
      .from('questions')
      .update({ comment_count: (q?.comment_count || 0) + 1 })
      .eq('id', questionId);

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('[POST comments] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
