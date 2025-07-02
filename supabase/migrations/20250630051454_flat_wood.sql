/*
  # Create gallery items table

  1. New Tables
    - `gallery_items`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `url` (text, required - URL to the image/video)
      - `type` (text, required - 'image' or 'video')
      - `category` (text, required - for organization)
      - `tags` (text array, for searchability)
      - `date` (date, when the photo/video was taken)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `gallery_items` table
    - Add policy for public to read gallery items
    - Add policy for authenticated users to create/update/delete their own items
*/

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  category text NOT NULL DEFAULT 'Other',
  tags text[] DEFAULT '{}',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery items"
  ON gallery_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create gallery items"
  ON gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gallery items"
  ON gallery_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gallery items"
  ON gallery_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS gallery_items_type_idx ON gallery_items(type);
CREATE INDEX IF NOT EXISTS gallery_items_category_idx ON gallery_items(category);
CREATE INDEX IF NOT EXISTS gallery_items_date_idx ON gallery_items(date);
CREATE INDEX IF NOT EXISTS gallery_items_created_at_idx ON gallery_items(created_at);
CREATE INDEX IF NOT EXISTS gallery_items_tags_idx ON gallery_items USING GIN(tags);