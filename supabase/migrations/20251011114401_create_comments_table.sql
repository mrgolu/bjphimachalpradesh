/*
  # Create Comments Table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `content_type` (text) - Type of content (post, activity, meeting)
      - `content_id` (uuid) - ID of the post/activity/meeting
      - `user_email` (text) - Email of the commenter
      - `user_name` (text) - Name of the commenter
      - `comment_text` (text) - The comment content
      - `created_at` (timestamptz) - When the comment was created

  2. Security
    - Enable RLS on `comments` table
    - Anyone can view comments
    - Only authenticated users can create comments
    - Users can only delete their own comments

  3. Indexes
    - Add index on content_type and content_id for efficient lookups
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('post', 'activity', 'meeting')),
  content_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (user_email = current_user_email());

CREATE INDEX IF NOT EXISTS idx_comments_content 
  ON comments(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_comments_created_at 
  ON comments(created_at DESC);
