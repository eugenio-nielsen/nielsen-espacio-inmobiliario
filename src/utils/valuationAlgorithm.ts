import type {
  PropertyType,
  PropertyCondition,
  ValuationBreakdown,
  NeighborhoodCharacteristics
} from '../types/database';

export interface ValuationInput {
  city: string;
  neighborhood: string | null;
  province: string;
  propertyType: PropertyType;
  coveredArea: number;
  totalArea: number | null;
  semiCoveredArea: number | null;
  condition: PropertyCondition;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floorNumber: number | null;
  totalFloors: number | null;
  hasElevator: boolean;
  orientation: string | null;
  amenities: string[];
  buildingAge: number | null;
  yearBuilt: number | null;
  renovationYear: number | null;
  buildingType: string | null;
  monthlyExpenses: number | null;
  parkingSpaces: number;
  propertyLayout: string | null;
  naturalLighting: string | null;
  noiseLevel: string | null;
  viewQuality: string | null;
  askedPrice?: number;
}

export interface ValuationResult {
  estimatedMin: number;
  estimatedMax: number;
  suggestedPrice: number;
  pricePerSqm: number;
  estimatedSaleDays: number;
  confidenceScore: number;
  breakdown: ValuationBreakdown;
  priceIndicator?: 'overpriced' | 'market' | 'opportunity';
}

const BASE_CITY_PRICES: Record<string, number> = {
  'Buenos Aires': 2600,
  'Córdoba': 1800,
  'Rosario': 1700,
  'Mendoza': 1600,
  'default': 1500
};

const PROPERTY_TYPE_FACTORS: Record<PropertyType, number> = {
  apartment: 1.0,
  ph: 0.95,
  house: 0.9,
  land: 0.4
};

const CONDITION_FACTORS: Record<PropertyCondition, number> = {
  new: 1.25,
  excellent: 1.12,
  good: 1.0,
  fair: 0.88,
  to_renovate: 0.7
};

const AMENITY_VALUES: Record<string, number> = {
  pool: 0.05,
  gym: 0.03,
  security: 0.04,
  laundry: 0.01,
  balcony: 0.02,
  terrace: 0.04,
  garden: 0.05,
  elevator: 0.02,
  ac: 0.02,
  heating: 0.015,
  storage: 0.01
};

const ORIENTATION_BONUSES: Record<string, number> = {
  north: 0.05,
  northeast: 0.03,
  northwest: 0.03,
  east: 0.01,
  west: 0.01,
  south: -0.02,
  southeast: 0.0,
  southwest: -0.01
};

export function calculateEffectiveArea(
  coveredArea: number,
  totalArea: number | null,
  semiCoveredArea: number | null
): number {
  const semi = semiCoveredArea || 0;
  const uncovered = (totalArea || coveredArea) - coveredArea - semi;

  return coveredArea + (semi * 0.5) + (Math.max(0, uncovered) * 0.35);
}

export function calculateLayoutEfficiency(rooms: number, bedrooms: number): number {
  if (rooms <= 2) return 1.05;
  if (rooms === 3) return 1.0;
  if (rooms === 4) return 0.97;

  const bedroomRatio = rooms > 0 ? bedrooms / rooms : 0.5;
  if (bedroomRatio > 0.6) return 0.95;

  return 0.94;
}

export function calculateFloorAdjustment(
  floorNumber: number | null,
  totalFloors: number | null,
  hasElevator: boolean
): number {
  if (!floorNumber || floorNumber <= 0) return 0;

  if (!hasElevator && floorNumber > 2) {
    return -0.15 - ((floorNumber - 2) * 0.03);
  }

  if (floorNumber === 1) return -0.03;

  if (totalFloors && floorNumber === totalFloors) {
    return hasElevator ? 0.03 : -0.05;
  }

  const midFloor = totalFloors ? Math.floor(totalFloors / 2) : 4;
  const distanceFromMid = Math.abs(floorNumber - midFloor);

  return Math.max(-0.05, 0.04 - (distanceFromMid * 0.01));
}

export function calculateAmenitiesScore(amenities: string[]): number {
  let score = 0;
  amenities.forEach(amenity => {
    score += AMENITY_VALUES[amenity] || 0;
  });
  return Math.min(score, 0.2);
}

