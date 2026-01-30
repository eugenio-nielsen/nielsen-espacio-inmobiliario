/*
  # Fix RLS Performance Issues for Visit Appointments

  ## Overview
  Optimizes RLS policies by wrapping auth.uid() in SELECT to prevent re-evaluation per row.

  ## Changes

  1. **visit_appointments table**
     - Drop and recreate 3 policies with optimized auth.uid() calls
     - Policies: Users can view own appointments, Property owners can view/update appointments
     - Improves query performance at scale

  ## Performance Impact
  - Significantly reduces CPU usage for RLS policy evaluation
  - Auth functions are evaluated once per query instead of once per row
*/

-- Drop existing policies for visit_appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Property owners can view their property appointments" ON visit_appointments;
DROP POLICY IF EXISTS "Property owners can update their property appointments" ON visit_appointments;

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Users can view own appointments"
  ON visit_appointments FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Property owners can view their property appointments"
  ON visit_appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Property owners can update their property appointments"
  ON visit_appointments FOR UPDATE
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
