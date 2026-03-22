'use client';

// Drop your Lovable App component into components/forum/App.jsx
// and it will be rendered here automatically.
//
// Until then, this placeholder shows the expected structure.

import dynamic from 'next/dynamic';

// Dynamic import disables SSR for the entire Lovable component tree,
// which avoids hydration mismatches from browser-only APIs (localStorage, window).
const ForumApp = dynamic(() => import('@/components/forum/App'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 font-sans text-sm">Loading forum…</p>
    </div>
  ),
});

export default function Home() {
  return <ForumApp />;
}