export function calculateAgeDepreciation(
  buildingAge: number | null,
  condition: PropertyCondition,
  renovationYear: number | null
): number {
  if (condition === 'new') return 0;

  const currentYear = new Date().getFullYear();

  if (renovationYear && (currentYear - renovationYear) <= 5) {
    return 0.08;
  }

  if (!buildingAge || buildingAge <= 0) {
    const ageFromCondition =
      condition === 'excellent' ? 5 :
      condition === 'good' ? 10 :
      condition === 'fair' ? 20 : 30;
    buildingAge = ageFromCondition;
  }

  const depreciationRate =
    condition === 'excellent' ? 0.005 :
    condition === 'good' ? 0.008 :
    condition === 'fair' ? 0.012 : 0.015;

  return -Math.min(buildingAge * depreciationRate, 0.3);
}

export function calculateQualityAdjustments(
  naturalLighting: string | null,
  noiseLevel: string | null,
  viewQuality: string | null
): number {
  let adjustment = 0;

  if (naturalLighting === 'excellent') adjustment += 0.03;
  else if (naturalLighting === 'poor') adjustment -= 0.03;

  if (noiseLevel === 'noisy') adjustment -= 0.05;
  else if (noiseLevel === 'quiet') adjustment += 0.02;

  if (viewQuality === 'excellent' || viewQuality === 'city' || viewQuality === 'park') {
    adjustment += 0.05;
  } else if (viewQuality === 'poor') {
    adjustment -= 0.02;
  }

  return adjustment;
}

export function calculateParkingValue(
  parkingSpaces: number,
  neighborhood: string | null,
  neighborhoodData: NeighborhoodCharacteristics | null
): number {
  if (parkingSpaces <= 0) return 0;

  const baseValue = 0.08;
  const demandMultiplier = neighborhoodData?.transport_score ?
    (10 - neighborhoodData.transport_score) / 10 : 1;

  return baseValue * parkingSpaces * demandMultiplier;
}

export function calculateConfidenceScore(
  input: ValuationInput,
  neighborhoodData: NeighborhoodCharacteristics | null
): number {
  let score = 50;

  if (neighborhoodData?.avg_price_per_sqm) score += 15;
  if (input.neighborhood) score += 10;
  if (input.floorNumber !== null) score += 5;
  if (input.orientation) score += 5;
  if (input.amenities.length > 0) score += 5;
  if (input.buildingAge || input.yearBuilt) score += 5;
  if (input.naturalLighting) score += 3;
  if (input.viewQuality) score += 2;

  return Math.min(score, 100);
}

