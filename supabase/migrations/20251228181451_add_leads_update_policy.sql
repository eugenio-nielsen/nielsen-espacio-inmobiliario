/*
  # Add Update Policy for Leads Table

  ## Changes
  1. Adds a new RLS policy allowing property owners to update leads
     associated with their properties (e.g., change status from 'new' to 'contacted')
  
  ## Security
  - Property owners can only update leads linked to properties they own
  - Uses ownership check through properties table join
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' 
    AND policyname = 'Property owners can update leads for their properties'
  ) THEN
    CREATE POLICY "Property owners can update leads for their properties"
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
  END IF;
END $$;
