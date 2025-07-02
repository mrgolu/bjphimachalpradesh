/*
  # Add start and end date to activities table

  1. Changes
    - Rename existing `date` column to `start_date` for clarity
    - Add `end_date` column for events that span multiple days
    - Update existing data to use start_date

  2. Notes
    - For single-day activities, end_date can be null or same as start_date
    - For multi-day events, end_date will be different from start_date
*/

-- Add end_date column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE activities ADD COLUMN end_date date;
  END IF;
END $$;

-- Rename date column to start_date for clarity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE activities RENAME COLUMN date TO start_date;
  END IF;
END $$;