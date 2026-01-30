/*
  # Add Property Videos and Plans Tables

  ## Overview
  Extends the property multimedia system to support videos and floor plans in addition to images.

  ## New Tables

  1. `property_videos` - Videos for properties
    - `id` (uuid, primary key)
    - `property_id` (uuid, references properties)
    - `url` (text) - URL to video file in storage
    - `thumbnail_url` (text) - URL to video thumbnail
    - `title` (text) - Optional title for the video
    - `order_index` (integer) - Display order
    - `created_at` (timestamp)

  2. `property_plans` - Floor plans and architectural plans
    - `id` (uuid, primary key)
    - `property_id` (uuid, references properties)
    - `url` (text) - URL to plan file in storage
    - `title` (text) - Optional title/description for the plan
    - `order_index` (integer) - Display order
    - `created_at` (timestamp)

  ## Security
  - Enable RLS on both tables
  - Anyone can view videos/plans of active properties
  - Property owners can manage their own property videos/plans
  - Admins have full access

  ## Storage Buckets
  Creates storage buckets for property-videos and property-plans with appropriate access policies
*/

-- Create property_videos table
CREATE TABLE IF NOT EXISTS property_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  title text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos of active properties"
  ON property_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND status = 'active'
    )
  );

CREATE POLICY "Users can view own property videos"
  ON property_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own property videos"
  ON property_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own property videos"
  ON property_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own property videos"
  ON property_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Create property_plans table
CREATE TABLE IF NOT EXISTS property_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans of active properties"
  ON property_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND status = 'active'
    )
  );

CREATE POLICY "Users can view own property plans"
  ON property_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own property plans"
  ON property_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own property plans"
  ON property_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own property plans"
  ON property_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_plans_property_id ON property_plans(property_id);

-- Create storage buckets for property videos and plans
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'property-images', true),
  ('property-videos', 'property-videos', true),
  ('property-plans', 'property-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can view property images'
  ) THEN
    CREATE POLICY "Anyone can view property images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'property-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload property images'
  ) THEN
    CREATE POLICY "Authenticated users can upload property images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'property-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own property images'
  ) THEN
    CREATE POLICY "Users can update own property images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own property images'
  ) THEN
    CREATE POLICY "Users can delete own property images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Storage policies for property-videos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can view property videos'
  ) THEN
    CREATE POLICY "Anyone can view property videos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'property-videos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload property videos'
  ) THEN
    CREATE POLICY "Authenticated users can upload property videos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'property-videos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own property videos'
  ) THEN
    CREATE POLICY "Users can update own property videos"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'property-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own property videos'
  ) THEN
    CREATE POLICY "Users can delete own property videos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'property-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Storage policies for property-plans bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can view property plans'
  ) THEN
    CREATE POLICY "Anyone can view property plans"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'property-plans');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload property plans'
  ) THEN
    CREATE POLICY "Authenticated users can upload property plans"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'property-plans');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own property plans'
  ) THEN
    CREATE POLICY "Users can update own property plans"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'property-plans' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own property plans'
  ) THEN
    CREATE POLICY "Users can delete own property plans"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'property-plans' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
