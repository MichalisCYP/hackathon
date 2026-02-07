-- Create comments table for post comments feature
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomination_id BIGINT NOT NULL REFERENCES nominations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_nomination_id ON comments(nomination_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create comment_likes table for liking comments
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable Row Level Security
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comment likes
CREATE POLICY "Anyone can read comment likes" ON comment_likes
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own likes
CREATE POLICY "Users can insert their own likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete their own likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);
