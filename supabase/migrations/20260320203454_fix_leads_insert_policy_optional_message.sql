/*
  # Fix leads INSERT policies - make message optional

  1. Changes
    - Drop existing INSERT policies for both anonymous and authenticated users
    - Recreate them WITHOUT the message requirement
    - Message field is optional in the UI but was required by RLS, causing silent submission failures

  2. Security
    - Still validates: property_id IS NOT NULL, name IS NOT NULL and non-empty, email IS NOT NULL and non-empty
    - Message remains optional, matching the frontend form behavior
*/

DROP POLICY IF EXISTS "Anonymous users can create leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON leads;

CREATE POLICY "Anonymous users can create leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (
    property_id IS NOT NULL
    AND name IS NOT NULL
    AND name <> ''
    AND email IS NOT NULL
    AND email <> ''
  );

CREATE POLICY "Authenticated users can create leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IS NOT NULL
    AND name IS NOT NULL
    AND name <> ''
    AND email IS NOT NULL
    AND email <> ''
  );
