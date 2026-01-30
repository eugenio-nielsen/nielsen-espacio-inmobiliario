/*
  # Fix RLS Performance and Cleanup Unused Indexes

  ## Changes

  1. **RLS Policy Performance Fix**
     - Updates the leads update policy to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of the auth function for each row, improving query performance

  2. **Remove Unused Indexes**
     - Drops indexes that have not been used based on database analysis
     - This improves write performance by reducing index maintenance overhead

  ## Security
  - RLS policies remain functionally identical, only performance is improved

  ## Notes
  - Multiple permissive policies on some tables are intentional for proper access control
  - Auth DB connection strategy and leaked password protection must be configured in Supabase Dashboard
*/

-- Fix the RLS policy for leads update to use optimized auth function call
DROP POLICY IF EXISTS "Property owners can update leads for their properties" ON leads;

CREATE POLICY "Property owners can update leads for their properties"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_articles_author_id;
DROP INDEX IF EXISTS idx_favorites_property_id;
DROP INDEX IF EXISTS idx_leads_report_id;
DROP INDEX IF EXISTS idx_leads_user_id;
DROP INDEX IF EXISTS idx_property_views_user_id;
DROP INDEX IF EXISTS idx_value_reports_property_id;
DROP INDEX IF EXISTS idx_properties_type;
DROP INDEX IF EXISTS idx_properties_city;
DROP INDEX IF EXISTS idx_properties_price;
DROP INDEX IF EXISTS idx_articles_category;
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_property_views_property_id;
