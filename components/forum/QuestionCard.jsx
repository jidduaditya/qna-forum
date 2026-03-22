'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import CommentSection from './CommentSection';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function QuestionCard({
  question,
  rank,
  userName,
  variant,
  onUpvote,
  onAddComment,
  onFetchComments,
  votedIds,
}) {
  const [showComments, setShowComments] = useState(false);
  const [pulsingUpvote, setPulsingUpvote] = useState(false);
  const isVoted = votedIds.has(question.id);

  // Fetch comments the first time the section is opened
  useEffect(() => {
    if (showComments) {
      onFetchComments(question.id);
    }
  }, [showComments, question.id, onFetchComments]);

  const handleUpvote = () => {
    setPulsingUpvote(true);
    setTimeout(() => setPulsingUpvote(false), 200);
    onUpvote(question.id);
  };

  const commentCount = question.comments?.length ?? question.comment_count ?? 0;

  if (variant === 'top') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl border border-border bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      >
        <button onClick={() => setShowComments(!showComments)} className="flex w-full items-start gap-3 text-left">
          <span className="font-display text-lg font-bold text-accent">#{rank}</span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] font-medium text-foreground">{question.text}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${question.isTopicPM ? 'bg-tag text-tag-text' : 'bg-background text-muted'}`}>
                {question.tags?.[0] ?? (question.isTopicPM ? 'Product Management' : 'General')}
              </span>
              <span className="text-xs text-muted">💬 {commentCount}</span>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-accent">🔺 {question.upvotes}</span>
        </button>
        <AnimatePresence>
          {showComments && (
            <CommentSection
              comments={question.comments ?? []}
              onAddComment={(text) => onAddComment(question.id, text)}
              userName={userName}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Recent variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-[15px] text-foreground">{question.text}</p>
          {question.attachments?.filter((a) => a.type === 'sticker').map((a, i) => (
            <span key={i} className="mr-1 text-xl">{a.emoji}</span>
          ))}
        </div>
        {question.attachments?.some((a) => a.type === 'image' || a.type === 'gif') && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.attachments.find((a) => a.type === 'image' || a.type === 'gif').url}
            alt=""
            className="h-[60px] w-[60px] shrink-0 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-muted">{timeAgo(question.timestamp)}</span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${question.isTopicPM ? 'bg-tag text-tag-text' : 'bg-background text-muted'}`}>
          {question.tags?.[0] ?? (question.isTopicPM ? 'Product Management' : 'General')}
        </span>
        <button
          onClick={handleUpvote}
          className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
            isVoted ? 'bg-accent-light text-accent' : 'text-muted hover:bg-accent-light hover:text-accent'
          } ${pulsingUpvote ? 'animate-[upvote-pulse_200ms_ease-out]' : ''}`}
        >
          🔺 {question.upvotes}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors duration-150 hover:bg-background"
        >
          <MessageCircle size={13} /> {commentCount}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <CommentSection
            comments={question.comments ?? []}
            onAddComment={(text) => onAddComment(question.id, text)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
