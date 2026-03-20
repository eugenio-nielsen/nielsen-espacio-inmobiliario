/*
  # Create trigger to auto-notify admins on new leads

  1. New Function
    - `notify_new_lead()` - SECURITY DEFINER function that fires after a new lead is inserted
    - Inserts a row into `admin_notifications` with lead details
    - Fetches the property title to include in the notification message

  2. New Trigger
    - `trigger_notify_new_lead` on `leads` table, AFTER INSERT
    - Fires for each new lead row

  3. Security
    - Function uses SECURITY DEFINER to bypass RLS (admin_notifications INSERT is restricted to super_admin)
    - search_path explicitly set to public for safety
*/

CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title text;
BEGIN
  SELECT title INTO prop_title
  FROM properties
  WHERE id = NEW.property_id;

  INSERT INTO admin_notifications (
    notification_type,
    title,
    message,
    related_lead_id,
    related_property_id,
    related_user_id
  ) VALUES (
    'new_lead',
    'Nuevo lead recibido',
    'Contacto de ' || NEW.name || ' (' || NEW.email || ')' ||
      CASE WHEN prop_title IS NOT NULL THEN ' para: ' || prop_title ELSE '' END,
    NEW.id,
    NEW.property_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_lead ON leads;

CREATE TRIGGER trigger_notify_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();
