/*
  # Add RC Number to Profiles

  ## Changes
  1. Add `rc_number` column to profiles table
     - Optional for farmers and laborers
     - Required for tractor owners (enforced at application level)
  
  2. Purpose
     - Store Registration Certificate number for tractor owners
     - Available for all user types but primarily used by tractor owners
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rc_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rc_number text;
  END IF;
END $$;