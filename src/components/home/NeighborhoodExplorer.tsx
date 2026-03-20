import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Clock, ShieldCheck, ChevronRight, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NeighborhoodData {
  neighborhood: string;
  avg_price_per_sqm: number | null;
  avg_days_on_market: number | null;
  safety_score: number | null;
  transport_score: number | null;
  description: string | null;
  property_count: number;
}

const NEIGHBORHOOD_IMAGES: Record<string, string> = {
  'Palermo': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Recoleta': 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Belgrano': 'https://images.pexels.com/photos/2079234/pexels-photo-2079234.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Puerto Madero': 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Caballito': 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Villa Crespo': 'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Núñez': 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Barrio Norte': 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
  'San Telmo': 'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Colegiales': 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600',
};

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=600';

const FEATURED_NEIGHBORHOODS = [
  'Palermo', 'Recoleta', 'Belgrano', 'Puerto Madero',
  'Caballito', 'Villa Crespo', 'Núñez', 'Barrio Norte',
];

export default function NeighborhoodExplorer() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  async function fetchNeighborhoods() {
    const { data: neighborhoodData } = await supabase
      .from('neighborhood_characteristics')
      .select('neighborhood, avg_price_per_sqm, avg_days_on_market, safety_score, transport_score, description')
      .in('neighborhood', FEATURED_NEIGHBORHOODS)
      .order('avg_price_per_sqm', { ascending: false });

    const { data: propertyCounts } = await supabase
      .from('properties')
      .select('neighborhood')
      .eq('status', 'active')
      .not('neighborhood', 'is', null);

    const countMap: Record<string, number> = {};
    if (propertyCounts) {
      propertyCounts.forEach((p) => {
        const n = p.neighborhood as string;
        countMap[n] = (countMap[n] || 0) + 1;
      });
    }

    if (neighborhoodData) {
      const merged: NeighborhoodData[] = neighborhoodData.map((n) => ({
        ...n,
        property_count: countMap[n.neighborhood] || 0,
      }));
      setNeighborhoods(merged);
    }

    setLoading(false);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-24 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-80 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (neighborhoods.length === 0) return null;

  return (
    <section className="py-24 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase mb-3 block">
            Explora Buenos Aires
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-content mb-4">
            Barrios Destacados
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto text-lg">
            Descubri las mejores zonas para vivir e invertir. Cada barrio tiene su personalidad y oportunidades unicas.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {neighborhoods.map((n, index) => {
            const isHovered = hoveredIndex === index;
            const image = NEIGHBORHOOD_IMAGES[n.neighborhood] || DEFAULT_IMAGE;

            return (
              <Link
                key={n.neighborhood}
                to={`/propiedades?search=${encodeURIComponent(n.neighborhood)}`}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] lg:aspect-[3/4]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={image}
                  alt={n.neighborhood}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}
                />

                <div className={`absolute inset-0 transition-all duration-500 ${
                  isHovered
                    ? 'bg-gradient-to-t from-brand-900/95 via-brand-900/60 to-brand-900/20'
                    : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
                }`} />

                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-accent-400" />
                      <span className="text-white/70 text-xs font-medium">Buenos Aires</span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-white mb-2">
                      {n.neighborhood}
                    </h3>

                    <div className={`transition-all duration-500 overflow-hidden ${
                      isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 md:max-h-0 md:opacity-0'
                    }`}>
                      <div className="space-y-1.5 pt-2 border-t border-white/20">
                        {n.avg_price_per_sqm && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-accent-400 flex-shrink-0" />
                            <span className="text-white/80 text-xs">{formatPrice(n.avg_price_per_sqm)}/m²</span>
                          </div>
                        )}
                        {n.avg_days_on_market && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-accent-400 flex-shrink-0" />
                            <span className="text-white/80 text-xs">{n.avg_days_on_market} dias promedio</span>
                          </div>
                        )}
                        {n.safety_score && (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-accent-400 flex-shrink-0" />
                            <span className="text-white/80 text-xs">Seguridad: {n.safety_score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 mt-2 transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-x-0' : 'opacity-70 -translate-x-1'
                    }`}>
                      {n.property_count > 0 ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-accent-400" />
                          <span className="text-white/80 text-xs font-medium">
                            {n.property_count} propiedad{n.property_count > 1 ? 'es' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60 text-xs">Ver propiedades</span>
                      )}
                      <ChevronRight className={`h-3.5 w-3.5 text-white/60 transition-transform duration-300 ${
                        isHovered ? 'translate-x-1' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/propiedades"
            className="inline-flex items-center space-x-2 text-brand-500 font-semibold hover:text-brand-600 transition-colors group"
          >
            <span>Ver todos los barrios</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
