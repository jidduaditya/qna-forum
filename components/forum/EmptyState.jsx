export default function EmptyState({ type, keyword }) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl">🔍</span>
        <p className="mt-3 text-sm text-muted">
          No questions found for &ldquo;<strong className="text-foreground">{keyword}</strong>&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-accent">
        <rect x="10" y="20" width="60" height="40" rx="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M30 60 L25 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <text x="40" y="46" textAnchor="middle" fill="currentColor" fontSize="22" fontFamily="Fraunces">?</text>
      </svg>
      <p className="mt-4 font-display text-lg font-semibold text-primary">Be the first to ask a question!</p>
      <p className="mt-1 text-sm text-muted">Your question could spark a great discussion.</p>
    </div>
  );
}
