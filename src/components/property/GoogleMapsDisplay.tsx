import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api';
import { MapPin, Maximize2, Loader2 } from 'lucide-react';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '0.75rem'
};

interface GoogleMapsDisplayProps {
  latitude: number;
  longitude: number;
  address: string;
}

const BRAND_MARKER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#1A365D"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
  </svg>`
)}`;

export default function GoogleMapsDisplay({ latitude, longitude, address }: GoogleMapsDisplayProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapType, setMapType] = useState<'map' | 'streetview'>('map');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const position = { lat: latitude, lng: longitude };

  const brandMarkerIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return {
      url: BRAND_MARKER_SVG,
      scaledSize: new google.maps.Size(32, 44),
      anchor: new google.maps.Point(16, 44),
    };
  }, [isLoaded]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const toggleFullscreen = () => {
    if (map) {
      const mapDiv = map.getDiv();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapDiv.requestFullscreen();
      }
    }
  };

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Configuracion necesaria:</strong> Para usar Google Maps, necesitas agregar tu API key en el archivo .env como VITE_GOOGLE_MAPS_API_KEY
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ height: '450px' }}>
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold text-lg">Ubicación</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMapType('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mapType === 'map'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setMapType('streetview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mapType === 'streetview'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Street View
              </button>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Pantalla completa"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
          {mapType === 'map' ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={position}
              zoom={16}
              onLoad={onLoad}
              options={{
                streetViewControl: true,
                mapTypeControl: true,
                fullscreenControl: false,
                zoomControl: true,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                  }
                ]
              }}
            >
              <Marker
                position={position}
                title={address}
                icon={brandMarkerIcon}
              />
            </GoogleMap>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={position}
              zoom={16}
              options={{
                streetView: null,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: false
              }}
            >
              <StreetViewPanorama
                position={position}
                visible={true}
                options={{
                  pov: { heading: 0, pitch: 0 },
                  zoom: 1,
                  addressControl: false,
                  fullscreenControl: false,
                  panControl: true,
                  zoomControl: true
                }}
              />
            </GoogleMap>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Dirección</p>
          <p className="font-medium text-gray-900">{address}</p>
        </div>
      </div>
  );
}
