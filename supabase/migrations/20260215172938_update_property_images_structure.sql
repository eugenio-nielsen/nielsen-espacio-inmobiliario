/*
  # Update Property Images Structure

  1. Changes
    - Add caption column to property_images table
    - Add updated_at column to property_images table
    - Add indexes for performance
    - Add trigger for updated_at
  
  2. Security
    - Verify RLS policies are in place
    - Ensure storage bucket exists with correct settings
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_images' AND column_name = 'caption'
  ) THEN
    ALTER TABLE property_images ADD COLUMN caption text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_images' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE property_images ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order_index ON property_images(property_id, order_index);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(property_id, is_primary) WHERE is_primary = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_property_images_updated_at_trigger ON property_images;
CREATE TRIGGER update_property_images_updated_at_trigger
  BEFORE UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_property_images_updated_at();

-- Ensure storage bucket exists with correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Storage policies for property images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own property images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own property images" ON storage.objects;
END $$;

CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Users can delete own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

-- Add comments
COMMENT ON TABLE property_images IS 'Stores images associated with properties';
COMMENT ON COLUMN property_images.property_id IS 'Reference to the property this image belongs to';
COMMENT ON COLUMN property_images.url IS 'URL to the image in storage';
COMMENT ON COLUMN property_images.order_index IS 'Order in which images should be displayed';
COMMENT ON COLUMN property_images.is_primary IS 'Whether this is the primary/featured image for the property';
COMMENT ON COLUMN property_images.caption IS 'Optional caption or description for the image';