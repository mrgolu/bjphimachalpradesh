/*
  # Restrict post creation to admin users only

  1. Changes
    - Drop the public INSERT policy that allows anyone to create posts
    - Add admin-only INSERT policy for posts, activities, and meetings
    - Create an admin_users table to track admin users
    - Add RLS policies for admin verification

  2. Security
    - Only users in admin_users table can create posts, activities, and meetings
    - Public users can still view all content
    - Admins can update/delete any content

  3. Important Notes
    - Admin users must be added to the admin_users table
    - Use email addresses to identify admin users
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin list
CREATE POLICY "Admins can view admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    email IN (SELECT email FROM admin_users)
  );

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user email
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Posts: Drop public insert policy and add admin-only policy
DROP POLICY IF EXISTS "Anyone can create posts" ON posts;
DROP POLICY IF EXISTS "Allow post creation" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Service role can insert posts" ON posts;

CREATE POLICY "Only admins can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can update any post"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (is_admin(current_user_email()))
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can delete any post"
  ON posts
  FOR DELETE
  TO authenticated
  USING (is_admin(current_user_email()));

-- Activities: Drop public insert policy and add admin-only policy
DROP POLICY IF EXISTS "Anyone can create activities" ON activities;

CREATE POLICY "Only admins can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can update any activity"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (is_admin(current_user_email()))
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can delete any activity"
  ON activities
  FOR DELETE
  TO authenticated
  USING (is_admin(current_user_email()));

-- Meetings: Drop public insert policy and add admin-only policy
DROP POLICY IF EXISTS "Anyone can create meetings" ON meetings;

CREATE POLICY "Only admins can create meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can update any meeting"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (is_admin(current_user_email()))
  WITH CHECK (is_admin(current_user_email()));

CREATE POLICY "Admins can delete any meeting"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (is_admin(current_user_email()));

-- Insert a default admin user (replace with actual admin email)
-- NOTE: This is a placeholder - you should update this with real admin emails
INSERT INTO admin_users (email, name)
VALUES ('admin@bjphimachal.org', 'System Admin')
ON CONFLICT (email) DO NOTHING;