import { Link } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Bath, Car, Heart } from 'lucide-react';
import type { Property, PropertyImage } from '../../types/database';

interface PropertyCardProps {
  property: Property & { images?: PropertyImage[] };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const propertyTypeLabels = {
  apartment: 'Departamento',
  house: 'Casa',
  ph: 'PH',
  land: 'Terreno'
};

const operationTypeLabels = {
  sale: 'Venta',
  rent: 'Alquiler'
};

export default function PropertyCard({ property, onFavorite, isFavorite }: PropertyCardProps) {
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  const imageUrl = primaryImage?.url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatLocation = (neighborhood: string | null, city: string, province: string) => {
    const parts = [];

    if (neighborhood) {
      parts.push(neighborhood);
    }

    const cityDisplay = province === 'Ciudad Autónoma de Buenos Aires' || province === 'CABA'
      ? 'CABA'
      : province;

    parts.push(cityDisplay);

    return parts.join(', ');
  };

  return (
    <Link to={`/propiedad/${property.id}`}>
      <div className="relative rounded-lg shadow-elegant overflow-hidden hover:shadow-elegant-lg transition-all duration-300 group h-[500px]">
        <img
          src={imageUrl}
          alt={property.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <span className="bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md tracking-wide">
            {operationTypeLabels[property.operation_type]}
          </span>
          <span className="bg-white/95 backdrop-blur-sm text-content text-xs font-semibold px-3 py-1.5 rounded-md">
            {propertyTypeLabels[property.property_type]}
          </span>
        </div>

        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite(property.id);
            }}
            className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 z-10 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/95 backdrop-blur-sm text-content-muted hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="mb-3">
            <p className="text-3xl font-bold text-white font-serif">
              {formatPrice(property.price, property.currency)}
            </p>
            {(property.total_area || property.covered_area) && (
              <p className="text-sm text-white/80 mt-1">
                {formatPrice(property.price / (property.total_area || property.covered_area || 1), property.currency)}/m2
              </p>
            )}
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
            {property.title}
          </h3>

          <div className="flex items-center text-white/90 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="line-clamp-1">{formatLocation(property.neighborhood, property.city, property.province)}</span>
          </div>

          <div className="flex items-center justify-between text-white/90 text-sm border-t border-white/20 pt-4">
            {(property.total_area || property.covered_area) && (
              <div className="flex items-center space-x-1.5">
                <Maximize className="h-4 w-4" />
                <span className="font-medium">{property.total_area || property.covered_area} m2</span>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="flex items-center space-x-1.5">
                <BedDouble className="h-4 w-4" />
                <span className="font-medium">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-1.5">
                <Bath className="h-4 w-4" />
                <span className="font-medium">{property.bathrooms}</span>
              </div>
            )}
            {property.garages > 0 && (
              <div className="flex items-center space-x-1.5">
                <Car className="h-4 w-4" />
                <span className="font-medium">{property.garages}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
