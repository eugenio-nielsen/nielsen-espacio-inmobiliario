import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPin, Loader2, Navigation } from 'lucide-react';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816
};

interface GoogleMapsPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  city?: string;
  neighborhood?: string;
  province?: string;
  onCityChange?: (city: string) => void;
  onNeighborhoodChange?: (neighborhood: string) => void;
  onProvinceChange?: (province: string) => void;
}

export default function GoogleMapsPicker({
  address,
  onAddressChange,
  onLocationChange,
  initialLat,
  initialLng,
  city = '',
  neighborhood = '',
  province = '',
  onCityChange,
  onNeighborhoodChange,
  onProvinceChange
}: GoogleMapsPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [mapCenter, setMapCenter] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      const newPos = { lat: initialLat, lng: initialLng };
      setMapCenter(newPos);
      setMarkerPosition(newPos);
    }
  }, [initialLat, initialLng]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onAutocompleteLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!apiKey) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results && result.results[0]) {
        const place = result.results[0];
        const formattedAddress = place.formatted_address;

        onAddressChange(formattedAddress);

        let extractedCity = '';
        let extractedNeighborhood = '';
        let extractedProvince = '';

        place.address_components.forEach((component) => {
          if (component.types.includes('locality')) {
            extractedCity = component.long_name;
          }
          if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
            extractedNeighborhood = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            extractedProvince = component.long_name;
          }
        });

        if (onCityChange && extractedCity) onCityChange(extractedCity);
        if (onNeighborhoodChange && extractedNeighborhood) onNeighborhoodChange(extractedNeighborhood);
        if (onProvinceChange && extractedProvince) onProvinceChange(extractedProvince);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  }, [apiKey, onAddressChange, onCityChange, onNeighborhoodChange, onProvinceChange]);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPosition = { lat, lng };

        setMapCenter(newPosition);
        setMarkerPosition(newPosition);
        onLocationChange(lat, lng);

        if (place.formatted_address) {
          onAddressChange(place.formatted_address);
        }

        let extractedCity = '';
        let extractedNeighborhood = '';
        let extractedProvince = '';

        place.address_components?.forEach((component) => {
          if (component.types.includes('locality')) {
            extractedCity = component.long_name;
          }
          if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
            extractedNeighborhood = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            extractedProvince = component.long_name;
          }
        });

        if (onCityChange && extractedCity) onCityChange(extractedCity);
        if (onNeighborhoodChange && extractedNeighborhood) onNeighborhoodChange(extractedNeighborhood);
        if (onProvinceChange && extractedProvince) onProvinceChange(extractedProvince);
      }
    }
  }, [autocomplete, onAddressChange, onLocationChange, onCityChange, onNeighborhoodChange, onProvinceChange]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newPosition = { lat, lng };

      setMarkerPosition(newPosition);
      onLocationChange(lat, lng);
      reverseGeocode(lat, lng);
    }
  }, [onLocationChange, reverseGeocode]);

  const getCurrentLocation = useCallback(() => {
    setGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPosition = { lat, lng };

          setMapCenter(newPosition);
          setMarkerPosition(newPosition);
          onLocationChange(lat, lng);
          reverseGeocode(lat, lng);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos del navegador.');
        }
      );
    } else {
      setGettingLocation(false);
      alert('Tu navegador no soporta geolocalización.');
    }
  }, [onLocationChange, reverseGeocode]);

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Configuración necesaria:</strong> Para usar Google Maps, necesitas agregar tu API key en el archivo .env como VITE_GOOGLE_MAPS_API_KEY
        </p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar dirección
          </label>
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: 'ar' },
              fields: ['address_components', 'geometry', 'formatted_address']
            }}
          >
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                defaultValue={address}
                placeholder="Busca tu dirección aquí..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </Autocomplete>
        </div>

        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <MapPin className="h-4 w-4" />
            <span>Arrastra el marcador para ajustar la ubicación exacta</span>
          </div>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {gettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Mi ubicación
          </button>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onLoad}
          options={{
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true
          }}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        </GoogleMap>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Ciudad:</span>
            <p className="font-medium text-gray-900 truncate">{city || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Barrio:</span>
            <p className="font-medium text-gray-900 truncate">{neighborhood || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Provincia:</span>
            <p className="font-medium text-gray-900 truncate">{province || '-'}</p>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
