/*
  # Set Super Admin User
  
  1. User Assignment
    - Set eugenio@espacioinmobiliario.com.ar as super_admin
  
  2. Changes
    - Updates the profile for the specified email with super_admin role
    - If user hasn't registered yet, this will have no effect but is safe
  
  3. Notes
    - This migration assumes the user_role enum already includes 'super_admin'
    - If profile doesn't exist, it will be created with super_admin role on registration
*/

-- Set eugenio@espacioinmobiliario.com.ar as super_admin
UPDATE profiles
SET role = 'super_admin', updated_at = now()
WHERE email = 'eugenio@espacioinmobiliario.com.ar';

-- Add a note about super admin assignment
COMMENT ON TABLE profiles IS 'User profiles with role-based access. Super admin: eugenio@espacioinmobiliario.com.ar';
