'use client';

import { useState } from 'react';

const COMMON_EMOJIS = [
  '😀','😂','🥹','😍','🤔','🧐','💡','🔥','🚀','✅',
  '❌','👍','👎','🎯','⭐','❓','💬','👀','🎉','🤝',
  '📊','📈','💪','🙏','💯','🏆','⚡','🎨','📝','🤖',
  '😅','🥳','😎','🫡','🤷','📌','🗂️','⏰','🧠','🌟',
];

export default function EmojiPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('');

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
      <input
        type="text"
        placeholder="Search emoji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
      />
      <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
        {COMMON_EMOJIS.filter((e) => (search ? e.includes(search) : true)).map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors duration-150 hover:bg-accent-light active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