export async function calculateValuation(
  input: ValuationInput,
  neighborhoodData: NeighborhoodCharacteristics | null
): Promise<ValuationResult> {
  const baseCityPrice = BASE_CITY_PRICES[input.city] || BASE_CITY_PRICES.default;

  const neighborhoodFactor = neighborhoodData?.avg_price_per_sqm
    ? neighborhoodData.avg_price_per_sqm / baseCityPrice
    : 1.0;

  const effectiveArea = calculateEffectiveArea(
    input.coveredArea,
    input.totalArea,
    input.semiCoveredArea
  );

  const layoutEfficiency = calculateLayoutEfficiency(input.rooms, input.bedrooms);
  const typeFactor = PROPERTY_TYPE_FACTORS[input.propertyType];
  const conditionFactor = CONDITION_FACTORS[input.condition];
  const floorAdjustment = calculateFloorAdjustment(
    input.floorNumber,
    input.totalFloors,
    input.hasElevator
  );
  const orientationBonus = ORIENTATION_BONUSES[input.orientation?.toLowerCase() || ''] || 0;
  const amenitiesScore = calculateAmenitiesScore(input.amenities);
  const ageDepreciation = calculateAgeDepreciation(
    input.buildingAge,
    input.condition,
    input.renovationYear
  );
  const parkingValue = calculateParkingValue(
    input.parkingSpaces,
    input.neighborhood,
    neighborhoodData
  );
  const qualityAdjustments = calculateQualityAdjustments(
    input.naturalLighting,
    input.noiseLevel,
    input.viewQuality
  );

  const totalMultiplier =
    neighborhoodFactor *
    typeFactor *
    conditionFactor *
    layoutEfficiency *
    (1 + floorAdjustment) *
    (1 + orientationBonus) *
    (1 + amenitiesScore) *
    (1 + ageDepreciation) *
    (1 + parkingValue) *
    (1 + qualityAdjustments);

  const pricePerSqm = baseCityPrice * totalMultiplier;
  const suggestedPrice = Math.round(effectiveArea * pricePerSqm);

  const liquidityScore = neighborhoodFactor * layoutEfficiency * conditionFactor * (1 + amenitiesScore);
  const variance =
    liquidityScore > 1.15 ? 0.12 :
    liquidityScore > 1.0 ? 0.15 :
    liquidityScore > 0.9 ? 0.18 : 0.22;

  const estimatedMin = Math.round(suggestedPrice * (1 - variance));
  const estimatedMax = Math.round(suggestedPrice * (1 + variance));

  const estimatedSaleDays = neighborhoodData?.avg_days_on_market ||
    (liquidityScore > 1.2 ? 30 :
     liquidityScore > 1.1 ? 45 :
     liquidityScore > 1.0 ? 60 :
     liquidityScore > 0.9 ? 90 : 120);

  const confidenceScore = calculateConfidenceScore(input, neighborhoodData);

  const factorsApplied = [
    { name: 'Ubicación', value: neighborhoodFactor, impact: neighborhoodFactor > 1 ? 'positive' : 'negative' },
    { name: 'Tipo de propiedad', value: typeFactor, impact: typeFactor >= 1 ? 'neutral' : 'negative' },
    { name: 'Estado', value: conditionFactor, impact: conditionFactor > 1 ? 'positive' : 'negative' },
    { name: 'Distribución', value: layoutEfficiency, impact: layoutEfficiency > 1 ? 'positive' : 'negative' },
    { name: 'Piso', value: 1 + floorAdjustment, impact: floorAdjustment > 0 ? 'positive' : floorAdjustment < 0 ? 'negative' : 'neutral' },
    { name: 'Orientación', value: 1 + orientationBonus, impact: orientationBonus > 0 ? 'positive' : orientationBonus < 0 ? 'negative' : 'neutral' },
    { name: 'Amenities', value: 1 + amenitiesScore, impact: amenitiesScore > 0 ? 'positive' : 'neutral' },
    { name: 'Antigüedad', value: 1 + ageDepreciation, impact: ageDepreciation > 0 ? 'positive' : 'negative' },
    { name: 'Cochera', value: 1 + parkingValue, impact: parkingValue > 0 ? 'positive' : 'neutral' },
    { name: 'Calidad', value: 1 + qualityAdjustments, impact: qualityAdjustments > 0 ? 'positive' : qualityAdjustments < 0 ? 'negative' : 'neutral' }
  ];

  const breakdown: ValuationBreakdown = {
    base_price_per_sqm: baseCityPrice,
    effective_area: effectiveArea,
    location_factor: neighborhoodFactor,
    property_type_factor: typeFactor,
    condition_factor: conditionFactor,
    floor_adjustment: floorAdjustment,
    orientation_bonus: orientationBonus,
    parking_value: parkingValue,
    amenities_score: amenitiesScore,
    age_depreciation: ageDepreciation,
    layout_efficiency: layoutEfficiency,
    quality_adjustments: qualityAdjustments,
    final_price_per_sqm: pricePerSqm,
    factors_applied: factorsApplied
  };

  let priceIndicator: 'overpriced' | 'market' | 'opportunity' | undefined;
  if (input.askedPrice) {
    const diff = (input.askedPrice - suggestedPrice) / suggestedPrice;
    if (diff > 0.1) priceIndicator = 'overpriced';
    else if (diff < -0.1) priceIndicator = 'opportunity';
    else priceIndicator = 'market';
  }

  return {
    estimatedMin,
    estimatedMax,
    suggestedPrice,
    pricePerSqm: Math.round(pricePerSqm),
    estimatedSaleDays,
    confidenceScore,
    breakdown,
    priceIndicator
  };
}
