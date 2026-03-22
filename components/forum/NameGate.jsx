'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NameGate({ onEnter }) {
  const [name, setName] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onEnter(name.trim());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        >
          {/* Logo mark */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-2xl font-bold">
              Q
            </div>
          </div>

          <h1 className="mb-1 text-center font-display text-2xl font-semibold text-primary">
            Welcome to QnA Forum
          </h1>
          <p className="mb-6 text-center text-sm text-muted">
            Ask anything about Product Management
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">
                Your name
              </label>
              <motion.input
                animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.35 }}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya, Marcus, You…"
                autoFocus
                maxLength={40}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent-light))]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-[15px] font-semibold text-primary-foreground transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:scale-[0.97]"
            >
              Enter Forum →
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted">
            Your name appears on comments you post.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
