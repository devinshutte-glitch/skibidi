-- Skibidi App Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('child', 'parent')),
  pin_hash TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'surfer_girl',
  age INTEGER,
  colour_theme TEXT NOT NULL DEFAULT 'ocean',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question bank
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('maths', 'vocab', 'bible')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  answer_given TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly scores
CREATE TABLE IF NOT EXISTS weekly_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  maths_points INTEGER NOT NULL DEFAULT 0,
  vocab_points INTEGER NOT NULL DEFAULT 0,
  bible_points INTEGER NOT NULL DEFAULT 0,
  questions_completed INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  week_winner BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, week_number, year)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_week INTEGER
);

-- Indexes for performance
CREATE INDEX idx_questions_user_week ON question_bank(user_id, week_number, year);
CREATE INDEX idx_answers_user_week ON answers(user_id, week_number);
CREATE INDEX idx_weekly_scores_user ON weekly_scores(user_id);
CREATE INDEX idx_badges_user ON badges(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses all)
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON question_bank FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON answers FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON weekly_scores FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON badges FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON streaks FOR ALL USING (true);

-- Anonymous read for the PIN-based auth flow
CREATE POLICY "Anon can read users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read questions" ON question_bank FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read answers" ON answers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read scores" ON weekly_scores FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read badges" ON badges FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read streaks" ON streaks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert answers" ON answers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can upsert scores" ON weekly_scores FOR ALL TO anon USING (true);
