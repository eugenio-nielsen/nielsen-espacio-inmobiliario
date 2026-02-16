import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText, MapPin, Loader2, TrendingUp, TrendingDown, Minus,
  ArrowLeft, Download, Home, Ruler
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { ValueReport, PriceIndicator } from '../../types/database';

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

export default function ValueReportViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState<ValueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadReport();
  }, [id, user]);

  async function loadReport() {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('value_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Informe no encontrado');
        return;
      }

      setReport(data as ValueReport);
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Error al cargar el informe');
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-28">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || 'Informe no encontrado'}
            </h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-brand-500 hover:text-brand-600 mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al dashboard</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 text-white pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <FileText className="h-12 w-12 mb-4 opacity-90" />
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Informe de Valor
              </h1>
              <p className="text-brand-100 text-lg">
                Generado el {new Date(report.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-12">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-500" />
                {report.address}, {report.neighborhood || report.city}, {report.province}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Tipo de propiedad</p>
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-brand-500" />
                  <p className="font-semibold text-gray-900">
                    {report.property_type === 'apartment' ? 'Departamento' :
                     report.property_type === 'house' ? 'Casa' :
                     report.property_type === 'ph' ? 'PH' : 'Terreno'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Superficie</p>
                <div className="flex items-center space-x-2">
                  <Ruler className="h-5 w-5 text-brand-500" />
                  <p className="font-semibold text-gray-900">
                    {report.covered_area} m² cubiertos
                    {report.total_area && ` | ${report.total_area} m² totales`}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-8 border-y border-gray-200">
              <p className="text-gray-600 mb-2">Valor estimado</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {formatPrice(report.suggested_price)}
              </p>
              <p className="text-gray-500">
                Rango: {formatPrice(report.estimated_min)} - {formatPrice(report.estimated_max)}
              </p>
            </div>

            {report.price_indicator && (
              <div className={`mt-6 p-4 rounded-lg ${indicatorConfig[report.price_indicator as PriceIndicator].bgColor}`}>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const Icon = indicatorConfig[report.price_indicator as PriceIndicator].icon;
                    return <Icon className={`h-6 w-6 ${indicatorConfig[report.price_indicator as PriceIndicator].color}`} />;
                  })()}
                  <div>
                    <p className={`font-semibold ${indicatorConfig[report.price_indicator as PriceIndicator].color}`}>
                      {indicatorConfig[report.price_indicator as PriceIndicator].label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {indicatorConfig[report.price_indicator as PriceIndicator].description}
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
                <p className="text-gray-600 text-sm">Ambientes</p>
                <p className="text-xl font-bold text-gray-900">
                  {report.rooms || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Tiempo estimado de venta</p>
                <p className="text-xl font-bold text-gray-900">
                  {report.estimated_sale_days} días
                </p>
              </div>
            </div>

            {(report.bedrooms || report.bathrooms || report.parking_spaces) && (
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {report.bedrooms && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">Dormitorios</p>
                    <p className="text-xl font-bold text-gray-900">{report.bedrooms}</p>
                  </div>
                )}
                {report.bathrooms && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">Baños</p>
                    <p className="text-xl font-bold text-gray-900">{report.bathrooms}</p>
                  </div>
                )}
                {report.parking_spaces > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">Cocheras</p>
                    <p className="text-xl font-bold text-gray-900">{report.parking_spaces}</p>
                  </div>
                )}
              </div>
            )}

            {report.amenities && report.amenities.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {report.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.valuation_breakdown && (
              <div className="mt-6 p-4 bg-brand-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">Detalles de la valuación</p>
                <p className="text-sm text-gray-600">
                  Nivel de confianza: {Math.round((report.confidence_score || 0) * 100)}%
                </p>
              </div>
            )}
          </div>

          <div className="bg-brand-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Necesitas más información?
            </h3>
            <p className="text-gray-600 mb-4">
              Habla con uno de nuestros asesores para obtener un análisis más detallado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/propiedades"
                className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors text-center"
              >
                Ver propiedades similares
              </Link>
              <Link
                to="/informe-valor"
                className="flex-1 border border-brand-500 text-brand-500 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors text-center"
              >
                Generar nuevo informe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
