'use client';

import { motion } from 'framer-motion';
import QuestionCard from './QuestionCard';

export default function RecentQuestions({ questions, onUpvote, onAddComment, onFetchComments, votedIds, userName }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="font-display text-xl font-semibold text-primary">🕐 Recent Questions</h3>
      <p className="mt-1 text-xs text-muted">Last 10 questions posted</p>
      <div className="mt-4 space-y-3">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            variant="recent"
            onUpvote={onUpvote}
            onAddComment={onAddComment}
            onFetchComments={onFetchComments}
            votedIds={votedIds}
            userName={userName}
          />
        ))}
      </div>
    </motion.section>
  );
}
