/*
  # Add Semi-Covered Area Field

  ## Overview
  Adds the semi_covered_area field to properties and value_reports tables to support
  the three-field surface area structure: covered, semi-covered, and total area.

  ## Changes

  1. Properties Table
    - Add `semi_covered_area` (numeric) - Superficie semi/descubierta
    - Existing fields maintained: `covered_area`, `total_area`

  2. Value Reports Table
    - Add `semi_covered_area` (numeric) - Superficie semi/descubierta
    - Existing fields maintained: `covered_area`, `total_area`

  ## Notes
  - The total_area should be the sum of covered_area + semi_covered_area
  - All fields are nullable to allow partial data entry
  - No data migration needed as this is additive
*/

-- Add semi_covered_area to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'semi_covered_area'
  ) THEN
    ALTER TABLE properties ADD COLUMN semi_covered_area numeric;
  END IF;
END $$;

-- Add semi_covered_area to value_reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'value_reports' AND column_name = 'semi_covered_area'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN semi_covered_area numeric;
  END IF;
END $$;