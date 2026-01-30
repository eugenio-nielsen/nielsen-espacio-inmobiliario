/*
  # Fix Security and Performance Issues
  
  ## Issues Fixed
  
  1. **Missing Foreign Key Indexes**
     - Added indexes on articles.author_id
     - Added indexes on favorites.property_id
     - Added indexes on leads.report_id, leads.user_id
     - Added indexes on property_views.user_id
     - Added indexes on value_reports.property_id
  
  2. **RLS Policy Optimization**
     - Updated all policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth functions for each row
  
  3. **Function Search Path**
     - Fixed mutable search_path in handle_new_user and update_updated_at_column functions
*/

-- 1. Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_report_id ON leads(report_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_value_reports_property_id ON value_reports(property_id);

-- 2. Fix RLS policies with optimized auth.uid() calls

-- Profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Properties table
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Property images table
DROP POLICY IF EXISTS "Users can view own property images" ON property_images;
DROP POLICY IF EXISTS "Users can manage own property images" ON property_images;
DROP POLICY IF EXISTS "Users can update own property images" ON property_images;
DROP POLICY IF EXISTS "Users can delete own property images" ON property_images;

CREATE POLICY "Users can view own property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can manage own property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

-- Value reports table
DROP POLICY IF EXISTS "Users can view own reports" ON value_reports;
DROP POLICY IF EXISTS "Users can create reports" ON value_reports;

CREATE POLICY "Users can view own reports"
  ON value_reports FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create reports"
  ON value_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Favorites table
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Leads table
DROP POLICY IF EXISTS "Property owners can view leads for their properties" ON leads;
DROP POLICY IF EXISTS "Users can view own submitted leads" ON leads;

CREATE POLICY "Property owners can view leads for their properties"
  ON leads FOR SELECT
  TO authenticated
  USING (
    property_id IS NULL OR
    EXISTS (
      SELECT 1 FROM properties WHERE id = leads.property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view own submitted leads"
  ON leads FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Property views table
DROP POLICY IF EXISTS "Property owners can view their property analytics" ON property_views;

CREATE POLICY "Property owners can view their property analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

-- Article categories table
DROP POLICY IF EXISTS "Admins can manage categories" ON article_categories;

CREATE POLICY "Admins can manage categories"
  ON article_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Articles table
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;

CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- 3. Fix function search_path issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;