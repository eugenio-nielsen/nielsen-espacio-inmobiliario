/*
  # Add Super Admin Role to Enum
  
  1. Role System Enhancement
    - Add 'super_admin' to the user_role enum type
  
  2. Changes
    - Extends user_role enum to include 'super_admin'
  
  3. Security
    - Super admin will have unrestricted access through updated RLS policies
    - This value must be committed before it can be used
*/

-- Add super_admin to the user_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'super_admin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- Add comment to document the roles
COMMENT ON TYPE user_role IS 'User roles: visitor (default), seller, buyer, admin, super_admin (full platform access)';
