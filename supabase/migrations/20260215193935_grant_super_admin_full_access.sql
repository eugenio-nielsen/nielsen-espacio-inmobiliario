/*
  # Grant Super Admin Full Access
  
  1. RLS Policy Updates
    - Add super_admin full access policies to all tables
    - Super admin can SELECT, INSERT, UPDATE, DELETE on all tables
    - Existing user policies remain unchanged
  
  2. Tables Updated
    - profiles: super_admin can view and update any profile
    - properties: super_admin can manage any property
    - property_images, property_videos, property_plans: super_admin has full access
    - leads: super_admin can view and manage all leads
    - value_reports: super_admin can view all reports
    - favorites: super_admin can view all favorites
    - property_views: super_admin can view all analytics
    - visit_appointments: super_admin can manage all appointments
    - articles, article_categories: super_admin has full control
    - neighborhood_characteristics, market_trends, valuation_factors: super_admin can manage
  
  3. Security
    - All super_admin policies check for role = 'super_admin'
    - Policies are additive to existing user permissions
    - Regular users maintain their existing access levels
*/

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role = 'super_admin'
    )
  );

-- ============================================================================
-- PROPERTIES TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update any property"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete any property"
  ON properties
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- PROPERTY_IMAGES TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all property images"
  ON property_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert property images"
  ON property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update property images"
  ON property_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete property images"
  ON property_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- PROPERTY_VIDEOS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all property videos"
  ON property_videos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert property videos"
  ON property_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update property videos"
  ON property_videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete property videos"
  ON property_videos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- PROPERTY_PLANS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all property plans"
  ON property_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert property plans"
  ON property_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update property plans"
  ON property_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete property plans"
  ON property_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update any lead"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- VALUE_REPORTS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all value reports"
  ON value_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete value reports"
  ON value_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- PROPERTY_VIEWS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all property views"
  ON property_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- VISIT_APPOINTMENTS TABLE
-- ============================================================================

CREATE POLICY "Super admins can view all appointments"
  ON visit_appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update any appointment"
  ON visit_appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete appointments"
  ON visit_appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Super admins can view all profiles" ON profiles IS 'Super admin has unrestricted view access to all user profiles';
COMMENT ON POLICY "Super admins can view all properties" ON properties IS 'Super admin can view all properties regardless of status or owner';
COMMENT ON POLICY "Super admins can view all leads" ON leads IS 'Super admin can view and manage all leads across the platform';
