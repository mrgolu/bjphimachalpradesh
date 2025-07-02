/*
  # Create live sessions table

  1. New Tables
    - `live_sessions`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `host_name` (text, required)
      - `participants` (text array, for participant names)
      - `start_time` (timestamptz, when live session starts)
      - `end_time` (timestamptz, when live session ends)
      - `status` (text, live/scheduled/ended)
      - `viewer_count` (integer, current viewers)
      - `meeting_link` (text, optional meeting link)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `live_sessions` table
    - Add policy for public to read live sessions
    - Add policy for authenticated users to create/update their own sessions
*/

CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  host_name text NOT NULL,
  participants text[] DEFAULT '{}',
  start_time timestamptz,
  end_time timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  viewer_count integer DEFAULT 0,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live sessions"
  ON live_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create live sessions"
  ON live_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live sessions"
  ON live_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live sessions"
  ON live_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);