import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, MapPin, Home, Ruler,
  ArrowRight, TrendingUp, TrendingDown, Minus, Loader2
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PropertyType, PropertyCondition, ValueReport, PriceIndicator } from '../../types/database';

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

function generateMockReport(
  address: string,
  city: string,
  province: string,
  neighborhood: string,
  propertyType: PropertyType,
  coveredArea: number,
  totalArea: number | null,
  condition: PropertyCondition,
  rooms: number,
  bathrooms: number,
  reportType: 'seller' | 'buyer',
  askedPrice?: number
): Omit<ValueReport, 'id' | 'user_id' | 'property_id' | 'created_at'> {
  const baseCityPrice: Record<string, number> = {
    'Buenos Aires': 2600,
    'default': 1500
  };

  const neighborhoodFactor: Record<string, number> = {
    'Palermo': 1.15,
    'Villa Crespo': 1.05,
    'Recoleta': 1.18,
    'Belgrano': 1.12,
    'Caballito': 1.03,
    'default': 1.0
  };

  const uncoveredArea =
    totalArea && totalArea > coveredArea
      ? totalArea - coveredArea
      : 0;

  const effectiveArea = coveredArea + uncoveredArea * 0.35;

  const layoutEfficiency =
    rooms <= 2 ? 1.05 :
    rooms === 3 ? 1.0 :
    rooms === 4 ? 0.97 :
    0.94;

  const typeFactor: Record<PropertyType, number> = {
    apartment: 1.0,
    ph: 0.95,
    house: 0.9,
    land: 0.4
  };

  const conditionFactor: Record<PropertyCondition, number> = {
    new: 1.25,
    excellent: 1.12,
    good: 1.0,
    fair: 0.88,
    to_renovate: 0.7
  };

  const agePenalty =
    condition === 'new' ? 1.0 :
    condition === 'excellent' ? 0.98 :
    condition === 'good' ? 0.95 :
    0.9;

  const pricePerSqm =
    (baseCityPrice[city] || baseCityPrice.default) *
    (neighborhoodFactor[neighborhood] || neighborhoodFactor.default) *
    typeFactor[propertyType] *
    layoutEfficiency *
    conditionFactor[condition] *
    agePenalty;

  const suggestedPrice = Math.round(effectiveArea * pricePerSqm);

  const liquidityScore =
    (neighborhoodFactor[neighborhood] || neighborhoodFactor.default) *
    layoutEfficiency *
    conditionFactor[condition];

  const variance =
    liquidityScore > 1.15 ? 0.12 :
    liquidityScore > 1.0  ? 0.15 :
    liquidityScore > 0.9  ? 0.18 :
                            0.22;

  const estimatedMin = Math.round(suggestedPrice * (1 - variance));
  const estimatedMax = Math.round(suggestedPrice * (1 + variance));

  const estimated_sale_days =
    liquidityScore > 1.2 ? 30 :
    liquidityScore > 1.1 ? 45 :
    liquidityScore > 1.0 ? 60 :
    liquidityScore > 0.9 ? 90 :
                           120;

  let price_indicator: PriceIndicator = 'market';
  if (askedPrice) {
    const diff = (askedPrice - suggestedPrice) / suggestedPrice;
    if (diff > 0.1) price_indicator = 'overpriced';
    else if (diff < -0.1) price_indicator = 'opportunity';
  }

  const comparables = [
    {
      id: '1',
      address: `${address.split(' ')[0]} ${Math.floor(Math.random() * 1000)}`,
      price: Math.round(suggestedPrice * (0.9 + Math.random() * 0.2)),
      covered_area: coveredArea + Math.floor(Math.random() * 20) - 10,
      price_per_sqm: Math.round(pricePerSqm * (0.95 + Math.random() * 0.1)),
      days_on_market: Math.floor(Math.random() * 90) + 15
    },
    {
      id: '2',
      address: `Calle ${Math.floor(Math.random() * 100)}`,
      price: Math.round(suggestedPrice * (0.85 + Math.random() * 0.3)),
      covered_area: coveredArea + Math.floor(Math.random() * 30) - 15,
      price_per_sqm: Math.round(pricePerSqm * (0.9 + Math.random() * 0.2)),
      days_on_market: Math.floor(Math.random() * 120) + 10
    },
    {
      id: '3',
      address: `Av. ${['Principal', 'Central', 'Norte', 'Sur'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 500)}`,
      price: Math.round(suggestedPrice * (0.95 + Math.random() * 0.15)),
      covered_area: coveredArea + Math.floor(Math.random() * 15) - 7,
      price_per_sqm: Math.round(pricePerSqm * (0.92 + Math.random() * 0.16)),
      days_on_market: Math.floor(Math.random() * 60) + 20
    }
  ];

  return {
    report_type: reportType,
    address,
    city,
    neighborhood,
    province,
    property_type: propertyType,
    covered_area: coveredArea,
    total_area: totalArea,
    property_condition: condition,
    rooms,
    bathrooms,
    estimated_min: estimatedMin,
    estimated_max: estimatedMax,
    suggested_price: suggestedPrice,
    price_indicator: price_indicator,
    estimated_sale_days: estimated_sale_days,
    comparables
  };
}

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
    totalArea: '',
    condition: 'good' as PropertyCondition,
    rooms: '',
    bathrooms: '',
    askedPrice: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    setLoading(true);

    const reportData = generateMockReport(
      formData.address,
      formData.city,
      formData.province,
      formData.neighborhood,
      formData.propertyType,
      parseFloat(formData.coveredArea),
      formData.totalArea ? parseFloat(formData.totalArea) : null,
      formData.condition,
      formData.rooms ? parseInt(formData.rooms) : 0,
      formData.bathrooms ? parseInt(formData.bathrooms) : 0,
      formData.reportType,
      formData.askedPrice ? parseFloat(formData.askedPrice) : undefined
    );

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
    setLoading(false);
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
