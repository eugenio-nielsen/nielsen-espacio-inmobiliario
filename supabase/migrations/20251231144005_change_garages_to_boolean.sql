/*
  # Change garages field from integer to boolean

  1. Changes
    - Change `garages` column in `properties` table from integer to boolean
    - Set default value to false
    - Migrate existing data: garages > 0 becomes true, garages = 0 becomes false
    
  2. Details
    - Properties with one or more garages will have garages = true
    - Properties with no garages will have garages = false
    - This simplifies the field to a Yes/No question
*/

-- First, add a temporary boolean column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_garage boolean DEFAULT false;

-- Migrate existing data: if garages > 0, set has_garage to true
UPDATE properties SET has_garage = (garages > 0);

-- Drop the old garages column
ALTER TABLE properties DROP COLUMN IF EXISTS garages;

-- Rename the new column to garages
ALTER TABLE properties RENAME COLUMN has_garage TO garages;