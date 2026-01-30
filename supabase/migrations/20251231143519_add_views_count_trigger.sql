/*
  # Add automatic views count update trigger

  1. Changes
    - Create function to update views_count in properties table
    - Create trigger to execute function when property_view is inserted
    
  2. Details
    - When a new record is inserted in property_views table
    - The views_count field in properties table is automatically incremented
    - This ensures the counter stays synchronized with actual views
*/

-- Function to update views_count when a property view is recorded
CREATE OR REPLACE FUNCTION update_property_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET views_count = (
    SELECT COUNT(*)
    FROM property_views
    WHERE property_id = NEW.property_id
  )
  WHERE id = NEW.property_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update views_count on new property view
DROP TRIGGER IF EXISTS on_property_view_created ON property_views;
CREATE TRIGGER on_property_view_created
  AFTER INSERT ON property_views
  FOR EACH ROW
  EXECUTE FUNCTION update_property_views_count();