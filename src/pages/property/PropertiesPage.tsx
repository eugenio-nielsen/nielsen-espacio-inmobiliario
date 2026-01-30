import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyFilters, { FilterValues } from '../../components/property/PropertyFilters';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Property, PropertyImage } from '../../types/database';

type PropertyWithImages = Property & { images: PropertyImage[] };

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    propertyType: '',
    operationType: 'sale',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    bedrooms: '',
    city: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  async function fetchProperties() {
    setLoading(true);
    let query = supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('status', 'active')
      .eq('operation_type', filters.operationType)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.minPrice) {
      query = query.gte('price', parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.lte('price', parseFloat(filters.maxPrice));
    }

    if (filters.minArea) {
      query = query.gte('covered_area', parseFloat(filters.minArea));
    }

    if (filters.maxArea) {
      query = query.lte('covered_area', parseFloat(filters.maxArea));
    }

    if (filters.bedrooms) {
      query = query.gte('bedrooms', parseInt(filters.bedrooms));
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%,neighborhood.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setProperties(data as PropertyWithImages[]);
    }
    setLoading(false);
  }

  async function fetchFavorites() {
    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user!.id);

    if (data) {
      setFavorites(data.map(f => f.property_id));
    }
  }

  async function toggleFavorite(propertyId: string) {
    if (!user) return;

    if (favorites.includes(propertyId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });
      setFavorites([...favorites, propertyId]);
    }
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Propiedades en {filters.operationType === 'sale' ? 'Venta' : 'Alquiler'}
              </h1>
              <p className="text-brand-100">
                Encuentra tu próximo hogar o inversión
              </p>
            </div>
            {user && (
              <Link
                to="/publicar"
                className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-white text-brand-500 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Publicar propiedad</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <PropertyFilters filters={filters} onFilterChange={setFilters} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No encontramos propiedades
            </h3>
            <p className="text-gray-600">
              Intenta modificar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} encontrada{properties.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavorite={user ? toggleFavorite : undefined}
                  isFavorite={favorites.includes(property.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
