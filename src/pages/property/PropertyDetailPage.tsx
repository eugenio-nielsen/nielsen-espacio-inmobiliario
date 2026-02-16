import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Maximize, BedDouble, Bath, Car, Heart, Share2,
  ChevronLeft, ChevronRight, Mail, Calendar, Eye,
  CheckCircle, Home, Loader2, FileText
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import ScheduleVisitModal from '../../components/property/ScheduleVisitModal';
import GoogleMapsDisplay from '../../components/property/GoogleMapsDisplay';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Property, PropertyImage, PropertyVideo, PropertyPlan, Profile } from '../../types/database';

type PropertyWithDetails = Property & {
  images: PropertyImage[];
  videos: PropertyVideo[];
  plans: PropertyPlan[];
  owner?: Profile;
};

const propertyTypeLabels = {
  apartment: 'Departamento',
  house: 'Casa',
  ph: 'PH',
  land: 'Terreno'
};

const conditionLabels = {
  new: 'A estrenar',
  excellent: 'Excelente',
  good: 'Bueno',
  fair: 'Regular',
  to_renovate: 'A refaccionar'
};

const amenityLabels: Record<string, string> = {
  pool: 'Pileta',
  gym: 'Gimnasio',
  security: 'Seguridad 24hs',
  laundry: 'Lavadero',
  balcony: 'Balcón',
  terrace: 'Terraza',
  garden: 'Jardín',
  garage: 'Cochera',
  elevator: 'Ascensor',
  ac: 'Aire acondicionado',
  heating: 'Calefacción',
  storage: 'Baulera'
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: ''
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      recordView();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkFavorite();
      fetchUserProfile();
    }
  }, [user, id]);

  async function fetchUserProfile() {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setContactForm({
        name: data.full_name || '',
        email: data.email || '',
        whatsapp: data.phone || '',
        message: ''
      });
    }
  }

  async function fetchProperty() {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images:property_images(*),
        videos:property_videos(*),
        plans:property_plans(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setProperty(data as PropertyWithDetails);
    }
    setLoading(false);
  }

  async function recordView() {
    if (!id) return;

    const sessionId = getOrCreateSessionId();
    const userAgent = navigator.userAgent;

    try {
      await supabase.rpc('record_property_view', {
        p_property_id: id,
        p_session_id: sessionId,
        p_user_id: user?.id || null,
        p_ip_address: null,
        p_user_agent: userAgent
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  function getOrCreateSessionId(): string {
    const SESSION_KEY = 'property_view_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  async function checkFavorite() {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user!.id)
      .eq('property_id', id!)
      .maybeSingle();

    setIsFavorite(!!data);
  }

  async function toggleFavorite() {
    if (!user || !id) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: id });
      setIsFavorite(true);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || submittingContact) return;

    setSubmittingContact(true);

    const { error } = await supabase
      .from('leads')
      .insert({
        property_id: id,
        user_id: user?.id || null,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.whatsapp,
        message: contactForm.message || null,
        lead_type: 'property_inquiry',
        status: 'new'
      });

    if (!error) {
      setContactSuccess(true);
      if (!user) {
        setContactForm({
          name: '',
          email: '',
          whatsapp: '',
          message: ''
        });
      } else {
        setContactForm({
          ...contactForm,
          message: ''
        });
      }
      setTimeout(() => setContactSuccess(false), 5000);
    }

    setSubmittingContact(false);
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatLocation = (address: string, neighborhood: string | null) => {
    const parts = [address];

    if (neighborhood) {
      parts.push(neighborhood);
    }

    return parts.join(', ');
  };

  const images = property?.images?.sort((a, b) => a.order_index - b.order_index) || [];
  const hasImages = images.length > 0;
  const defaultImage = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
          <Link to="/propiedades" className="text-brand-500 hover:text-brand-600">
            Volver a propiedades
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-surface min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/propiedades"
            className="inline-flex items-center text-content-muted hover:text-brand-500 mb-8 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Volver a propiedades
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
                <div className="relative group">
                  <img
                    src={hasImages ? images[currentImageIndex].url : defaultImage}
                    alt={property.title}
                    className="w-full h-[450px] md:h-[550px] object-cover"
                  />
                  {hasImages && images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-700" />
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-3 rounded-full transition-all shadow-lg backdrop-blur-sm ${
                        isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white/95 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 rounded-full bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-white transition-all shadow-lg">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {hasImages && images.length > 1 && (
                  <div className="p-5 flex gap-3 overflow-x-auto bg-surface-secondary">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-brand-500 ring-2 ring-brand-200 scale-105'
                            : 'border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="w-24 h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-elegant p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center bg-brand-50 text-brand-600 text-sm font-semibold px-4 py-2 rounded-full">
                    {property.operation_type === 'sale' ? 'Venta' : 'Alquiler'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-content-muted">
                    <Eye className="h-4 w-4" />
                    <span>{property.views_count} visitas</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-content mb-4 leading-tight">
                  {property.title}
                </h1>

                <div className="flex items-start text-content-muted mb-6">
                  <MapPin className="h-5 w-5 mr-2 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{formatLocation(property.address, property.neighborhood)}</span>
                </div>

                <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-6 mb-6">
                  <p className="text-4xl font-bold text-content mb-2">
                    {formatPrice(property.price, property.currency)}
                  </p>
                  {property.covered_area && (
                    <p className="text-content-muted text-lg">
                      {formatPrice(property.price / property.covered_area, property.currency)}/m² cubierto
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
                  {property.covered_area && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <Maximize className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Superficie cubierta</p>
                        <p className="font-semibold">{property.covered_area} m²</p>
                      </div>
                    </div>
                  )}
                  {property.semi_covered_area && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <Maximize className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Sup. Semi/Descubierta</p>
                        <p className="font-semibold">{property.semi_covered_area} m²</p>
                      </div>
                    </div>
                  )}
                  {property.total_area && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <Home className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Superficie total</p>
                        <p className="font-semibold">{property.total_area} m²</p>
                      </div>
                    </div>
                  )}
                  {property.rooms > 0 && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <Home className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Ambientes</p>
                        <p className="font-semibold">{property.rooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bedrooms > 0 && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <BedDouble className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Dormitorios</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center text-content">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                        <Bath className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm text-content-muted">Baños</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-content">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                      <Car className="h-5 w-5 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-sm text-content-muted">Cochera</p>
                      <p className="font-semibold">{property.garages ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {property.videos && property.videos.length > 0 && (
                <div className="bg-white rounded-xl shadow-elegant p-8">
                  <h2 className="font-serif text-2xl font-semibold text-content mb-5">Videos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.videos.sort((a, b) => a.order_index - b.order_index).map((video) => (
                      <div key={video.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                          <iframe
                            src={video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title={video.title || 'Video de la propiedad'}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : video.url.includes('vimeo.com') ? (
                          <iframe
                            src={video.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                            title={video.title || 'Video de la propiedad'}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video.url}
                            controls
                            className="w-full h-full"
                          >
                            Tu navegador no soporta el elemento de video.
                          </video>
                        )}
                        {video.title && (
                          <p className="mt-2 text-sm text-content-muted">{video.title}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.plans && property.plans.length > 0 && (
                <div className="bg-white rounded-xl shadow-elegant p-8">
                  <h2 className="font-serif text-2xl font-semibold text-content mb-5">Planos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.plans.sort((a, b) => a.order_index - b.order_index).map((plan) => (
                      <div key={plan.id} className="relative">
                        {plan.url.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={plan.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 transition-colors text-center"
                          >
                            <FileText className="h-12 w-12 text-brand-500 mx-auto mb-3" />
                            <p className="font-semibold text-content">{plan.title || 'Ver plano (PDF)'}</p>
                            <p className="text-sm text-content-muted mt-1">Clic para abrir</p>
                          </a>
                        ) : (
                          <div>
                            <img
                              src={plan.url}
                              alt={plan.title || 'Plano'}
                              className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => window.open(plan.url, '_blank')}
                            />
                            {plan.title && (
                              <p className="mt-2 text-sm text-content-muted">{plan.title}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.latitude && property.longitude && (
                <div className="bg-white rounded-xl shadow-elegant p-8">
                  <GoogleMapsDisplay
                    latitude={property.latitude}
                    longitude={property.longitude}
                    address={property.address}
                  />
                </div>
              )}

              <div className="bg-white rounded-xl shadow-elegant p-8">
                <h2 className="font-serif text-2xl font-semibold text-content mb-5">Descripción</h2>
                <p className="text-content-muted text-lg leading-relaxed whitespace-pre-line">
                  {property.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-elegant p-8">
                <h2 className="font-serif text-2xl font-semibold text-content mb-6">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="flex items-center space-x-3 bg-surface-secondary p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
                    <span className="text-content font-medium">{propertyTypeLabels[property.property_type]}</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-surface-secondary p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
                    <span className="text-content font-medium">{conditionLabels[property.property_condition]}</span>
                  </div>
                  {property.rooms > 0 && (
                    <div className="flex items-center space-x-3 bg-surface-secondary p-4 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
                      <span className="text-content font-medium">{property.rooms} ambiente{property.rooms > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-serif text-xl font-semibold text-content mb-5">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenities.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent-500 flex-shrink-0" />
                          <span className="text-content-muted">{amenityLabels[amenity] || amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-elegant p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-content mb-4">Contactar</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-content mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-content mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="whatsapp" className="block text-sm font-medium text-content mb-1.5">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        id="whatsapp"
                        required
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-content mb-1.5">
                        Mensaje (opcional)
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        placeholder="¿Alguna pregunta específica?"
                      />
                    </div>

                    {contactSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                        Mensaje enviado correctamente
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingContact}
                      className="w-full bg-brand-500 text-white py-3.5 rounded-lg font-semibold hover:bg-brand-600 transition-all hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingContact ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5" />
                          <span>Enviar consulta</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowScheduleVisitModal(true)}
                      className="w-full border-2 border-accent-500 text-accent-600 py-3.5 rounded-lg font-semibold hover:bg-accent-50 transition-all flex items-center justify-center space-x-2"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Agendar Visita</span>
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-content-muted">Publicado</span>
                    <span className="text-content font-medium">{new Date(property.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduleVisitModal && (
        <ScheduleVisitModal
          property={property}
          onClose={() => setShowScheduleVisitModal(false)}
        />
      )}
    </Layout>
  );
}
