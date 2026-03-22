const API_BASE = '/api';

// Get or create session ID for upvote tracking
export function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('qna_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('qna_session_id', id);
  }
  return id;
}

// Normalize a DB row → shape the Lovable components expect
function normalizeQuestion(q) {
  return {
    ...q,
    isTopicPM: q.is_pm_topic,
    timestamp: new Date(q.created_at),
    // comments are fetched on-demand; seed with empty array
    comments: [],
    tags: q.is_pm_topic ? ['Product Management'] : ['General'],
    attachments: q.attachments || [],
  };
}

function normalizeComment(c) {
  return {
    ...c,
    author: c.commenter_name,
    timestamp: new Date(c.created_at),
  };
}

export async function postQuestion(questionData) {
  const { text, attachments = [], richContent } = questionData;
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, attachments, richContent, sessionId: getSessionId() }),
  });
  if (!res.ok) throw new Error('Failed to post question');
  return normalizeQuestion(await res.json());
}

export async function upvoteQuestion(questionId) {
  const res = await fetch(`${API_BASE}/questions/${questionId}/upvote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: getSessionId() }),
  });
  if (!res.ok) throw new Error('Failed to upvote');
  return res.json(); // { newCount, voted }
}

export async function addComment(questionId, commentText, commenterName = 'Anonymous') {
  const res = await fetch(`${API_BASE}/questions/${questionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: commentText, commenterName }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return normalizeComment(await res.json());
}

export async function fetchComments(questionId) {
  const res = await fetch(`${API_BASE}/questions/${questionId}/comments`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  const data = await res.json();
  return data.map(normalizeComment);
}

export async function searchQuestions(keyword) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(keyword)}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.map(normalizeQuestion);
}

export async function fetchTopQuestions() {
  const res = await fetch(`${API_BASE}/questions/top`);
  if (!res.ok) throw new Error('Failed to fetch top questions');
  const data = await res.json();
  return data.map(normalizeQuestion);
}

export async function fetchRecentQuestions() {
  const res = await fetch(`${API_BASE}/questions/recent`);
  if (!res.ok) throw new Error('Failed to fetch recent questions');
  const data = await res.json();
  return data.map(normalizeQuestion);
}

export async function uploadAttachment(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { url }
}
