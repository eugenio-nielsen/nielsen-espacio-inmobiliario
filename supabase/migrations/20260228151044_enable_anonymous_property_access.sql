/*
  # Enable Anonymous Access to Active Properties

  1. Changes
    - Allow anonymous users to view active properties and their media (images, videos, plans)
    - Allow anonymous users to submit contact forms (leads) and schedule visits
    - Update view tracking to only record authenticated user views
    - Maintain existing access for authenticated users and super admins

  2. Security
    - Draft/pending properties remain hidden from anonymous users
    - Property owners can still view their own properties regardless of status
    - Super admins maintain full access to all properties
    - View tracking only counts authenticated user visits for accurate metrics

  3. Tables Affected
    - properties: Add anonymous SELECT policy for active properties
    - property_images: Add anonymous SELECT policy for active property images
    - property_videos: Add anonymous SELECT policy for active property videos
    - property_plans: Add anonymous SELECT policy for active property plans
    - leads: Update INSERT policy to allow anonymous users
    - visit_appointments: Update INSERT policy to allow anonymous users
    - record_property_view function: Skip tracking for anonymous users
*/

-- =============================================
-- 1. PROPERTIES TABLE - Allow Anonymous View
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "View active or own properties, super admins all" ON properties;

-- Create policy for anonymous users to view active properties
CREATE POLICY "Anonymous users can view active properties"
  ON properties FOR SELECT
  TO anon
  USING (status = 'active');

-- Create policy for authenticated users to view active properties or own properties
CREATE POLICY "Authenticated users can view active or own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR user_id = (SELECT auth.uid())
    OR is_super_admin()
  );

-- =============================================
-- 2. PROPERTY_IMAGES TABLE - Allow Anonymous View
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "View images of active or own properties, super admins all" ON property_images;

-- Create policy for anonymous users to view images of active properties
CREATE POLICY "Anonymous users can view active property images"
  ON property_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.status = 'active'
    )
  );

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can view active or own property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND (
        properties.status = 'active'
        OR properties.user_id = (SELECT auth.uid())
      )
    )
    OR is_super_admin()
  );

-- =============================================
-- 3. PROPERTY_VIDEOS TABLE - Allow Anonymous View
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "View videos of active or own properties, super admins all" ON property_videos;

-- Create policy for anonymous users to view videos of active properties
CREATE POLICY "Anonymous users can view active property videos"
  ON property_videos FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND properties.status = 'active'
    )
  );

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can view active or own property videos"
  ON property_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND (
        properties.status = 'active'
        OR properties.user_id = (SELECT auth.uid())
      )
    )
    OR is_super_admin()
  );

-- =============================================
-- 4. PROPERTY_PLANS TABLE - Allow Anonymous View
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "View plans of active or own properties, super admins all" ON property_plans;

-- Create policy for anonymous users to view plans of active properties
CREATE POLICY "Anonymous users can view active property plans"
  ON property_plans FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND properties.status = 'active'
    )
  );

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can view active or own property plans"
  ON property_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND (
        properties.status = 'active'
        OR properties.user_id = (SELECT auth.uid())
      )
    )
    OR is_super_admin()
  );

-- =============================================
-- 5. LEADS TABLE - Allow Anonymous Insert
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Create leads with valid data" ON leads;

-- Create policy for anonymous users to create leads
CREATE POLICY "Anonymous users can create leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    property_id IS NOT NULL
    AND name IS NOT NULL AND name <> ''
    AND email IS NOT NULL AND email <> ''
    AND message IS NOT NULL AND message <> ''
  );

-- Create policy for authenticated users to create leads
CREATE POLICY "Authenticated users can create leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IS NOT NULL
    AND name IS NOT NULL AND name <> ''
    AND email IS NOT NULL AND email <> ''
    AND message IS NOT NULL AND message <> ''
  );

-- =============================================
-- 6. VISIT_APPOINTMENTS TABLE - Allow Anonymous Insert
-- =============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Create appointments with valid data" ON visit_appointments;

-- Create policy for anonymous users to create visit appointments
CREATE POLICY "Anonymous users can create visit appointments"
  ON visit_appointments FOR INSERT
  TO anon
  WITH CHECK (
    property_id IS NOT NULL
    AND first_name IS NOT NULL AND first_name <> ''
    AND last_name IS NOT NULL AND last_name <> ''
    AND email IS NOT NULL AND email <> ''
    AND phone IS NOT NULL AND phone <> ''
    AND visit_date IS NOT NULL
    AND time_slots IS NOT NULL
  );

-- Create policy for authenticated users to create visit appointments
CREATE POLICY "Authenticated users can create visit appointments"
  ON visit_appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IS NOT NULL
    AND first_name IS NOT NULL AND first_name <> ''
    AND last_name IS NOT NULL AND last_name <> ''
    AND email IS NOT NULL AND email <> ''
    AND phone IS NOT NULL AND phone <> ''
    AND visit_date IS NOT NULL
    AND time_slots IS NOT NULL
  );

-- =============================================
-- 7. UPDATE VIEW TRACKING FUNCTION
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS record_property_view(uuid, uuid);

-- Recreate function to only track authenticated users
CREATE OR REPLACE FUNCTION record_property_view(
  p_property_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only record views for authenticated users
  IF p_user_id IS NOT NULL THEN
    INSERT INTO property_views (property_id, user_id, viewed_at)
    VALUES (p_property_id, p_user_id, now())
    ON CONFLICT (property_id, user_id, viewed_at)
    DO NOTHING;
  END IF;
END;
$$;