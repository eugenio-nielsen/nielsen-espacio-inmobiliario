/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Indexes for Performance
  - Add index on `articles.author_id` for author queries
  - Add index on `leads.report_id` for report-related lead queries
  - Add index on `leads.user_id` for user lead queries
  - Add index on `property_views.user_id` for user analytics
  - Add index on `visit_appointments.user_id` for user appointment queries
  - Add index on `visit_appointments.visit_date` for date-based queries
  - Add index on `visit_appointments.property_id` for property appointment queries

  ### 2. Consolidate Permissive RLS Policies
  - Merge overlapping SELECT policies into single policies with OR conditions
  - This improves clarity while maintaining the same security model

  ### 3. Add Validation to Open INSERT Policies
  - Add basic checks to prevent abuse while keeping public access
  - Validate required fields in WITH CHECK clauses

  ## Security Notes
  - Multiple permissive policies are intentional for OR logic
  - Open INSERT policies are needed for lead generation
  - All policies maintain proper access control
*/

-- Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_leads_report_id ON leads(report_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_user_id ON visit_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_visit_date ON visit_appointments(visit_date);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_property_id ON visit_appointments(property_id);

-- Drop and recreate consolidated policies for article_categories
DROP POLICY IF EXISTS "Anyone can view categories" ON article_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;

CREATE POLICY "Anyone can view categories"
  ON article_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON article_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop and recreate consolidated policies for articles
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;

CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop and recreate policies for leads with validation
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Property owners can view leads for their properties" ON leads;
DROP POLICY IF EXISTS "Users can view own submitted leads" ON leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;

CREATE POLICY "Anyone can create leads with valid data"
  ON leads FOR INSERT
  WITH CHECK (
    name IS NOT NULL AND 
    name != '' AND
    email IS NOT NULL AND 
    email != '' AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    lead_type IS NOT NULL
  );

CREATE POLICY "Property owners and users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all leads"
  ON leads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop and recreate policies for property_views with validation
DROP POLICY IF EXISTS "Anyone can insert property views" ON property_views;
DROP POLICY IF EXISTS "Property owners can view their property analytics" ON property_views;
DROP POLICY IF EXISTS "Admins can view all analytics" ON property_views;

CREATE POLICY "Anyone can insert property views with valid property"
  ON property_views FOR INSERT
  WITH CHECK (
    property_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND status = 'active'
    )
  );

CREATE POLICY "Property owners and admins can view analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_views.property_id 
      AND properties.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop and recreate policies for visit_appointments with validation
DROP POLICY IF EXISTS "Anyone can create visit appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Property owners can view their property appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON visit_appointments;

CREATE POLICY "Anyone can create visit appointments with valid data"
  ON visit_appointments FOR INSERT
  WITH CHECK (
    property_id IS NOT NULL AND
    first_name IS NOT NULL AND first_name != '' AND
    last_name IS NOT NULL AND last_name != '' AND
    email IS NOT NULL AND email != '' AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    phone IS NOT NULL AND phone != '' AND
    visit_date IS NOT NULL AND
    time_slots IS NOT NULL AND array_length(time_slots, 1) > 0 AND
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND status = 'active'
    )
  );

CREATE POLICY "Property owners and users can view appointments"
  ON visit_appointments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = visit_appointments.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update appointments"
  ON visit_appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = visit_appointments.property_id 
      AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = visit_appointments.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all appointments"
  ON visit_appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Consolidate properties policies
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
DROP POLICY IF EXISTS "Users can view own properties" ON properties;

CREATE POLICY "View active properties or own properties"
  ON properties FOR SELECT
  USING (
    status = 'active' OR 
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Consolidate property_images policies
DROP POLICY IF EXISTS "Anyone can view images of active properties" ON property_images;
DROP POLICY IF EXISTS "Users can view own property images" ON property_images;

CREATE POLICY "View images of active properties or own properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND (properties.status = 'active' OR (auth.uid() IS NOT NULL AND properties.user_id = auth.uid()))
    )
  );

-- Consolidate property_videos policies
DROP POLICY IF EXISTS "Anyone can view videos of active properties" ON property_videos;
DROP POLICY IF EXISTS "Users can view own property videos" ON property_videos;

CREATE POLICY "View videos of active properties or own properties"
  ON property_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_videos.property_id 
      AND (properties.status = 'active' OR (auth.uid() IS NOT NULL AND properties.user_id = auth.uid()))
    )
  );

-- Consolidate property_plans policies
DROP POLICY IF EXISTS "Anyone can view plans of active properties" ON property_plans;
DROP POLICY IF EXISTS "Users can view own property plans" ON property_plans;

CREATE POLICY "View plans of active properties or own properties"
  ON property_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_plans.property_id 
      AND (properties.status = 'active' OR (auth.uid() IS NOT NULL AND properties.user_id = auth.uid()))
    )
  );