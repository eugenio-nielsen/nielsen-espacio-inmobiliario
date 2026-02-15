/*
  # Fix security and performance issues - comprehensive cleanup

  1. Indexes
    - Add missing foreign key indexes on articles, leads, property_views, visit_appointments
    - Drop unused indexes on admin_notifications and audit_log

  2. Policy Consolidation
    - Merge multiple permissive policies per table/action into single policies
    - This covers: profiles, properties, property_images, property_videos, property_plans,
      favorites, leads, articles, article_categories, property_views, value_reports,
      visit_appointments
    - Replace remaining direct `profiles` table references in policies with helper functions

  3. Performance
    - Use `(select auth.uid())` instead of `auth.uid()` in all policies to avoid per-row re-evaluation

  4. Security
    - Fix always-true INSERT policies on admin_notifications and audit_log
    - Restrict to is_super_admin() since service_role bypasses RLS anyway
*/

-- =============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_leads_report_id ON leads(report_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_user_id ON visit_appointments(user_id);

-- =============================================
-- 2. DROP UNUSED INDEXES
-- =============================================

DROP INDEX IF EXISTS idx_admin_notifications_type;
DROP INDEX IF EXISTS idx_admin_notifications_created_at;
DROP INDEX IF EXISTS idx_admin_notifications_read;
DROP INDEX IF EXISTS idx_admin_notifications_user;
DROP INDEX IF EXISTS idx_admin_notifications_property;
DROP INDEX IF EXISTS idx_admin_notifications_lead;
DROP INDEX IF EXISTS idx_audit_log_admin_id;
DROP INDEX IF EXISTS idx_audit_log_action_type;
DROP INDEX IF EXISTS idx_audit_log_created_at;
DROP INDEX IF EXISTS idx_audit_log_entity;
DROP INDEX IF EXISTS idx_audit_log_affected_user;

-- =============================================
-- 3. FIX admin_notifications POLICIES
-- =============================================

DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
CREATE POLICY "Super admins can insert notifications"
  ON admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- =============================================
-- 4. FIX audit_log POLICIES
-- =============================================

DROP POLICY IF EXISTS "System can insert audit entries" ON audit_log;
CREATE POLICY "Super admins can insert audit entries"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- =============================================
-- 5. CONSOLIDATE profiles POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile or super admins all"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id OR is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can update own profile or super admins any"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id OR is_super_admin())
  WITH CHECK ((select auth.uid()) = id OR is_super_admin());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- 6. CONSOLIDATE properties POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all properties" ON properties;
DROP POLICY IF EXISTS "View active properties or own properties" ON properties;
CREATE POLICY "View active or own properties, super admins all"
  ON properties FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR user_id = (select auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties or super admins any"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Super admins can update any property" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties or super admins any"
  ON properties FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin())
  WITH CHECK (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete any property" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties or super admins any"
  ON properties FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin());

-- =============================================
-- 7. CONSOLIDATE property_images POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property images" ON property_images;
DROP POLICY IF EXISTS "View images of active properties or own properties" ON property_images;
CREATE POLICY "View images of active or own properties, super admins all"
  ON property_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND (properties.status = 'active' OR properties.user_id = (select auth.uid()))
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can insert property images" ON property_images;
DROP POLICY IF EXISTS "Users can manage own property images" ON property_images;
CREATE POLICY "Users can insert own property images or super admins any"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can update property images" ON property_images;
DROP POLICY IF EXISTS "Users can update own property images" ON property_images;
CREATE POLICY "Users can update own property images or super admins any"
  ON property_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can delete property images" ON property_images;
DROP POLICY IF EXISTS "Users can delete own property images" ON property_images;
CREATE POLICY "Users can delete own property images or super admins any"
  ON property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

-- =============================================
-- 8. CONSOLIDATE property_videos POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property videos" ON property_videos;
DROP POLICY IF EXISTS "View videos of active properties or own properties" ON property_videos;
CREATE POLICY "View videos of active or own properties, super admins all"
  ON property_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND (properties.status = 'active' OR properties.user_id = (select auth.uid()))
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can insert property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can insert own property videos" ON property_videos;
CREATE POLICY "Users can insert own property videos or super admins any"
  ON property_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can update property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can update own property videos" ON property_videos;
CREATE POLICY "Users can update own property videos or super admins any"
  ON property_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can delete property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can delete own property videos" ON property_videos;
CREATE POLICY "Users can delete own property videos or super admins any"
  ON property_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

-- =============================================
-- 9. CONSOLIDATE property_plans POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all property plans" ON property_plans;
DROP POLICY IF EXISTS "View plans of active properties or own properties" ON property_plans;
CREATE POLICY "View plans of active or own properties, super admins all"
  ON property_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND (properties.status = 'active' OR properties.user_id = (select auth.uid()))
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can insert property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can insert own property plans" ON property_plans;
CREATE POLICY "Users can insert own property plans or super admins any"
  ON property_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can update property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can update own property plans" ON property_plans;
