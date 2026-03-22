const STICKERS = ['🔥','💡','🎯','🚀','⭐','❓','✅','🧠','💬','👀','🎉','🤔'];

const PASTEL_COLORS = [
  'bg-red-100','bg-orange-100','bg-amber-100','bg-yellow-100',
  'bg-lime-100','bg-emerald-100','bg-teal-100','bg-cyan-100',
  'bg-sky-100','bg-blue-100','bg-violet-100','bg-pink-100',
];

export default function StickerPicker({ onSelect, onClose }) {
  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-muted">Choose a sticker</p>
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.map((sticker, i) => (
          <button
            key={sticker}
            onClick={() => { onSelect(sticker); onClose(); }}
            className={`flex h-14 w-full items-center justify-center rounded-lg text-2xl transition-transform duration-150 hover:scale-110 active:scale-95 ${PASTEL_COLORS[i]}`}
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
}
