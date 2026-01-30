import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { PropertyType, OperationType } from '../../types/database';

interface FilterValues {
  search: string;
  propertyType: PropertyType | '';
  operationType: OperationType;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  bedrooms: string;
  city: string;
}

interface PropertyFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

const propertyTypes = [
  { value: '', label: 'Todos los tipos' },
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'ph', label: 'PH' },
  { value: 'land', label: 'Terreno' }
];

const cities = [
  { value: '', label: 'Todas las ciudades' },
  { value: 'Buenos Aires', label: 'Buenos Aires' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Rosario', label: 'Rosario' },
  { value: 'Mendoza', label: 'Mendoza' },
  { value: 'La Plata', label: 'La Plata' }
];

export default function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof FilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
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
  };

  const hasActiveFilters = filters.search || filters.propertyType || filters.minPrice ||
    filters.maxPrice || filters.minArea || filters.maxArea || filters.bedrooms || filters.city;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ubicación, título..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleChange('operationType', 'sale')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              filters.operationType === 'sale'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Venta
          </button>
          <button
            onClick={() => handleChange('operationType', 'rent')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              filters.operationType === 'rent'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alquiler
          </button>
        </div>

        <select
          value={filters.propertyType}
          onChange={(e) => handleChange('propertyType', e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(e) => handleChange('city', e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {cities.map(city => (
            <option key={city.value} value={city.value}>{city.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
            <input
              type="number"
              placeholder="USD 0"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
            <input
              type="number"
              placeholder="Sin límite"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Superficie mín. (m²)</label>
            <input
              type="number"
              placeholder="0 m²"
              value={filters.minArea}
              onChange={(e) => handleChange('minArea', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Superficie máx. (m²)</label>
            <input
              type="number"
              placeholder="Sin límite"
              value={filters.maxArea}
              onChange={(e) => handleChange('maxArea', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dormitorios</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}
    </div>
  );
}

export type { FilterValues };
