/*
  # Fix infinite recursion in profiles RLS policies

  1. Changes
    - Create `is_super_admin()` SECURITY DEFINER function that checks the user's role without triggering RLS
    - Create `is_admin()` SECURITY DEFINER function similarly
    - Replace all policies that do `EXISTS (SELECT 1 FROM profiles WHERE ...)` with calls to these functions
    - This eliminates the circular dependency causing infinite recursion

  2. Security
    - Functions use SECURITY DEFINER to bypass RLS only for the role check
    - Functions are owned by postgres and have restricted search_path
    - All existing access patterns are preserved
*/

-- Create helper function to check if current user is super_admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Create helper function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create helper function to check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- =============================================
-- Fix profiles table policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
CREATE POLICY "Super admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- =============================================
-- Fix admin_notifications policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all notifications" ON admin_notifications;
CREATE POLICY "Super admins can view all notifications"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update notifications" ON admin_notifications;
CREATE POLICY "Super admins can update notifications"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- =============================================
-- Fix audit_log policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view audit log" ON audit_log;
CREATE POLICY "Super admins can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix article_categories policies
-- =============================================

DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;
CREATE POLICY "Admins can manage categories"
  ON article_categories FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- Fix articles policies
-- =============================================

DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- Fix favorites policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all favorites" ON favorites;
CREATE POLICY "Super admins can view all favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete favorites" ON favorites;
CREATE POLICY "Super admins can delete favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix leads policies
-- =============================================

DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;
CREATE POLICY "Admins can manage all leads"
  ON leads FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Super admins can view all leads" ON leads;
CREATE POLICY "Super admins can view all leads"
  ON leads FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any lead" ON leads;
CREATE POLICY "Super admins can update any lead"
  ON leads FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete leads" ON leads;
CREATE POLICY "Super admins can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix properties policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all properties" ON properties;
CREATE POLICY "Super admins can view all properties"
  ON properties FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any property" ON properties;
CREATE POLICY "Super admins can update any property"
  ON properties FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete any property" ON properties;
CREATE POLICY "Super admins can delete any property"
  ON properties FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix property_images policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property images" ON property_images;
CREATE POLICY "Super admins can view all property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update property images" ON property_images;
CREATE POLICY "Super admins can update property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete property images" ON property_images;
CREATE POLICY "Super admins can delete property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix property_videos policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property videos" ON property_videos;
CREATE POLICY "Super admins can view all property videos"
  ON property_videos FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update property videos" ON property_videos;
CREATE POLICY "Super admins can update property videos"
  ON property_videos FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete property videos" ON property_videos;
CREATE POLICY "Super admins can delete property videos"
  ON property_videos FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix property_plans policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property plans" ON property_plans;
CREATE POLICY "Super admins can view all property plans"
  ON property_plans FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update property plans" ON property_plans;
CREATE POLICY "Super admins can update property plans"
  ON property_plans FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete property plans" ON property_plans;
CREATE POLICY "Super admins can delete property plans"
  ON property_plans FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix property_views policies
-- =============================================

DROP POLICY IF EXISTS "Property owners and admins can view analytics" ON property_views;
CREATE POLICY "Property owners and admins can view analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_views.property_id
      AND properties.user_id = auth.uid()
    )
    OR is_admin_or_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can view all property views" ON property_views;
CREATE POLICY "Super admins can view all property views"
  ON property_views FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix neighborhood_characteristics policies
-- =============================================

DROP POLICY IF EXISTS "Only admins can update neighborhood data" ON neighborhood_characteristics;
CREATE POLICY "Only admins can update neighborhood data"
  ON neighborhood_characteristics FOR UPDATE
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

-- =============================================
-- Fix valuation_factors policies
-- =============================================

DROP POLICY IF EXISTS "Only admins can update valuation factors" ON valuation_factors;
CREATE POLICY "Only admins can update valuation factors"
  ON valuation_factors FOR UPDATE
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Only admins can delete valuation factors" ON valuation_factors;
CREATE POLICY "Only admins can delete valuation factors"
  ON valuation_factors FOR DELETE
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- Fix value_reports policies
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all value reports" ON value_reports;
CREATE POLICY "Super admins can view all value reports"
  ON value_reports FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete value reports" ON value_reports;
CREATE POLICY "Super admins can delete value reports"
  ON value_reports FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- Fix visit_appointments policies
-- =============================================

DROP POLICY IF EXISTS "Admins can manage all appointments" ON visit_appointments;
CREATE POLICY "Admins can manage all appointments"
  ON visit_appointments FOR ALL
  TO authenticated
  USING (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Super admins can view all appointments" ON visit_appointments;
CREATE POLICY "Super admins can view all appointments"
  ON visit_appointments FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any appointment" ON visit_appointments;
CREATE POLICY "Super admins can update any appointment"
  ON visit_appointments FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete appointments" ON visit_appointments;
CREATE POLICY "Super admins can delete appointments"
  ON visit_appointments FOR DELETE
  TO authenticated
  USING (is_super_admin());