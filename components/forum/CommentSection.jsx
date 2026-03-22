'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

const PASTEL_COLORS = [
  'bg-rose-200', 'bg-amber-200', 'bg-emerald-200', 'bg-sky-200',
  'bg-violet-200', 'bg-pink-200', 'bg-teal-200', 'bg-orange-200',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommentSection({ comments, onAddComment, userName = 'You' }) {
  const [text, setText] = useState('');
  const [newCommentIds, setNewCommentIds] = useState(new Set());

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const val = text;
    setText('');
    await onAddComment(val);
    if (comments.length > 0) {
      setNewCommentIds((prev) => new Set(prev).add(comments[0]?.id || ''));
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-border px-4 py-3">
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={i === 0 ? { opacity: 0, y: -8 } : false}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 rounded-lg p-2 ${newCommentIds.has(c.id) ? 'animate-highlight' : ''}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-foreground ${getAvatarColor(c.author)}`}>
                  {c.author[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-foreground">{c.author}</span>
                    <span className="text-[11px] text-muted">{timeAgo(c.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/90">{c.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
            {userName[0].toUpperCase()}
</div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Add a comment..."
            className="h-9 flex-1 rounded-full border border-border bg-background px-3 text-sm outline-none transition-colors duration-150 focus:border-accent"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent transition-colors duration-150 hover:bg-accent-light disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
