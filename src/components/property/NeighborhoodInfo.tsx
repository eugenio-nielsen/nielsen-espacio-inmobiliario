import { useState, useEffect } from 'react';
import { Brain as Train, GraduationCap, ShoppingBag, ShieldCheck, MapPin, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { NeighborhoodCharacteristics } from '../../types/database';

interface NeighborhoodInfoProps {
  neighborhood: string | null;
  city: string;
}

const scoreLabels: Record<number, { label: string; color: string }> = {
  10: { label: 'Excelente', color: 'text-emerald-600 bg-emerald-50' },
  9: { label: 'Muy Bueno', color: 'text-emerald-600 bg-emerald-50' },
  8: { label: 'Bueno', color: 'text-blue-600 bg-blue-50' },
  7: { label: 'Bueno', color: 'text-blue-600 bg-blue-50' },
  6: { label: 'Regular', color: 'text-amber-600 bg-amber-50' },
  5: { label: 'Regular', color: 'text-amber-600 bg-amber-50' },
  4: { label: 'Bajo', color: 'text-red-600 bg-red-50' },
  3: { label: 'Bajo', color: 'text-red-600 bg-red-50' },
  2: { label: 'Bajo', color: 'text-red-600 bg-red-50' },
  1: { label: 'Bajo', color: 'text-red-600 bg-red-50' },
};

function getScoreInfo(score: number | null) {
  if (!score) return { label: 'Sin datos', color: 'text-gray-500 bg-gray-50' };
  return scoreLabels[score] || { label: 'Sin datos', color: 'text-gray-500 bg-gray-50' };
}

function ScoreBar({ value }: { value: number | null }) {
  const score = value || 0;
  return (
    <div className="flex items-center gap-1 mt-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            i < score
              ? score >= 8 ? 'bg-emerald-400' : score >= 6 ? 'bg-blue-400' : score >= 4 ? 'bg-amber-400' : 'bg-red-400'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function NeighborhoodInfo({ neighborhood, city }: NeighborhoodInfoProps) {
  const [data, setData] = useState<NeighborhoodCharacteristics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (neighborhood) {
      fetchNeighborhoodData();
    } else {
      setLoading(false);
    }
  }, [neighborhood, city]);

  async function fetchNeighborhoodData() {
    const { data: result } = await supabase
      .from('neighborhood_characteristics')
      .select('*')
      .eq('neighborhood', neighborhood!)
      .eq('city', city)
      .maybeSingle();

    if (result) {
      setData(result as NeighborhoodCharacteristics);
    }
    setLoading(false);
  }

  if (loading || !data) return null;

  const scores = [
    {
      icon: Train,
      label: 'Transporte',
      score: data.transport_score,
      info: getScoreInfo(data.transport_score),
    },
    {
      icon: GraduationCap,
      label: 'Colegios',
      score: data.schools_score,
      info: getScoreInfo(data.schools_score),
    },
    {
      icon: ShoppingBag,
      label: 'Comercio',
      score: data.commerce_score,
      info: getScoreInfo(data.commerce_score),
    },
    {
      icon: ShieldCheck,
      label: 'Seguridad',
      score: data.safety_score,
      info: getScoreInfo(data.safety_score),
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-elegant p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
          <MapPin className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-content">Sobre {data.neighborhood}</h2>
          <p className="text-sm text-content-muted">{data.city}, {data.province}</p>
        </div>
      </div>

      {data.description && (
        <p className="text-content-muted leading-relaxed mb-6">{data.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.avg_price_per_sqm && (
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-medium text-content-muted uppercase tracking-wide">Precio promedio</span>
            </div>
            <p className="text-lg font-bold text-content">{formatPrice(data.avg_price_per_sqm)}/m²</p>
          </div>
        )}
        {data.avg_days_on_market && (
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-medium text-content-muted uppercase tracking-wide">Tiempo de venta</span>
            </div>
            <p className="text-lg font-bold text-content">{data.avg_days_on_market} dias</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-content-muted uppercase tracking-wide">Indicadores del barrio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scores.map(({ icon: Icon, label, score, info }) => (
            <div key={label} className="bg-surface-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-content-muted" />
                  <span className="text-sm font-medium text-content">{label}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                  {score}/10
                </span>
              </div>
              <ScoreBar value={score} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
