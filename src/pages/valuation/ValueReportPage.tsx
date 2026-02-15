import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, MapPin, Home, Ruler,
  ArrowRight, TrendingUp, TrendingDown, Minus, Loader2, Sparkles
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateValuation } from '../../utils/valuationAlgorithm';
import { findComparableProperties } from '../../utils/comparableProperties';
import type { PropertyType, PropertyCondition, ValueReport, PriceIndicator, NeighborhoodCharacteristics } from '../../types/database';

const propertyTypes = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'ph', label: 'PH' },
  { value: 'land', label: 'Terreno' }
];

const conditions = [
  { value: 'new', label: 'A estrenar' },
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
  { value: 'to_renovate', label: 'A refaccionar' }
];

const amenitiesList = [
  { value: 'pool', label: 'Pileta' },
  { value: 'gym', label: 'Gimnasio' },
  { value: 'security', label: 'Seguridad 24hs' },
  { value: 'laundry', label: 'Lavadero' },
  { value: 'balcony', label: 'Balcón' },
  { value: 'terrace', label: 'Terraza' },
  { value: 'garden', label: 'Jardín' },
  { value: 'elevator', label: 'Ascensor' },
  { value: 'ac', label: 'Aire acondicionado' },
  { value: 'heating', label: 'Calefacción' },
  { value: 'storage', label: 'Baulera' }
];

const orientations = [
  { value: 'north', label: 'Norte' },
  { value: 'south', label: 'Sur' },
  { value: 'east', label: 'Este' },
  { value: 'west', label: 'Oeste' },
  { value: 'northeast', label: 'Noreste' },
  { value: 'northwest', label: 'Noroeste' },
  { value: 'southeast', label: 'Sureste' },
  { value: 'southwest', label: 'Suroeste' }
];

const lightingOptions = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Buena' },
  { value: 'average', label: 'Regular' },
  { value: 'poor', label: 'Pobre' }
];

const noiseOptions = [
  { value: 'quiet', label: 'Silencioso' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'noisy', label: 'Ruidoso' }
];

const indicatorConfig = {
  overpriced: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: TrendingUp,
    label: 'Sobreprecio',
    description: 'El precio está por encima del valor de mercado'
  },
  market: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: Minus,
    label: 'Precio de mercado',
    description: 'El precio está alineado con el mercado'
  },
  opportunity: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: TrendingDown,
    label: 'Oportunidad',
    description: 'El precio está por debajo del valor de mercado'
  }
};

