/*
  # Create initial tables for BJP Himachal Pradesh News App

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `content` (text, required - post content)
      - `image_url` (text, optional - image or video URL)
      - `facebook_url` (text, optional - link to Facebook post)
      - `instagram_url` (text, optional - link to Instagram post)
      - `twitter_url` (text, optional - link to Twitter/X post)
      - `created_at` (timestamptz, default now)
      - `user_id` (uuid, optional - foreign key to auth.users)

    - `activities`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `type` (text, required - campaign/event/rally)
      - `start_date` (date, required)
      - `end_date` (date, optional)
      - `location` (text, required)
      - `description` (text, required)
      - `coordinator` (text, required)
      - `participants` (text, required)
      - `image_url` (text, optional)
      - `created_at` (timestamptz, default now)
      - `user_id` (uuid, optional)

    - `meetings`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `date` (date, required)
      - `time` (text, required)
      - `organizer` (text, required)
      - `meeting_link` (text, required)
      - `meeting_number` (text, required)
      - `password` (text, required)
      - `agenda` (text, required)
      - `attendees` (text[], default empty array)
      - `expected_attendees` (text[], default empty array)
      - `created_at` (timestamptz, default now)
      - `user_id` (uuid, optional)

  2. Security
    - Enable RLS on all tables
    - Add public SELECT policies (anyone can view)
    - Add public INSERT policies (anyone can create for now)
    - Add authenticated UPDATE/DELETE policies

  3. Important Notes
    - All image_url fields support both images and videos
    - user_id is optional to allow unauthenticated usage
    - RLS policies are permissive to allow admin functionality
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  image_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create posts"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  location text NOT NULL,
  description text NOT NULL,
  coordinator text NOT NULL,
  participants text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
  ON activities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create activities"
  ON activities
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  organizer text NOT NULL,
  meeting_link text NOT NULL,
  meeting_number text NOT NULL,
  password text NOT NULL,
  agenda text NOT NULL,
  attendees text[] DEFAULT '{}',
  expected_attendees text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meetings"
  ON meetings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create meetings"
  ON meetings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS activities_start_date_idx ON activities(start_date);
CREATE INDEX IF NOT EXISTS meetings_created_at_idx ON meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON meetings(date);