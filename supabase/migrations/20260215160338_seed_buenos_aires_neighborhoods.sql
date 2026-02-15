/*
  # Seed Buenos Aires Neighborhood Data

  1. Purpose
    - Add realistic neighborhood characteristics for Buenos Aires
    - Provide base pricing data for valuations
    - Include quality scores for different areas
    
  2. Data Included
    - Average price per sqm for key neighborhoods
    - Market velocity indicators
    - Quality scores (transport, schools, commerce, safety)
    - Average days on market
*/

-- Insert Buenos Aires neighborhood characteristics
INSERT INTO neighborhood_characteristics (
  city, neighborhood, province, 
  avg_price_per_sqm, median_price_per_sqm, 
  avg_days_on_market, market_velocity,
  transport_score, schools_score, commerce_score, safety_score,
  description
) VALUES
  (
    'Buenos Aires', 'Palermo', 'Ciudad Autónoma de Buenos Aires',
    3000, 2950, 45, 'high',
    9, 8, 10, 8,
    'Barrio premium con alta demanda, excelente oferta gastronómica y comercial'
  ),
  (
    'Buenos Aires', 'Recoleta', 'Ciudad Autónoma de Buenos Aires',
    3100, 3050, 40, 'high',
    9, 9, 9, 9,
    'Zona tradicional y prestigiosa, arquitectura clásica, muy segura'
  ),
  (
    'Buenos Aires', 'Belgrano', 'Ciudad Autónoma de Buenos Aires',
    2900, 2850, 50, 'high',
    8, 10, 8, 9,
    'Barrio residencial familiar, excelentes colegios, muy tranquilo'
  ),
  (
    'Buenos Aires', 'Núñez', 'Ciudad Autónoma de Buenos Aires',
    2500, 2450, 60, 'medium',
    7, 8, 7, 8,
    'Zona residencial tranquila, buena conectividad, cerca de espacios verdes'
  ),
  (
    'Buenos Aires', 'Villa Crespo', 'Ciudad Autónoma de Buenos Aires',
    2700, 2650, 55, 'medium',
    8, 7, 8, 7,
    'Barrio en crecimiento, buena vida de barrio, cada vez más demandado'
  ),
  (
    'Buenos Aires', 'Caballito', 'Ciudad Autónoma de Buenos Aires',
    2650, 2600, 60, 'medium',
    9, 8, 8, 7,
    'Centro geográfico de la ciudad, excelente conectividad y servicios'
  ),
  (
    'Buenos Aires', 'Almagro', 'Ciudad Autónoma de Buenos Aires',
    2400, 2350, 65, 'medium',
    8, 7, 7, 6,
    'Barrio tradicional, buena conexión, precios más accesibles'
  ),
  (
    'Buenos Aires', 'Colegiales', 'Ciudad Autónoma de Buenos Aires',
    2600, 2550, 55, 'medium',
    7, 8, 7, 8,
    'Zona residencial tranquila, cerca de Palermo, en valorización'
  ),
  (
    'Buenos Aires', 'Villa Urquiza', 'Ciudad Autónoma de Buenos Aires',
    2300, 2250, 70, 'medium',
    7, 7, 7, 7,
    'Barrio familiar y tranquilo, buenas propiedades, precios accesibles'
  ),
  (
    'Buenos Aires', 'Barrio Norte', 'Ciudad Autónoma de Buenos Aires',
    2900, 2850, 50, 'high',
    10, 8, 9, 8,
    'Céntrico y bien conectado, cerca de Recoleta, alta demanda'
  ),
  (
    'Buenos Aires', 'Puerto Madero', 'Ciudad Autónoma de Buenos Aires',
    3500, 3450, 35, 'high',
    9, 7, 8, 10,
    'Zona premium moderna, edificios de lujo, vista al río'
  ),
  (
    'Buenos Aires', 'San Telmo', 'Ciudad Autónoma de Buenos Aires',
    2200, 2150, 75, 'low',
    7, 6, 7, 6,
    'Barrio histórico, arquitectura antigua, mercado de antigüedades'
  ),
  (
    'Buenos Aires', 'Saavedra', 'Ciudad Autónoma de Buenos Aires',
    2200, 2150, 75, 'medium',
    6, 7, 6, 7,
    'Zona residencial en el norte, tranquila, precios accesibles'
  ),
  (
    'Buenos Aires', 'Flores', 'Ciudad Autónoma de Buenos Aires',
    2000, 1950, 80, 'medium',
    8, 7, 7, 6,
    'Barrio tradicional, buena conectividad, mercado activo'
  ),
  (
    'Buenos Aires', 'Villa Devoto', 'Ciudad Autónoma de Buenos Aires',
    2300, 2250, 70, 'medium',
    7, 8, 7, 8,
    'Zona residencial familiar, tranquila, buena calidad de vida'
  ),
  (
    'Buenos Aires', 'Parque Patricios', 'Ciudad Autónoma de Buenos Aires',
    1900, 1850, 85, 'medium',
    7, 6, 6, 6,
    'Barrio en desarrollo, polo tecnológico, precios en alza'
  ),
  (
    'Buenos Aires', 'Boedo', 'Ciudad Autónoma de Buenos Aires',
    2100, 2050, 75, 'medium',
    8, 7, 7, 6,
    'Barrio tradicional, bien comunicado, ambiente de barrio'
  ),
  (
    'Buenos Aires', 'Parque Chacabuco', 'Ciudad Autónoma de Buenos Aires',
    2000, 1950, 80, 'medium',
    7, 7, 6, 6,
    'Zona residencial con espacios verdes, tranquila'
  ),
  (
    'Buenos Aires', 'Constitución', 'Ciudad Autónoma de Buenos Aires',
    1700, 1650, 90, 'low',
    9, 5, 6, 4,
    'Muy céntrico pero en desarrollo, precios bajos'
  ),
  (
    'Buenos Aires', 'Monserrat', 'Ciudad Autónoma de Buenos Aires',
    1800, 1750, 85, 'low',
    9, 5, 7, 5,
    'Centro histórico, edificios antiguos, zona en transición'
  )
ON CONFLICT (city, neighborhood, province) 
DO UPDATE SET
  avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
  median_price_per_sqm = EXCLUDED.median_price_per_sqm,
  avg_days_on_market = EXCLUDED.avg_days_on_market,
  market_velocity = EXCLUDED.market_velocity,
  transport_score = EXCLUDED.transport_score,
  schools_score = EXCLUDED.schools_score,
  commerce_score = EXCLUDED.commerce_score,
  safety_score = EXCLUDED.safety_score,
  description = EXCLUDED.description,
  last_updated = now();