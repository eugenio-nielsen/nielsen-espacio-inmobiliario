/*
  # Add Apartment-Specific Fields

  1. Changes to properties table
    - Add `floor` (integer) - Floor number (1-25)
    - Add `layout` (text) - Apartment layout/disposition
    - Add `orientation` (text) - Apartment orientation
    - Add `expenses` (numeric) - Monthly expenses
    - Add `has_superintendent` (boolean) - Whether building has a superintendent

  2. Notes
    - These fields are nullable as they only apply to apartments
    - No security changes needed as existing RLS policies cover these fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'floor'
  ) THEN
    ALTER TABLE properties ADD COLUMN floor integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'layout'
  ) THEN
    ALTER TABLE properties ADD COLUMN layout text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'orientation'
  ) THEN
    ALTER TABLE properties ADD COLUMN orientation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'expenses'
  ) THEN
    ALTER TABLE properties ADD COLUMN expenses numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'has_superintendent'
  ) THEN
    ALTER TABLE properties ADD COLUMN has_superintendent boolean DEFAULT false;
  END IF;
END $$;