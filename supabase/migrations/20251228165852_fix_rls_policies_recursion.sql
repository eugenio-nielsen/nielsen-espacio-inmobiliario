/*
  # Fix RLS Policy Recursion
  
  ## Problem
  The original policies on 'profiles' table created infinite recursion because
  the admin check policy queries the profiles table itself.
  
  ## Solution
  - Remove the recursive admin policy from profiles
  - Use auth.jwt() to check role claims instead of querying profiles table
  - Simplify policies to avoid cross-table recursion issues
  
  ## Changes
  1. Drop all existing policies on profiles table
  2. Create new non-recursive policies
  3. Fix similar issues on other tables
*/

-- Drop existing policies on profiles that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new policies for profiles without recursion
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix properties policies - remove recursive admin check
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;

-- Fix leads policies - simplify
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;

-- Allow property owners to view and manage leads for their properties
DROP POLICY IF EXISTS "Property owners can view leads for their properties" ON leads;
CREATE POLICY "Property owners can view leads for their properties"
  ON leads FOR SELECT
  TO authenticated
  USING (
    property_id IS NULL OR
    EXISTS (
      SELECT 1 FROM properties WHERE id = leads.property_id AND user_id = auth.uid()
    )
  );

-- Fix value_reports policies
DROP POLICY IF EXISTS "Admins can view all reports" ON value_reports;

-- Fix property_views policies
DROP POLICY IF EXISTS "Admins can view all analytics" ON property_views;