'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadAttachment } from '@/src/api/forum';

export default function ImageUpload({ onAttach, onClose }) {
  const [tab, setTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const { url } = await uploadAttachment(file);
      onAttach({ type: file.type.includes('gif') ? 'gif' : 'image', url });
      onClose();
    } catch {
      setError('Upload failed — try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
      <div className="mb-3 flex gap-1 rounded-md bg-background p-0.5">
        {['upload', 'gif'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              tab === t ? 'bg-surface text-foreground shadow-sm' : 'text-muted'
            }`}
          >
            {t === 'upload' ? 'Upload' : 'GIF Search'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 transition-colors duration-150 hover:border-accent hover:bg-accent-light/50 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-accent" />
          ) : (
            <Upload size={20} className="text-muted" />
          )}
          <span className="text-xs text-muted">
            {uploading ? 'Uploading…' : 'Click to upload image or GIF'}
          </span>
          <input type="file" accept="image/*,.gif" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Search GIPHY..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <p className="mt-2 text-center text-xs text-muted">GIF search requires NEXT_PUBLIC_GIPHY_API_KEY</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <button onClick={onClose} className="absolute right-2 top-2 rounded-full p-1 text-muted transition-colors hover:bg-background">
        <X size={14} />
      </button>
    </div>
  );
}
