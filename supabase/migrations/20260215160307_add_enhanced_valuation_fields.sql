/*
  # Enhanced Valuation System Schema

  1. Changes to value_reports Table
    - Add floor-related fields (floor_number, total_floors, has_elevator)
    - Add orientation field for property facing direction
    - Add bedrooms count (separate from rooms)
    - Add amenities array for property features
    - Add building_age for depreciation calculations
    - Add monthly_expenses for expense ratio evaluation
    - Add parking_spaces count
    - Add property_layout type (traditional, open, loft)
    - Add year_built and renovation_year for age calculations
    - Add quality indicators (natural_lighting, noise_level, view_quality)
    - Add building_type for construction quality assessment
    
  2. New Tables
    - neighborhood_characteristics: Store neighborhood-level data
    - market_trends: Historical price data by area
    - valuation_factors: Configuration table for algorithm weights
    
  3. Security
    - Enable RLS and create policies for new tables
*/

-- Add new columns to value_reports table
DO $$
BEGIN
  -- Floor information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'floor_number'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN floor_number integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'total_floors'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN total_floors integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'has_elevator'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN has_elevator boolean DEFAULT false;
  END IF;

  -- Orientation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'orientation'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN orientation text;
  END IF;

  -- Bedrooms (separate from rooms)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'bedrooms'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN bedrooms integer DEFAULT 0;
  END IF;

  -- Amenities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN amenities text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Building information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'building_age'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN building_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'year_built'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN year_built integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'renovation_year'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN renovation_year integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN building_type text;
  END IF;

  -- Financial
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'monthly_expenses'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN monthly_expenses numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'parking_spaces'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN parking_spaces integer DEFAULT 0;
  END IF;

  -- Layout
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'property_layout'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN property_layout text;
  END IF;

  -- Quality indicators
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'natural_lighting'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN natural_lighting text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'noise_level'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN noise_level text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'view_quality'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN view_quality text;
  END IF;

  -- Valuation breakdown
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'valuation_breakdown'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN valuation_breakdown jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'value_reports' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE value_reports ADD COLUMN confidence_score numeric;
  END IF;
END $$;

-- Create neighborhood_characteristics table
CREATE TABLE IF NOT EXISTS neighborhood_characteristics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  neighborhood text NOT NULL,
  province text NOT NULL,
  avg_price_per_sqm numeric,
  median_price_per_sqm numeric,
  avg_days_on_market integer,
  market_velocity text,
  transport_score integer,
  schools_score integer,
  commerce_score integer,
  safety_score integer,
  description text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, neighborhood, province)
);

-- Create market_trends table
CREATE TABLE IF NOT EXISTS market_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  neighborhood text,
  province text NOT NULL,
  property_type property_type NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  avg_price_per_sqm numeric NOT NULL,
  median_price_per_sqm numeric NOT NULL,
  total_listings integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  avg_days_on_market integer,
  price_change_percentage numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, neighborhood, province, property_type, period_start)
);

-- Create valuation_factors configuration table
CREATE TABLE IF NOT EXISTS valuation_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name text UNIQUE NOT NULL,
  factor_category text NOT NULL,
  weight numeric NOT NULL DEFAULT 1.0,
  min_value numeric,
  max_value numeric,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert default valuation factors
INSERT INTO valuation_factors (factor_name, factor_category, weight, description)
VALUES
  ('base_price_city', 'location', 1.0, 'Base price per sqm by city'),
  ('neighborhood_multiplier', 'location', 1.0, 'Neighborhood premium/discount factor'),
  ('floor_premium', 'building', 0.02, 'Premium per floor (mid floors)'),
  ('elevator_required', 'building', -0.15, 'Penalty if no elevator above 2nd floor'),
  ('orientation_north', 'features', 0.05, 'Premium for north-facing properties'),
  ('orientation_northeast', 'features', 0.03, 'Premium for northeast-facing'),
  ('parking_value', 'features', 0.08, 'Value addition per parking space'),
  ('amenity_pool', 'amenities', 0.05, 'Premium for swimming pool'),
  ('amenity_gym', 'amenities', 0.03, 'Premium for gym'),
  ('amenity_security', 'amenities', 0.04, 'Premium for 24h security'),
  ('amenity_balcony', 'amenities', 0.02, 'Premium for balcony'),
  ('amenity_terrace', 'amenities', 0.04, 'Premium for terrace'),
  ('age_depreciation', 'condition', -0.01, 'Annual depreciation rate'),
  ('renovation_bonus', 'condition', 0.15, 'Bonus for recent renovation'),
  ('natural_lighting_excellent', 'quality', 0.03, 'Premium for excellent lighting'),
  ('view_premium', 'quality', 0.05, 'Premium for excellent view'),
  ('noise_penalty', 'quality', -0.05, 'Penalty for noisy location')
ON CONFLICT (factor_name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE neighborhood_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_factors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view neighborhood data" ON neighborhood_characteristics;
  DROP POLICY IF EXISTS "Only admins can insert neighborhood data" ON neighborhood_characteristics;
  DROP POLICY IF EXISTS "Only admins can update neighborhood data" ON neighborhood_characteristics;
  DROP POLICY IF EXISTS "Anyone can view market trends" ON market_trends;
  DROP POLICY IF EXISTS "Only admins can insert market trends" ON market_trends;
  DROP POLICY IF EXISTS "Anyone can view valuation factors" ON valuation_factors;
  DROP POLICY IF EXISTS "Only admins can modify valuation factors" ON valuation_factors;
END $$;

-- RLS Policies for neighborhood_characteristics
CREATE POLICY "Anyone can view neighborhood data"
  ON neighborhood_characteristics FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert neighborhood data"
  ON neighborhood_characteristics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update neighborhood data"
  ON neighborhood_characteristics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for market_trends
CREATE POLICY "Anyone can view market trends"
  ON market_trends FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert market trends"
  ON market_trends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for valuation_factors
CREATE POLICY "Anyone can view valuation factors"
  ON valuation_factors FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can modify valuation factors"
  ON valuation_factors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_neighborhood_chars_location 
  ON neighborhood_characteristics(city, neighborhood, province);

CREATE INDEX IF NOT EXISTS idx_market_trends_location 
  ON market_trends(city, neighborhood, province, property_type);

CREATE INDEX IF NOT EXISTS idx_market_trends_period 
  ON market_trends(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_valuation_factors_active 
  ON valuation_factors(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE neighborhood_characteristics IS 'Stores neighborhood-level characteristics and scoring for valuation';
COMMENT ON TABLE market_trends IS 'Historical market data for price trend analysis';
COMMENT ON TABLE valuation_factors IS 'Configurable weights for valuation algorithm';
COMMENT ON COLUMN value_reports.valuation_breakdown IS 'Detailed breakdown of how each factor affected the final valuation';
COMMENT ON COLUMN value_reports.confidence_score IS 'Confidence score (0-100) based on data quality and comparables available';