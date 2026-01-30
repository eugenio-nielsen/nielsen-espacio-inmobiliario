/*
  # PropTech Platform Database Schema
  
  ## Overview
  Complete database schema for a real estate platform with property listings,
  automated valuations, content management, and lead generation.
  
  ## Tables Created
  
  1. `profiles` - Extended user profiles with roles
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `full_name` (text)
    - `phone` (text)
    - `role` (text: visitor, seller, buyer, admin)
    - `avatar_url` (text)
    - `created_at`, `updated_at` (timestamps)
  
  2. `properties` - Real estate listings
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `title`, `description` (text)
    - `property_type` (enum: apartment, house, ph, land)
    - `operation_type` (enum: sale, rent)
    - `price`, `currency` (numeric, text)
    - `address`, `city`, `neighborhood`, `province` (text)
    - `latitude`, `longitude` (numeric)
    - `covered_area`, `total_area` (numeric)
    - `rooms`, `bathrooms`, `bedrooms`, `garages` (integer)
    - `property_condition` (enum: new, excellent, good, fair, to_renovate)
    - `amenities` (jsonb)
    - `status` (enum: draft, pending, active, sold, paused)
    - `views_count`, `contacts_count` (integer)
    - `featured` (boolean)
    - `created_at`, `updated_at` (timestamps)
  
  3. `property_images` - Images for properties
    - `id` (uuid, primary key)
    - `property_id` (uuid, references properties)
    - `url` (text)
    - `is_primary` (boolean)
    - `order_index` (integer)
  
  4. `value_reports` - Property valuation reports
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `property_id` (uuid, references properties, nullable)
    - `report_type` (enum: seller, buyer)
    - `address`, location info
    - `property_type`, `covered_area`, `total_area`, `property_condition`
    - `estimated_min`, `estimated_max`, `suggested_price` (numeric)
    - `price_indicator` (enum: overpriced, market, opportunity)
    - `estimated_sale_days` (integer)
    - `comparables` (jsonb)
    - `created_at` (timestamp)
  
  5. `article_categories` - Blog categories
    - `id` (uuid, primary key)
    - `name`, `slug`, `description` (text)
    - `order_index` (integer)
  
  6. `articles` - Blog posts/guides
    - `id` (uuid, primary key)
    - `author_id` (uuid, references profiles)
    - `category_id` (uuid, references article_categories)
    - `title`, `slug`, `excerpt`, `content` (text)
    - `cover_image` (text)
    - `status` (enum: draft, published)
    - `published_at`, `created_at`, `updated_at` (timestamps)
    - `views_count` (integer)
    - `seo_title`, `seo_description` (text)
  
  7. `favorites` - User saved properties
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `property_id` (uuid, references properties)
    - `created_at` (timestamp)
  
  8. `leads` - Contact/inquiry leads
    - `id` (uuid, primary key)
    - `property_id` (uuid, references properties, nullable)
    - `report_id` (uuid, references value_reports, nullable)
    - `user_id` (uuid, references profiles, nullable)
    - `name`, `email`, `phone`, `message` (text)
    - `lead_type` (enum: property_inquiry, value_report, advisor_contact)
    - `status` (enum: new, contacted, qualified, converted, lost)
    - `created_at`, `updated_at` (timestamps)
  
  9. `property_views` - Analytics tracking
    - `id` (uuid, primary key)
    - `property_id` (uuid, references properties)
    - `user_id` (uuid, nullable)
    - `ip_address` (text)
    - `created_at` (timestamp)
  
  ## Security
  - RLS enabled on all tables
  - Appropriate policies for each user role
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('apartment', 'house', 'ph', 'land');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE operation_type AS ENUM ('sale', 'rent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'to_renovate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('visitor', 'seller', 'buyer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_type AS ENUM ('seller', 'buyer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE price_indicator AS ENUM ('overpriced', 'market', 'opportunity');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE article_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_type AS ENUM ('property_inquiry', 'value_report', 'advisor_contact');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role user_role DEFAULT 'visitor',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  property_type property_type NOT NULL,
  operation_type operation_type DEFAULT 'sale',
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  address text NOT NULL,
  city text NOT NULL,
  neighborhood text,
  province text NOT NULL,
  latitude numeric,
  longitude numeric,
  covered_area numeric,
  total_area numeric,
  rooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  bedrooms integer DEFAULT 0,
  garages integer DEFAULT 0,
  property_condition property_condition DEFAULT 'good',
  amenities jsonb DEFAULT '[]'::jsonb,
  status property_status DEFAULT 'pending',
  views_count integer DEFAULT 0,
  contacts_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Property images table
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images of active properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND status = 'active'
    )
  );

CREATE POLICY "Users can view own property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own property images"
  ON property_images FOR UPDATE
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

CREATE POLICY "Users can delete own property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Value reports table
CREATE TABLE IF NOT EXISTS value_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  report_type report_type NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  neighborhood text,
  province text NOT NULL,
  property_type property_type NOT NULL,
  covered_area numeric NOT NULL,
  total_area numeric,
  property_condition property_condition DEFAULT 'good',
  rooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  estimated_min numeric NOT NULL,
  estimated_max numeric NOT NULL,
  suggested_price numeric NOT NULL,
  price_indicator price_indicator NOT NULL,
  estimated_sale_days integer,
  comparables jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE value_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON value_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create reports"
  ON value_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON value_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Article categories table
CREATE TABLE IF NOT EXISTS article_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON article_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON article_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES article_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  status article_status DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  views_count integer DEFAULT 0,
  seo_title text,
  seo_description text
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  report_id uuid REFERENCES value_reports(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  lead_type lead_type NOT NULL,
  status lead_status DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners can view leads for their properties"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own submitted leads"
  ON leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all leads"
  ON leads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Property views analytics
CREATE TABLE IF NOT EXISTS property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners can view their property analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert property views"
  ON property_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_value_reports_user_id ON value_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();