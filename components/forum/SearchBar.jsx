'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, activeQuery }) {
  const [value, setValue] = useState(activeQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const clear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[720px] px-4 pb-6"
    >
      <form onSubmit={handleSubmit} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search questions by keyword..."
          className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent-light))]"
        />
      </form>
      {activeQuery && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span>Showing results for: <strong className="text-foreground">{activeQuery}</strong></span>
          <button onClick={clear} className="rounded-full p-0.5 transition-colors hover:bg-background">
            <X size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
