'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bold, Smile, ImageIcon, Sticker, X, Loader2, Check } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import ImageUpload from './ImageUpload';

export default function HeroAskSection({ onPost }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [openPanel, setOpenPanel] = useState(null);
  const [submitState, setSubmitState] = useState('idle');
  const textareaRef = useRef(null);

  const handleSubmit = async () => {
    if (!text.trim() && attachments.length === 0) return;
    setSubmitState('loading');
    try {
      await onPost({ text, attachments });
      setSubmitState('success');
      setTimeout(() => {
        setText('');
        setAttachments([]);
        setSubmitState('idle');
      }, 1500);
    } catch {
      setSubmitState('idle');
    }
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const addAttachment = (att) => setAttachments((prev) => [...prev, att]);
  const togglePanel = (panel) => setOpenPanel((prev) => (prev === panel ? null : panel));

  const toolbarButtons = [
    { id: 'bold', icon: Bold, label: 'Bold', action: () => setText((p) => p + '**bold**') },
    { id: 'emoji', icon: Smile, label: 'Emoji', action: () => togglePanel('emoji') },
    { id: 'image', icon: ImageIcon, label: 'Image/GIF', action: () => togglePanel('image') },
    { id: 'sticker', icon: Sticker, label: 'Sticker', action: () => togglePanel('sticker') },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[720px] px-4 pb-8 pt-10"
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 font-display text-[26px] font-semibold text-primary md:text-[36px]"
      >
        What do you want to clarify?
      </motion.h2>

      <div className="rounded-xl border border-border bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        {/* Toolbar */}
        <div className="relative flex items-center gap-1 border-b border-border px-3 py-2">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.action}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-accent-light active:scale-95 ${
                openPanel === btn.id ? 'bg-accent-light text-accent' : 'text-muted'
              }`}
              title={btn.label}
            >
              <btn.icon size={16} />
            </button>
          ))}

          {openPanel === 'emoji' && (
            <EmojiPicker onSelect={insertEmoji} onClose={() => setOpenPanel(null)} />
          )}
          {openPanel === 'image' && (
            <ImageUpload onAttach={addAttachment} onClose={() => setOpenPanel(null)} />
          )}
          {openPanel === 'sticker' && (
            <StickerPicker
              onSelect={(emoji) => addAttachment({ type: 'sticker', url: '', emoji })}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question here... emojis, images & GIFs welcome!"
          className="min-h-[100px] w-full resize-none bg-transparent px-4 py-3 text-[15px] text-foreground placeholder:text-muted outline-none"
        />

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="group relative">
                {att.type === 'sticker' ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent-light text-2xl">
                    {att.emoji}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={att.url} alt="attachment" className="h-14 w-14 rounded-lg object-cover" />
                )}
                <button
                  onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-xs text-muted">{text.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={submitState !== 'idle' || (!text.trim() && attachments.length === 0)}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${
              submitState === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-px'
            } w-full md:w-auto`}
          >
            {submitState === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {submitState === 'success' && <Check size={16} />}
            {submitState === 'idle' && 'Post Question →'}
            {submitState === 'loading' && 'Posting...'}
            {submitState === 'success' && 'Posted!'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
