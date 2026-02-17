import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, FileText, Calculator, BookOpen, ArrowRight,
  TrendingUp, Shield, Users, CheckCircle, ChevronRight, Play
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import PropertyCard from '../../components/property/PropertyCard';
import { supabase } from '../../lib/supabase';
import type { Property, PropertyImage } from '../../types/database';

type PropertyWithImages = Property & { images: PropertyImage[] };

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<PropertyWithImages[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  async function fetchFeaturedProperties() {
    const { data } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);

    if (data) {
      setFeaturedProperties(data as PropertyWithImages[]);
    }
  }

  return (
    <Layout>
      <section className="relative min-h-screen flex items-center bg-brand-900">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium tracking-wide">La nueva forma de comprar propiedades</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              Comprá y Vendé
              <span className="block text-accent-400">Dueños Directo.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl">
              Propiedades publicadas directamente por sus Dueños.
              Comprá y Vendé Sin comisión inmobiliaria con el respaldo de nuestra plataforma
            </p>

            <div className="bg-white rounded-lg p-2 shadow-elegant-xl max-w-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    type="text"
                    placeholder="Buscar por ubicacion, tipo de propiedad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-md text-content bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <Link
                  to={`/propiedades${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                  className="bg-brand-500 text-white px-8 py-4 rounded-md font-medium hover:bg-brand-600 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Buscar</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/informe-valor"
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white border border-white/20 hover:border-white/40 px-5 py-3 rounded-md transition-all duration-300 group"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium">Obtener informe de valor</span>
              </Link>
              <Link
                to="/publicar"
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white border border-white/20 hover:border-white/40 px-5 py-3 rounded-md transition-all duration-300 group"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Publicar propiedad</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
      </section>

      <section className="py-24 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase mb-3 block">
                Seleccion Premium
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-content">
                Propiedades en Buenos Aires Destacadas
              </h2>
              <p className="text-content-muted mt-3 max-w-xl">
                Encontrá oportunidades en estas propiedades en Buenos Aires. Contactate directo con el dueño! Nosotros estamos para ayudarte!
              </p>
            </div>
            <Link
              to="/propiedades"
              className="hidden md:flex items-center space-x-2 text-brand-500 font-semibold hover:text-brand-600 transition-colors mt-6 md:mt-0 group"
            >
              <span>Ver todo el catalogo</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-elegant overflow-hidden">
                  <div className="h-64 bg-surface-muted animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-surface-muted rounded animate-pulse" />
                    <div className="h-4 bg-surface-muted rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-surface-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              to="/propiedades"
              className="inline-flex items-center space-x-2 text-brand-500 font-semibold"
            >
              <span>Ver todas las propiedades</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={FileText}
              title="Informes de Valor"
              description="Valuaciones precisas basadas en datos reales del mercado y comparables de la zona."
              link="/informe-valor"
            />
            <FeatureCard
              icon={Search}
              title="Propiedades Exclusivas"
              description="Catalogo curado de propiedades premium con filtros avanzados de busqueda."
              link="/propiedades"
            />
            <FeatureCard
              icon={Calculator}
              title="Herramientas Pro"
              description="Calculadoras de rentabilidad, simuladores de credito y analisis de inversion."
              link="/herramientas"
            />
            <FeatureCard
              icon={BookOpen}
              title="Guias Especializadas"
              description="Contenido experto para tomar decisiones inmobiliarias informadas."
              link="/guias"
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-4 block">
                Valuacion Profesional
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-6">
                Conoce el Valor Real de tu Propiedad
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Nuestro sistema de valuacion analiza comparables de mercado, tendencias de precios
                y caracteristicas especificas para darte un rango de precio preciso y confiable.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90">Valuacion basada en comparables reales</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90">Indicador de precio de mercado</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90">Tiempo estimado de venta</span>
                </li>
              </ul>
              <Link
                to="/informe-valor"
                className="inline-flex items-center space-x-3 bg-white text-brand-600 px-8 py-4 rounded-md font-semibold hover:bg-accent-50 transition-all duration-300 group"
              >
                <span>Obtener informe gratuito</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-elegant-xl">
                <img
                  src="https://images.pexels.com/photos/7578939/pexels-photo-7578939.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Valuacion de propiedades"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-6 shadow-elegant-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-content-muted text-sm">Valor estimado</p>
                    <p className="text-2xl font-bold text-content">USD 285,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase mb-3 block">
              Por que elegirnos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-content mb-4">
              La Diferencia de Espacio Inmobiliario
            </h2>
            <p className="text-content-muted max-w-2xl mx-auto">
              Entendemos que el proceso inmobiliario es mucho más que una transacción. Para muchos es un momento de gran importancia e incertidumbre. Por eso, hacemos el proceso más cercano, transparente y seguro, ¡para todos!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-100 transition-colors">
                <TrendingUp className="h-10 w-10 text-brand-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-content mb-3">Datos del Mercado</h3>
              <p className="text-content-muted leading-relaxed">
                Analisis basado en datos reales y actualizados constantemente para decisiones informadas.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-100 transition-colors">
                <Shield className="h-10 w-10 text-brand-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-content mb-3">Transparencia Total</h3>
              <p className="text-content-muted leading-relaxed">
                Sin comisiones ocultas ni intermediarios. Conectamos compradores directamente con vendedores.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-100 transition-colors">
                <Users className="h-10 w-10 text-brand-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-content mb-3">Asesoramiento Experto</h3>
              <p className="text-content-muted leading-relaxed">
                Equipo de profesionales disponible para guiarte en cada paso de tu operacion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-brand-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <path
              d="M0,200 Q100,180 200,200 T400,200 Q500,190 600,200 T800,200 Q900,210 1000,200 T1200,200 L1200,400 Q1100,410 1000,400 T800,400 Q700,390 600,400 T400,400 Q300,410 200,400 T0,400 Z"
              fill="url(#mapGradient)"
              opacity="0.2"
            />

            <path
              d="M100,250 Q150,230 200,250 L220,280 Q180,300 150,280 Z M300,200 Q350,180 400,200 L420,240 Q380,260 350,240 Z M700,220 Q750,200 800,220 L820,260 Q780,280 750,260 Z"
              fill="currentColor"
              opacity="0.15"
            />

            <g className="animate-pulse">
              <circle cx="280" cy="280" r="8" fill="#10b981" opacity="0.8" />
              <circle cx="280" cy="280" r="16" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4" />
              <text x="280" y="310" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0.9">Miami</text>
            </g>

            <g className="animate-pulse" style={{ animationDelay: '0.3s' }}>
              <circle cx="450" cy="420" r="8" fill="#10b981" opacity="0.8" />
              <circle cx="450" cy="420" r="16" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4" />
              <text x="450" y="450" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0.9">Buenos Aires</text>
            </g>

            <g className="animate-pulse" style={{ animationDelay: '0.6s' }}>
              <circle cx="620" cy="240" r="8" fill="#10b981" opacity="0.8" />
              <circle cx="620" cy="240" r="16" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4" />
              <text x="620" y="270" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0.9">Madrid</text>
            </g>

            <path
              d="M280,280 Q365,320 450,420"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              opacity="0.3"
            />
            <path
              d="M450,420 Q535,330 620,240"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              opacity="0.3"
            />
            <path
              d="M280,280 Q450,220 620,240"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              opacity="0.3"
            />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-6">
            Comienza tu Busqueda Hoy
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Unite a miles de usuarios que ya confian en Espacio Inmobiliario para encontrar
            su propiedad ideal o vender al mejor precio del mercado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/registro"
              className="bg-white text-brand-700 px-10 py-4 rounded-md font-semibold hover:bg-accent-50 transition-all duration-300"
            >
              Crear cuenta gratuita
            </Link>
            <Link
              to="/propiedades"
              className="border border-white/30 text-white px-10 py-4 rounded-md font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Explorar propiedades
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, description, link }: {
  icon: typeof FileText;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="group p-8 bg-white rounded-lg shadow-elegant hover:shadow-elegant-lg transition-all duration-300 border border-gray-100"
    >
      <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-100 transition-colors">
        <Icon className="h-7 w-7 text-brand-500" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-content mb-3">{title}</h3>
      <p className="text-content-muted text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-brand-500 font-medium group-hover:text-brand-600">
        <span>Explorar</span>
        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