CREATE POLICY "Users can update own property plans or super admins any"
  ON property_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can delete property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can delete own property plans" ON property_plans;
CREATE POLICY "Users can delete own property plans or super admins any"
  ON property_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_plans.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_super_admin()
  );

-- =============================================
-- 10. CONSOLIDATE favorites POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites or super admins all"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites or super admins any"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin());

-- =============================================
-- 11. CONSOLIDATE leads POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;
DROP POLICY IF EXISTS "Super admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Property owners and users can view leads" ON leads;
DROP POLICY IF EXISTS "Super admins can update any lead" ON leads;
DROP POLICY IF EXISTS "Property owners can update leads" ON leads;
DROP POLICY IF EXISTS "Super admins can delete leads" ON leads;
DROP POLICY IF EXISTS "Anyone can create leads with valid data" ON leads;

CREATE POLICY "View own or property leads, admins all"
  ON leads FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Create leads with valid data"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      name IS NOT NULL AND name <> ''
      AND email IS NOT NULL AND email <> ''
      AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      AND lead_type IS NOT NULL
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Property owners can update leads, admins all"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- 12. CONSOLIDATE article_categories POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON article_categories;

CREATE POLICY "Anyone can view categories"
  ON article_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON article_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Admins can update categories"
  ON article_categories FOR UPDATE
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Admins can delete categories"
  ON article_categories FOR DELETE
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- 13. CONSOLIDATE articles POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;

CREATE POLICY "View published articles or admins all"
  ON articles FOR SELECT
  TO authenticated
  USING (status = 'published' OR is_admin_or_super_admin());

CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (is_admin_or_super_admin())
  WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- 14. CONSOLIDATE property_views POLICIES
-- =============================================

DROP POLICY IF EXISTS "Property owners and admins can view analytics" ON property_views;
DROP POLICY IF EXISTS "Super admins can view all property views" ON property_views;
DROP POLICY IF EXISTS "Anyone can insert property views with valid property" ON property_views;

CREATE POLICY "Property owners or admins can view analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_views.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Anyone can insert views for active properties"
  ON property_views FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_views.property_id
      AND properties.status = 'active'
    )
  );

-- =============================================
-- 15. CONSOLIDATE value_reports POLICIES
-- =============================================

DROP POLICY IF EXISTS "Super admins can view all value reports" ON value_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON value_reports;
DROP POLICY IF EXISTS "Super admins can delete value reports" ON value_reports;
DROP POLICY IF EXISTS "Users can create reports" ON value_reports;

CREATE POLICY "Users can view own reports or super admins all"
  ON value_reports FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin());

CREATE POLICY "Users can create own reports"
  ON value_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Super admins can delete reports"
  ON value_reports FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- =============================================
-- 16. CONSOLIDATE visit_appointments POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can manage all appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Super admins can view all appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Property owners and users can view appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Super admins can update any appointment" ON visit_appointments;
DROP POLICY IF EXISTS "Property owners can update appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Super admins can delete appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Anyone can create visit appointments with valid data" ON visit_appointments;

CREATE POLICY "View own or property appointments, admins all"
  ON visit_appointments FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Create appointments with valid data"
  ON visit_appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      property_id IS NOT NULL
      AND first_name IS NOT NULL AND first_name <> ''
      AND last_name IS NOT NULL AND last_name <> ''
      AND email IS NOT NULL AND email <> ''
      AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      AND phone IS NOT NULL AND phone <> ''
      AND visit_date IS NOT NULL
      AND time_slots IS NOT NULL AND array_length(time_slots, 1) > 0
      AND EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = visit_appointments.property_id
        AND properties.status = 'active'
      )
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Property owners can update appointments, admins all"
  ON visit_appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = (select auth.uid())
    )
    OR is_admin_or_super_admin()
  );

CREATE POLICY "Admins can delete appointments"
  ON visit_appointments FOR DELETE
  TO authenticated
  USING (is_admin_or_super_admin());

-- =============================================
-- 17. FIX remaining direct profiles references
-- =============================================

DROP POLICY IF EXISTS "Only admins can insert market trends" ON market_trends;
CREATE POLICY "Only admins can insert market trends"
  ON market_trends FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Only admins can insert neighborhood data" ON neighborhood_characteristics;
CREATE POLICY "Only admins can insert neighborhood data"
  ON neighborhood_characteristics FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_super_admin());

DROP POLICY IF EXISTS "Only admins can modify valuation factors" ON valuation_factors;
CREATE POLICY "Only admins can insert valuation factors"
  ON valuation_factors FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_super_admin());