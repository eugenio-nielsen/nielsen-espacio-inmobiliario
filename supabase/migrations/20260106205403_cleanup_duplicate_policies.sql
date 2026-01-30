/*
  # Cleanup Duplicate Policies

  ## Changes
  - Remove duplicate policies that were not properly dropped
  - Ensure single consolidated policies per operation
*/

-- Remove duplicate leads update policy
DROP POLICY IF EXISTS "Property owners can update leads for their properties" ON leads;

-- Remove duplicate visit appointments update policy  
DROP POLICY IF EXISTS "Property owners can update their property appointments" ON visit_appointments;