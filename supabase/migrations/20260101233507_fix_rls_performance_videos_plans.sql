/*
  # Fix RLS Performance Issues for Videos and Plans

  ## Overview
  Optimizes RLS policies by wrapping auth.uid() in SELECT to prevent re-evaluation per row.

  ## Changes

  1. **property_videos table**
     - Drop and recreate 4 policies with optimized auth.uid() calls
     - Improves query performance at scale

  2. **property_plans table**
     - Drop and recreate 4 policies with optimized auth.uid() calls
     - Improves query performance at scale

  ## Performance Impact
  - Significantly reduces CPU usage for RLS policy evaluation
  - Auth functions are evaluated once per query instead of once per row
*/

-- Drop existing policies for property_videos
DROP POLICY IF EXISTS "Users can view own property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can insert own property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can update own property videos" ON property_videos;
DROP POLICY IF EXISTS "Users can delete own property videos" ON property_videos;

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Users can view own property videos"
  ON property_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own property videos"
  ON property_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own property videos"
  ON property_videos FOR UPDATE
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

CREATE POLICY "Users can delete own property videos"
  ON property_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

-- Drop existing policies for property_plans
DROP POLICY IF EXISTS "Users can view own property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can insert own property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can update own property plans" ON property_plans;
DROP POLICY IF EXISTS "Users can delete own property plans" ON property_plans;

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Users can view own property plans"
  ON property_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own property plans"
  ON property_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own property plans"
  ON property_plans FOR UPDATE
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

CREATE POLICY "Users can delete own property plans"
  ON property_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );
