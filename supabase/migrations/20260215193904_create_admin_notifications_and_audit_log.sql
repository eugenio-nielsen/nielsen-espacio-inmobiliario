/*
  # Create Admin Notifications and Audit Log Tables
  
  1. New Tables
    - `admin_notifications`
      - Tracks all notifications sent to super admin
      - Records notification type, content, delivery status
      - Links to related entities (user, property, lead)
    - `audit_log`
      - Tracks all super_admin actions
      - Records action type, affected entity, changes made
      - Maintains complete audit trail
  
  2. Security
    - Enable RLS on both tables
    - Only super_admin can view these tables
    - System can insert notifications automatically
    - Super_admin actions are logged automatically
  
  3. Indexes
    - Optimized for querying by date and type
    - Efficient filtering by entity references
*/

-- Create notification_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'user_registration',
      'new_property',
      'property_status_change',
      'new_lead',
      'role_change',
      'suspicious_activity'
    );
  END IF;
END $$;

-- Create audit_action_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_type') THEN
    CREATE TYPE audit_action_type AS ENUM (
      'property_create',
      'property_update',
      'property_delete',
      'user_update',
      'lead_update',
      'data_export',
      'role_change'
    );
  END IF;
END $$;

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  related_property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  related_lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type audit_action_type NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  affected_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changes jsonb,
  description text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user ON admin_notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_property ON admin_notifications(related_property_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_lead ON admin_notifications(related_lead_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_affected_user ON audit_log(affected_user_id);

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_notifications
CREATE POLICY "Super admins can view all notifications"
  ON admin_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update notifications"
  ON admin_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert notifications"
  ON admin_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for audit_log
CREATE POLICY "Super admins can view audit log"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert audit entries"
  ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE admin_notifications IS 'Notifications sent to super admin for platform events';
COMMENT ON TABLE audit_log IS 'Audit trail of super admin actions on the platform';
COMMENT ON COLUMN admin_notifications.email_sent IS 'Whether notification email was sent to eugenio@espacioinmobiliario.com.ar';
COMMENT ON COLUMN audit_log.changes IS 'JSON object containing before/after values of changed fields';
