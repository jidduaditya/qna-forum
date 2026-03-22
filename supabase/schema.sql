-- QnA Forum Schema
-- Run this in your Supabase SQL editor after creating a new project.

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  rich_content JSONB,                            -- stores formatted text, inline emojis
  attachments JSONB DEFAULT '[]',                -- [{type: 'image'|'gif'|'sticker', url: string}]
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pm_topic BOOLEAN DEFAULT false,
  classification_reason TEXT,                    -- why Claude classified it as PM or not
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upvote tracking (prevent double votes per session)
CREATE TABLE upvote_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,                      -- anonymous session fingerprint
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, session_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  commenter_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_upvotes ON questions(upvotes DESC)
  WHERE is_pm_topic = true;
CREATE INDEX idx_comments_question_id ON comments(question_id);

-- RLS Policies (public read/write for anonymous access)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvote_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public insert questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update upvotes" ON questions FOR UPDATE USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert upvote session" ON upvote_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read upvote session" ON upvote_sessions
  FOR SELECT USING (true);
CREATE POLICY "Public delete upvote session" ON upvote_sessions
  FOR DELETE USING (true);
