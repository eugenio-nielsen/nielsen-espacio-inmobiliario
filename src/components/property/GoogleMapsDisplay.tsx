import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, StreetViewPanorama } from '@react-google-maps/api';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';

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

export default function GoogleMapsDisplay({ latitude, longitude, address }: GoogleMapsDisplayProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [mapType, setMapType] = useState<'map' | 'streetview'>('map');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const position = { lat: latitude, lng: longitude };

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

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
          <strong>Configuración necesaria:</strong> Para usar Google Maps, necesitas agregar tu API key en el archivo .env como VITE_GOOGLE_MAPS_API_KEY
        </p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
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

        <div className="flex items-start justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Dirección</p>
            <p className="font-medium text-gray-900">{address}</p>
          </div>
          <button
            onClick={openInGoogleMaps}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
          >
            <Navigation className="h-4 w-4" />
            Cómo llegar
          </button>
        </div>
      </div>
    </LoadScript>
  );
}
