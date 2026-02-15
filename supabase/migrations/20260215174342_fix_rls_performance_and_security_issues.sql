/*
  # Fix RLS Performance and Security Issues

  1. RLS Performance Optimizations
    - Update all policies to use (select auth.uid()) instead of auth.uid()
    - Update all policies to use (select auth.jwt()) instead of auth.jwt()
    - This evaluates the function once per query instead of per row

  2. Remove Unused Indexes
    - Drop indexes that are not being used to improve write performance
    - Indexes: articles, leads, property_views, visit_appointments, etc.

  3. Consolidate Multiple Permissive Policies
    - Simplify policies where multiple permissive policies exist
    - Make some policies restrictive where appropriate

  4. Fix Function Search Path
    - Set proper search path for security-definer functions
*/

-- ============================================================================
-- PART 1: Fix RLS Performance Issues
-- ============================================================================

-- article_categories: Fix "Admins can manage categories" policy
DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;
CREATE POLICY "Admins can manage categories"
  ON article_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- articles: Fix "Admins can view all articles" policy
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- articles: Fix "Admins can manage articles" policy
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
CREATE POLICY "Admins can manage articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- leads: Fix "Property owners and users can view leads" policy
DROP POLICY IF EXISTS "Property owners and users can view leads" ON leads;
CREATE POLICY "Property owners and users can view leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  );

-- leads: Fix "Property owners can update leads" policy
DROP POLICY IF EXISTS "Property owners can update leads" ON leads;
CREATE POLICY "Property owners can update leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  );

-- leads: Fix "Admins can manage all leads" policy
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;
CREATE POLICY "Admins can manage all leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- property_views: Fix "Property owners and admins can view analytics" policy
DROP POLICY IF EXISTS "Property owners and admins can view analytics" ON property_views;
CREATE POLICY "Property owners and admins can view analytics"
  ON property_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_views.property_id
      AND properties.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- visit_appointments: Fix "Property owners and users can view appointments" policy
DROP POLICY IF EXISTS "Property owners and users can view appointments" ON visit_appointments;
CREATE POLICY "Property owners and users can view appointments"
  ON visit_appointments
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  );

-- visit_appointments: Fix "Property owners can update appointments" policy
DROP POLICY IF EXISTS "Property owners can update appointments" ON visit_appointments;
CREATE POLICY "Property owners can update appointments"
  ON visit_appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (SELECT auth.uid())
    )
  );

-- visit_appointments: Fix "Admins can manage all appointments" policy
DROP POLICY IF EXISTS "Admins can manage all appointments" ON visit_appointments;
CREATE POLICY "Admins can manage all appointments"
  ON visit_appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- properties: Fix "View active properties or own properties" policy
DROP POLICY IF EXISTS "View active properties or own properties" ON properties;
CREATE POLICY "View active properties or own properties"
  ON properties
  FOR SELECT
  TO public
  USING (
    status = 'active' OR
    user_id = (SELECT auth.uid())
  );

-- property_images: Fix "View images of active properties or own properties" policy
DROP POLICY IF EXISTS "View images of active properties or own properties" ON property_images;
CREATE POLICY "View images of active properties or own properties"
  ON property_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND (properties.status = 'active' OR properties.user_id = (SELECT auth.uid()))
    )
  );

-- property_videos: Fix "View videos of active properties or own properties" policy
DROP POLICY IF EXISTS "View videos of active properties or own properties" ON property_videos;
CREATE POLICY "View videos of active properties or own properties"
  ON property_videos
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND (properties.status = 'active' OR properties.user_id = (SELECT auth.uid()))
    )
  );

-- property_plans: Fix "View plans of active properties or own properties" policy
DROP POLICY IF EXISTS "View plans of active properties or own properties" ON property_plans;
CREATE POLICY "View plans of active properties or own properties"
  ON property_plans
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND (properties.status = 'active' OR properties.user_id = (SELECT auth.uid()))
    )
  );

-- neighborhood_characteristics: Fix "Only admins can insert neighborhood data" policy
DROP POLICY IF EXISTS "Only admins can insert neighborhood data" ON neighborhood_characteristics;
CREATE POLICY "Only admins can insert neighborhood data"
  ON neighborhood_characteristics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- neighborhood_characteristics: Fix "Only admins can update neighborhood data" policy
DROP POLICY IF EXISTS "Only admins can update neighborhood data" ON neighborhood_characteristics;
CREATE POLICY "Only admins can update neighborhood data"
  ON neighborhood_characteristics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- market_trends: Fix "Only admins can insert market trends" policy
DROP POLICY IF EXISTS "Only admins can insert market trends" ON market_trends;
CREATE POLICY "Only admins can insert market trends"
  ON market_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- valuation_factors: Fix "Only admins can modify valuation factors" policy
DROP POLICY IF EXISTS "Only admins can modify valuation factors" ON valuation_factors;
CREATE POLICY "Only admins can modify valuation factors"
  ON valuation_factors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 2: Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_articles_author_id;
DROP INDEX IF EXISTS idx_articles_category_id;
DROP INDEX IF EXISTS idx_leads_report_id;
DROP INDEX IF EXISTS idx_leads_user_id;
DROP INDEX IF EXISTS idx_property_views_property_id;
DROP INDEX IF EXISTS idx_property_views_user_id;
DROP INDEX IF EXISTS idx_visit_appointments_user_id;
DROP INDEX IF EXISTS idx_visit_appointments_visit_date;
DROP INDEX IF EXISTS idx_neighborhood_chars_location;
DROP INDEX IF EXISTS idx_market_trends_location;
DROP INDEX IF EXISTS idx_market_trends_period;
DROP INDEX IF EXISTS idx_valuation_factors_active;
DROP INDEX IF EXISTS idx_property_images_is_primary;

-- ============================================================================
-- PART 3: Fix Function Search Path
-- ============================================================================

CREATE OR REPLACE FUNCTION update_property_images_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: Consolidate Multiple Permissive Policies (Make Some Restrictive)
-- ============================================================================

-- For article_categories, make admin policy restrictive so it doesn't interfere with public view
DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;
CREATE POLICY "Admins can manage categories"
  ON article_categories
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- For valuation_factors SELECT, keep "Anyone can view" and remove redundant admin SELECT in modify policy
DROP POLICY IF EXISTS "Only admins can modify valuation factors" ON valuation_factors;
CREATE POLICY "Only admins can modify valuation factors"
  ON valuation_factors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update valuation factors"
  ON valuation_factors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete valuation factors"
  ON valuation_factors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Admins can manage categories" ON article_categories IS 'Restrictive policy ensuring only admins can manage categories';
COMMENT ON POLICY "Property owners and users can view leads" ON leads IS 'Optimized to evaluate auth.uid() once per query';
COMMENT ON POLICY "View active properties or own properties" ON properties IS 'Optimized to evaluate auth.uid() once per query';
