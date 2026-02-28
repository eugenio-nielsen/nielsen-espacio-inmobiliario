/*
  # Fix Anonymous View Tracking Function

  1. Changes
    - Update record_property_view function to skip tracking for anonymous users
    - Maintain the correct function signature with all parameters
    - Only record views when user_id is provided (authenticated users only)

  2. Behavior
    - Function returns early without error for anonymous users (no tracking)
    - Authenticated users continue to have their views tracked normally
    - Maintains compatibility with existing frontend code
*/

-- Drop and recreate the function with correct anonymous handling
DROP FUNCTION IF EXISTS record_property_view(uuid, uuid);
DROP FUNCTION IF EXISTS record_property_view(uuid, text, uuid, text, text);

CREATE OR REPLACE FUNCTION record_property_view(
  p_property_id uuid,
  p_session_id text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_view_id uuid;
  v_is_new_unique boolean := false;
  v_view_date date := CURRENT_DATE;
  v_session_expired boolean := false;
BEGIN
  -- Skip tracking for anonymous users
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'tracked', false,
      'reason', 'anonymous_user'
    );
  END IF;

  -- Check if session exists and is still active (within 30 minutes)
  SELECT id INTO v_existing_view_id
  FROM property_views
  WHERE property_id = p_property_id
    AND session_id = p_session_id
    AND last_viewed_at > (NOW() - INTERVAL '30 minutes');

  IF v_existing_view_id IS NULL THEN
    -- New unique view (or expired session) - insert new record
    INSERT INTO property_views (
      property_id,
      session_id,
      user_id,
      ip_address,
      user_agent,
      created_at,
      last_viewed_at,
      view_count
    ) VALUES (
      p_property_id,
      p_session_id,
      p_user_id,
      p_ip_address,
      p_user_agent,
      NOW(),
      NOW(),
      1
    );
    
    v_is_new_unique := true;
    
    -- Update daily aggregated stats (only authenticated views now)
    INSERT INTO property_view_stats (
      property_id,
      view_date,
      unique_views,
      total_views,
      anonymous_views,
      authenticated_views
    ) VALUES (
      p_property_id,
      v_view_date,
      1,
      1,
      0,
      1
    )
    ON CONFLICT (property_id, view_date)
    DO UPDATE SET
      unique_views = property_view_stats.unique_views + 1,
      total_views = property_view_stats.total_views + 1,
      authenticated_views = property_view_stats.authenticated_views + 1;
  ELSE
    -- Existing session - update last viewed time and increment count
    UPDATE property_views
    SET 
      last_viewed_at = NOW(),
      view_count = view_count + 1
    WHERE id = v_existing_view_id;
    
    -- Update total views in stats
    INSERT INTO property_view_stats (
      property_id,
      view_date,
      unique_views,
      total_views,
      anonymous_views,
      authenticated_views
    ) VALUES (
      p_property_id,
      v_view_date,
      0,
      1,
      0,
      1
    )
    ON CONFLICT (property_id, view_date)
    DO UPDATE SET
      total_views = property_view_stats.total_views + 1,
      authenticated_views = property_view_stats.authenticated_views + 1;
  END IF;

  RETURN jsonb_build_object(
    'tracked', true,
    'is_new_unique', v_is_new_unique,
    'view_id', v_existing_view_id
  );
END;
$$;