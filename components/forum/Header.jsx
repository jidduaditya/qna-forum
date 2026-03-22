'use client';

import { motion } from 'framer-motion';

export default function Header({ userName }) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
        <h1 className="font-display text-[28px] font-semibold text-primary">
          QnA Forum
        </h1>
        <div className="flex items-center gap-3">
          <p className="hidden text-[13px] text-muted md:block">
            Ask anything about Product Management
          </p>
          {userName && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                {userName[0].toUpperCase()}
              </div>
              <span className="hidden text-[13px] font-medium text-foreground sm:block">
                {userName}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