export default function ValueReportPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ValueReport | null>(null);

  const [formData, setFormData] = useState({
    reportType: (searchParams.get('type') || 'seller') as 'seller' | 'buyer',
    address: '',
    city: '',
    neighborhood: '',
    province: '',
    propertyType: 'apartment' as PropertyType,
    coveredArea: '',
    semiCoveredArea: '',
    totalArea: '',
    condition: 'good' as PropertyCondition,
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    floorNumber: '',
    totalFloors: '',
    hasElevator: false,
    orientation: '',
    amenities: [] as string[],
    buildingAge: '',
    yearBuilt: '',
    renovationYear: '',
    buildingType: '',
    monthlyExpenses: '',
    parkingSpaces: '',
    propertyLayout: '',
    naturalLighting: '',
    noiseLevel: '',
    viewQuality: '',
    askedPrice: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const generateReport = async () => {
    setLoading(true);

    try {
      const { data: neighborhoodData } = await supabase
        .from('neighborhood_characteristics')
        .select('*')
        .eq('city', formData.city)
        .eq('neighborhood', formData.neighborhood || '')
        .maybeSingle();

      const valuationInput = {
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        province: formData.province,
        propertyType: formData.propertyType,
        coveredArea: parseFloat(formData.coveredArea),
        totalArea: formData.totalArea ? parseFloat(formData.totalArea) : null,
        semiCoveredArea: formData.semiCoveredArea ? parseFloat(formData.semiCoveredArea) : null,
        condition: formData.condition,
        rooms: formData.rooms ? parseInt(formData.rooms) : 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        hasElevator: formData.hasElevator,
        orientation: formData.orientation || null,
        amenities: formData.amenities,
        buildingAge: formData.buildingAge ? parseInt(formData.buildingAge) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        renovationYear: formData.renovationYear ? parseInt(formData.renovationYear) : null,
        buildingType: formData.buildingType || null,
        monthlyExpenses: formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : null,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
        propertyLayout: formData.propertyLayout || null,
        naturalLighting: formData.naturalLighting || null,
        noiseLevel: formData.noiseLevel || null,
        viewQuality: formData.viewQuality || null,
        askedPrice: formData.askedPrice ? parseFloat(formData.askedPrice) : undefined
      };

      const valuation = await calculateValuation(
        valuationInput,
        neighborhoodData as NeighborhoodCharacteristics | null
      );

      const comparables = await findComparableProperties(supabase, {
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        propertyType: formData.propertyType,
        coveredArea: parseFloat(formData.coveredArea),
        rooms: formData.rooms ? parseInt(formData.rooms) : 0
      });

      const reportData = {
        report_type: formData.reportType,
        address: formData.address,
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        province: formData.province,
        property_type: formData.propertyType,
        covered_area: parseFloat(formData.coveredArea),
        semi_covered_area: formData.semiCoveredArea ? parseFloat(formData.semiCoveredArea) : null,
        total_area: formData.totalArea ? parseFloat(formData.totalArea) : null,
        property_condition: formData.condition,
        rooms: formData.rooms ? parseInt(formData.rooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        floor_number: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        total_floors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        has_elevator: formData.hasElevator,
        orientation: formData.orientation || null,
        amenities: formData.amenities,
        building_age: formData.buildingAge ? parseInt(formData.buildingAge) : null,
        year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        renovation_year: formData.renovationYear ? parseInt(formData.renovationYear) : null,
        building_type: formData.buildingType || null,
        monthly_expenses: formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : null,
        parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
        property_layout: formData.propertyLayout || null,
        natural_lighting: formData.naturalLighting || null,
        noise_level: formData.noiseLevel || null,
        view_quality: formData.viewQuality || null,
        estimated_min: valuation.estimatedMin,
        estimated_max: valuation.estimatedMax,
        suggested_price: valuation.suggestedPrice,
        price_indicator: valuation.priceIndicator || 'market',
        estimated_sale_days: valuation.estimatedSaleDays,
        comparables,
        valuation_breakdown: valuation.breakdown,
        confidence_score: valuation.confidenceScore
      };

      if (user) {
        const { data } = await supabase
          .from('value_reports')
          .insert({
            ...reportData,
            user_id: user.id,
            property_id: searchParams.get('property') || null
          })
          .select()
          .single();

        if (data) {
          setReport(data as ValueReport);

          await supabase.from('leads').insert({
            report_id: data.id,
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            email: user.email || '',
            lead_type: 'value_report',
            status: 'new',
            message: `Informe de valor generado para ${reportData.address}, ${reportData.city}`
          });
        }
      } else {
        setReport({
          ...reportData,
          id: 'temp',
          user_id: null,
          property_id: null,
          created_at: new Date().toISOString()
        } as ValueReport);

        await supabase.from('leads').insert({
          report_id: null,
          user_id: null,
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone || null,
          lead_type: 'value_report',
          status: 'new',
          message: `Informe de valor generado (sin registro) para ${reportData.address}, ${reportData.city}`
        });
      }

      setStep(3);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 text-white pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Informe de Valor Inmobiliario
          </h1>
          <p className="text-brand-100 text-lg">
            Obtén una estimación profesional del valor de tu propiedad en minutos
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-12">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              ¿Qué tipo de informe necesitas?
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => {
                  updateFormData('reportType', 'seller');
                  setStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-brand-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Soy vendedor</h3>
                <p className="text-gray-600">
                  Quiero saber a qué precio publicar mi propiedad para venderla rápido y al mejor valor.
                </p>
              </button>

              <button
                onClick={() => {
                  updateFormData('reportType', 'buyer');
                  setStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                  <TrendingDown className="h-6 w-6 text-brand-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Soy comprador</h3>
                <p className="text-gray-600">
                  Quiero saber si el precio de una propiedad que me interesa está alineado al mercado.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Datos de la propiedad
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Ej: Av. Libertador 1234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => updateFormData('neighborhood', e.target.value)}
                    placeholder="Ej: Palermo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => updateFormData('province', e.target.value)}
                    placeholder="Ej: CABA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="inline h-4 w-4 mr-1" />
                    Tipo de propiedad *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => updateFormData('propertyType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => updateFormData('condition', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline h-4 w-4 mr-1" />
                    m² cubiertos *
                  </label>
                  <input
                    type="number"
                    value={formData.coveredArea}
                    onChange={(e) => updateFormData('coveredArea', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    m² totales
                  </label>
                  <input
                    type="number"
                    value={formData.totalArea}
                    onChange={(e) => updateFormData('totalArea', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambientes
                  </label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => updateFormData('rooms', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baños
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData('bathrooms', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-5 w-5 text-brand-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información adicional para valuación más precisa
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Cuanta más información proporciones, más precisa será la valuación
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    m² semicubiertos
                  </label>
                  <input
                    type="number"
                    value={formData.semiCoveredArea}
                    onChange={(e) => updateFormData('semiCoveredArea', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dormitorios
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData('bedrooms', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cocheras
                  </label>
                  <input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => updateFormData('parkingSpaces', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Piso
                  </label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => updateFormData('floorNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pisos totales del edificio
                  </label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => updateFormData('totalFloors', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orientación
                  </label>
                  <select
                    value={formData.orientation}
                    onChange={(e) => updateFormData('orientation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {orientations.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center pt-8 space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.hasElevator}
                      onChange={(e) => updateFormData('hasElevator', e.target.checked)}
                      className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tiene ascensor
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.value)}
                        onChange={() => toggleAmenity(amenity.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año de construcción
                  </label>
                  <input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => updateFormData('yearBuilt', e.target.value)}
                    placeholder="Ej: 2010"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año de renovación
                  </label>
                  <input
                    type="number"
                    value={formData.renovationYear}
                    onChange={(e) => updateFormData('renovationYear', e.target.value)}
                    placeholder="Si fue renovada"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expensas mensuales (ARS)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) => updateFormData('monthlyExpenses', e.target.value)}
                    placeholder="Monto mensual"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Iluminación natural
                  </label>
                  <select
                    value={formData.naturalLighting}
                    onChange={(e) => updateFormData('naturalLighting', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {lightingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de ruido
                  </label>
                  <select
                    value={formData.noiseLevel}
                    onChange={(e) => updateFormData('noiseLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {noiseOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista
                  </label>
                  <input
                    type="text"
                    value={formData.viewQuality}
                    onChange={(e) => updateFormData('viewQuality', e.target.value)}
                    placeholder="Ej: Vista a parque"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.reportType === 'buyer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio solicitado (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.askedPrice}
                    onChange={(e) => updateFormData('askedPrice', e.target.value)}
                    placeholder="Precio que piden por la propiedad"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              )}

              {!user && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Para recibir tu informe, necesitamos tus datos de contacto
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => updateFormData('contactName', e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData('contactEmail', e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData('contactPhone', e.target.value)}
                      placeholder="+54 911 1234 5678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Volver
                </button>
                <button
                  onClick={generateReport}
                  disabled={loading || !formData.address || !formData.city || !formData.province || !formData.coveredArea || (!user && (!formData.contactName || !formData.contactEmail))}
                  className="flex items-center space-x-2 bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <span>Generar informe</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && report && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Informe de Valor
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-brand-500" />
                  {report.address}, {report.neighborhood || report.city}, {report.province}
                </p>
              </div>

              <div className="text-center py-8 border-b border-gray-200">
                <p className="text-gray-600 mb-2">Valor estimado</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {formatPrice(report.suggested_price)}
                </p>
                <p className="text-gray-500">
                  Rango: {formatPrice(report.estimated_min)} - {formatPrice(report.estimated_max)}
                </p>
              </div>

              {report.price_indicator && (
                <div className={`mt-6 p-4 rounded-lg ${indicatorConfig[report.price_indicator].bgColor}`}>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const Icon = indicatorConfig[report.price_indicator].icon;
                      return <Icon className={`h-6 w-6 ${indicatorConfig[report.price_indicator].color}`} />;
                    })()}
                    <div>
                      <p className={`font-semibold ${indicatorConfig[report.price_indicator].color}`}>
                        {indicatorConfig[report.price_indicator].label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {indicatorConfig[report.price_indicator].description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">Precio/m²</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(report.suggested_price / report.covered_area)}/m²
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">Superficie</p>
                  <p className="text-xl font-bold text-gray-900">
                    {report.covered_area} m²
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">Tiempo estimado de venta</p>
                  <p className="text-xl font-bold text-gray-900">
                    {report.estimated_sale_days} días
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Necesitas más información?
              </h3>
              <p className="text-gray-600 mb-4">
                Habla con uno de nuestros asesores para obtener un análisis más detallado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/propiedades')}
                  className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                >
                  Ver propiedades similares
                </button>
                <button className="flex-1 border border-brand-500 text-brand-500 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors">
                  Hablar con asesor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
