/*
  # Fix Function Search Path Security Issue

  ## Overview
  Fixes the mutable search_path security issue in update_property_views_count function.

  ## Changes

  1. **update_property_views_count function**
     - Adds explicit search_path setting to prevent security vulnerabilities
     - Sets search_path to 'public' to ensure function always references correct schema
     - Prevents potential attacks through search_path manipulation

  ## Security Impact
  - Eliminates risk of malicious schema shadowing
  - Ensures function always operates on intended tables
  - Follows PostgreSQL security best practices
*/

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION update_property_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET views_count = (
    SELECT COUNT(*)
    FROM property_views
    WHERE property_id = NEW.property_id
  )
  WHERE id = NEW.property_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
