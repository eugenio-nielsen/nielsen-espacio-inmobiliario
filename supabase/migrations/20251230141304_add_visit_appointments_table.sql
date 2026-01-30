/*
  # Add Visit Appointments Table

  1. New Tables
    - `visit_appointments`
      - `id` (uuid, primary key) - Unique identifier for the appointment
      - `property_id` (uuid, foreign key) - Reference to the property
      - `user_id` (uuid, foreign key, nullable) - Reference to the user who scheduled (null if not logged in)
      - `first_name` (text) - Visitor's first name
      - `last_name` (text) - Visitor's last name
      - `email` (text) - Visitor's email
      - `phone` (text) - Visitor's phone number
      - `visit_date` (date) - Date of the visit
      - `time_slots` (text[]) - Array of selected time slots (morning, midday, afternoon)
      - `status` (text) - Status of the appointment (pending, confirmed, cancelled)
      - `created_at` (timestamptz) - When the appointment was created
      - `updated_at` (timestamptz) - When the appointment was last updated

  2. Security
    - Enable RLS on `visit_appointments` table
    - Add policy for users to create appointments
    - Add policy for property owners to view appointments for their properties
    - Add policy for users to view their own appointments
*/

CREATE TABLE IF NOT EXISTS visit_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  visit_date date NOT NULL,
  time_slots text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_visit_appointments_property_id ON visit_appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_user_id ON visit_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_appointments_visit_date ON visit_appointments(visit_date);

-- Enable RLS
ALTER TABLE visit_appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create appointments (authenticated or not)
CREATE POLICY "Anyone can create visit appointments"
  ON visit_appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Users can view their own appointments
CREATE POLICY "Users can view own appointments"
  ON visit_appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Property owners can view appointments for their properties
CREATE POLICY "Property owners can view their property appointments"
  ON visit_appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_appointments.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Policy: Property owners can update appointments for their properties
CREATE POLICY "Property owners can update their property appointments"
  ON visit_appointments
  FOR UPDATE
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