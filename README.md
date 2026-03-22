# QnA Forum

A Product Management QnA forum built with Next.js 14, Supabase, and Claude AI for topic classification.

---

## Setup

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run the contents of `supabase/schema.sql`
3. Go to **Storage** → create a new bucket named `forum-attachments` → set it to **Public**
4. Go to **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Anthropic

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Copy it → `ANTHROPIC_API_KEY`

### 3. GIPHY (optional — for GIF picker)

1. Get a key at [developers.giphy.com](https://developers.giphy.com)
2. Copy it → `NEXT_PUBLIC_GIPHY_API_KEY`

### 4. Environment variables

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_GIPHY_API_KEY=...
```

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

```bash
# One-time: install Vercel CLI
npm i -g vercel

# Add secrets to Vercel (run each line and paste your value when prompted)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_GIPHY_API_KEY

# Deploy
vercel --prod
```

---

## Adding Lovable Components

1. Paste all Lovable component files into `components/forum/`
2. Make sure the root component is `components/forum/App.jsx`
3. Replace any `src/api/forum.js` Lovable stub with the real one already in this repo
4. Fix imports:
   - `axios` → native `fetch` (already handled in `src/api/forum.js`)
   - `react-router-dom` → `next/link` and `next/navigation`
   - Add `'use client'` to any component that uses `localStorage`, `window`, or browser event listeners
   - `<img>` → `next/image` `<Image>` for external URLs (already configured in `next.config.js`)

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/questions` | Submit a question (Claude classifies it) |
| `GET` | `/api/questions/recent` | Last 10 questions (all topics) |
| `GET` | `/api/questions/top` | Top 10 PM questions by upvotes |
| `POST` | `/api/questions/:id/upvote` | Toggle upvote (idempotent) |
| `GET` | `/api/questions/:id/comments` | List comments for a question |
| `POST` | `/api/questions/:id/comments` | Add a comment |
| `GET` | `/api/search?q=keyword` | Full-text + ILIKE search |
| `POST` | `/api/upload` | Upload image/GIF (max 5 MB) |

---

## Project Structure

```
app/
  api/                  Next.js API routes
    questions/
      route.js          POST — create question
      recent/route.js   GET  — recent questions
      top/route.js      GET  — top PM questions
      [id]/
        upvote/route.js    POST — toggle upvote
        comments/route.js  GET/POST — comments
    search/route.js     GET  — search
    upload/route.js     POST — file upload
  layout.jsx            Root layout (fonts, toaster)
  page.jsx              Renders Lovable <App />
  globals.css

components/
  forum/                ← paste Lovable components here
    App.jsx             ← root component expected here

lib/
  supabase.js           Browser + service-role clients

src/
  api/
    forum.js            API helper functions for Lovable components

supabase/
  schema.sql            Database schema + RLS policies
```
# qna-forum
