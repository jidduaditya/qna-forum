import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServiceClient } from '@/lib/supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory rate limit store: sessionId → [timestamps]
// Note: resets on cold start in serverless — intentional simplicity
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(sessionId) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(sessionId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(sessionId, timestamps);
  return true;
}

async function classifyWithClaude(text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await anthropic.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: `You are a strict topic classifier for a Product Management QnA forum. Your only job is to determine if a question is genuinely related to Product Management as a professional discipline.
Product Management topics include: product strategy, roadmaps, prioritization frameworks, user research, go-to-market, PRDs, sprint planning, OKRs, stakeholder management, product metrics, A/B testing, product-led growth, feature scoping, competitive analysis, product discovery, and similar PM craft topics.

NOT Product Management: general programming questions, personal advice, cooking, sports, current events, math, science unrelated to PM, HR/hiring unrelated to product roles, or any other off-topic content.

Respond ONLY with a JSON object (no markdown, no explanation):
{ "is_pm_topic": true|false, "confidence": 0.0-1.0, "reason": "one sentence" }`,
        messages: [{ role: 'user', content: text }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    const raw = response.content[0].text.trim();
    return JSON.parse(raw);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError' || err.message?.includes('abort')) {
      console.error('[classify] Claude timed out');
      return {
        is_pm_topic: false,
        confidence: 0,
        reason: 'Classification timed out',
      };
    }
    console.error('[classify] Claude error:', err.message);
    return {
      is_pm_topic: false,
      confidence: 0,
      reason: 'Classification failed — defaulting to non-PM',
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, richContent, attachments = [], sessionId } = body;

    // Validate
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Question must be 2000 characters or fewer' }, { status: 400 });
    }

    // Rate limit by sessionId (falls back to a shared bucket if not provided)
    const limitKey = sessionId || 'anonymous';
    if (!checkRateLimit(limitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded — max 5 questions per minute' },
        { status: 429 }
      );
    }

    // Classify with Claude
    const classification = await classifyWithClaude(text.trim());

    // Insert into Supabase
    const db = getServiceClient();
    const { data, error } = await db
      .from('questions')
      .insert({
        text: text.trim(),
        rich_content: richContent || null,
        attachments,
        is_pm_topic: classification.is_pm_topic,
        classification_reason: classification.reason,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/questions] Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[POST /api/questions] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
