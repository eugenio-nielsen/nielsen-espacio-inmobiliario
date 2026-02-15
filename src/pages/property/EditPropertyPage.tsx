import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home, MapPin, DollarSign, Ruler, Bed, Bath, Car,
  Image, ChevronRight, ChevronLeft, CheckCircle, Loader2, AlertCircle, Trash2
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import PropertyImageUpload from '../../components/property/PropertyImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PropertyType, OperationType, PropertyCondition, Property, PropertyImage } from '../../types/database';

const steps = [
  { id: 1, title: 'Tipo', icon: Home },
  { id: 2, title: 'Ubicacion', icon: MapPin },
  { id: 3, title: 'Detalles', icon: Ruler },
  { id: 4, title: 'Precio', icon: DollarSign },
  { id: 5, title: 'Fotos', icon: Image }
];

const propertyTypes = [
  { value: 'apartment', label: 'Departamento', icon: '🏢' },
  { value: 'house', label: 'Casa', icon: '🏠' },
  { value: 'ph', label: 'PH', icon: '🏘️' },
  { value: 'land', label: 'Terreno', icon: '🌳' }
];

const conditions = [
  { value: 'new', label: 'A estrenar' },
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
  { value: 'to_renovate', label: 'A refaccionar' }
];

const amenitiesList = [
  { value: 'pool', label: 'Pileta' },
  { value: 'gym', label: 'Gimnasio' },
  { value: 'security', label: 'Seguridad 24hs' },
  { value: 'laundry', label: 'Lavadero' },
  { value: 'balcony', label: 'Balcon' },
  { value: 'terrace', label: 'Terraza' },
  { value: 'garden', label: 'Jardin' },
  { value: 'elevator', label: 'Ascensor' },
  { value: 'ac', label: 'Aire acondicionado' },
  { value: 'heating', label: 'Calefaccion' },
  { value: 'storage', label: 'Baulera' }
];

const statusOptions = [
  { value: 'active', label: 'Activa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'sold', label: 'Vendida' },
  { value: 'draft', label: 'Borrador' }
];

type PropertyWithImages = Property & { images: PropertyImage[] };

export default function EditPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    operationType: 'sale' as OperationType,
    propertyType: '' as PropertyType | '',
    title: '',
    description: '',
    address: '',
    city: '',
    neighborhood: '',
    province: '',
    coveredArea: '',
    semiCoveredArea: '',
    totalArea: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    garages: false,
    condition: 'good' as PropertyCondition,
    amenities: [] as string[],
    price: '',
    currency: 'USD',
    status: 'active' as Property['status'],
    images: [] as PropertyImage[]
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchProperty();
    }
  }, [user, id]);

  async function fetchProperty() {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      setError('Error al cargar la propiedad');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Propiedad no encontrada');
      setLoading(false);
      return;
    }

    const property = data as PropertyWithImages;

    if (property.user_id !== user?.id) {
      setError('No tienes permiso para editar esta propiedad');
      setLoading(false);
      return;
    }

    const sortedImages = property.images
      ?.sort((a, b) => a.order_index - b.order_index) || [];

    setFormData({
      operationType: property.operation_type,
      propertyType: property.property_type,
      title: property.title,
      description: property.description || '',
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood || '',
      province: property.province,
      coveredArea: property.covered_area?.toString() || '',
      semiCoveredArea: property.semi_covered_area?.toString() || '',
      totalArea: property.total_area?.toString() || '',
      rooms: property.rooms?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      garages: property.garages,
      condition: property.property_condition || 'good',
      amenities: property.amenities || [],
      price: property.price.toString(),
      currency: property.currency,
      status: property.status,
      images: sortedImages
    });

    setLoading(false);
  }

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const updateImages = (images: PropertyImage[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.propertyType !== '';
      case 2: return formData.address && formData.city && formData.province;
      case 3: return formData.title && formData.coveredArea;
      case 4: return formData.price !== '';
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !id) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType as PropertyType,
        operation_type: formData.operationType,
        price: parseFloat(formData.price),
        currency: formData.currency,
        address: formData.address,
        city: formData.city,
        neighborhood: formData.neighborhood,
        province: formData.province,
        covered_area: formData.coveredArea ? parseFloat(formData.coveredArea) : null,
        semi_covered_area: formData.semiCoveredArea ? parseFloat(formData.semiCoveredArea) : null,
        total_area: formData.totalArea ? parseFloat(formData.totalArea) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        garages: formData.garages,
        property_condition: formData.condition,
        amenities: formData.amenities,
        status: formData.status
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      setError('Error al guardar los cambios');
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate(`/propiedad/${id}`);
  };

  const handleDelete = async () => {
    if (!user || !id) return;

    setDeleting(true);

    await supabase
      .from('property_images')
      .delete()
      .eq('property_id', id);

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      setError('Error al eliminar la propiedad');
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    navigate('/dashboard');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !formData.title) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-brand-500 font-medium hover:text-brand-600"
          >
            Volver al dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pt-28 pb-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Editar propiedad
              </h1>
              <p className="text-gray-600">
                Modifica los datos de tu propiedad
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Eliminar</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    currentStep >= step.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-20 h-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-brand-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Tipo de operacion y propiedad
                </h2>

                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => updateFormData('operationType', 'sale')}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
                      formData.operationType === 'sale'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Venta
                  </button>
                  <button
                    onClick={() => updateFormData('operationType', 'rent')}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
                      formData.operationType === 'rent'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Alquiler
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {propertyTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => updateFormData('propertyType', type.value)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.propertyType === type.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{type.icon}</span>
                      <span className="font-semibold text-gray-900">{type.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de la publicacion
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormData('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Ubicacion de la propiedad
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direccion *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Ej: Av. Libertador 1234"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        placeholder="Ej: Buenos Aires"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barrio
                      </label>
                      <input
                        type="text"
                        value={formData.neighborhood}
                        onChange={(e) => updateFormData('neighborhood', e.target.value)}
                        placeholder="Ej: Palermo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => updateFormData('province', e.target.value)}
                      placeholder="Ej: CABA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Detalles de la propiedad
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titulo del anuncio *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Ej: Hermoso departamento con vista al rio"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripcion
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={4}
                      placeholder="Describe tu propiedad..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Ruler className="inline h-4 w-4 mr-1" />
                        Superficie cubierta (m²) *
                      </label>
                      <input
                        type="number"
                        value={formData.coveredArea}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFormData('coveredArea', value);
                          const covered = parseFloat(value) || 0;
                          const semiCovered = parseFloat(formData.semiCoveredArea) || 0;
                          const total = covered + semiCovered;
                          updateFormData('totalArea', total > 0 ? total.toString() : '');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Ruler className="inline h-4 w-4 mr-1" />
                        Sup. Semi/Descubierta (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.semiCoveredArea}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFormData('semiCoveredArea', value);
                          const covered = parseFloat(formData.coveredArea) || 0;
                          const semiCovered = parseFloat(value) || 0;
                          const total = covered + semiCovered;
                          updateFormData('totalArea', total > 0 ? total.toString() : '');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Ruler className="inline h-4 w-4 mr-1" />
                        Superficie total (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.totalArea}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Home className="inline h-4 w-4 mr-1" />
                        Ambientes
                      </label>
                      <input
                        type="number"
                        value={formData.rooms}
                        onChange={(e) => updateFormData('rooms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bed className="inline h-4 w-4 mr-1" />
                        Dormitorios
                      </label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => updateFormData('bedrooms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bath className="inline h-4 w-4 mr-1" />
                        Banos
                      </label>
                      <input
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => updateFormData('bathrooms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Car className="inline h-4 w-4 mr-1" />
                      Cochera
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => updateFormData('garages', true)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          formData.garages === true
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('garages', false)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          formData.garages === false
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de la propiedad
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => updateFormData('condition', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    >
                      {conditions.map(cond => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenitiesList.map(amenity => (
                        <button
                          key={amenity.value}
                          type="button"
                          onClick={() => toggleAmenity(amenity.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.amenities.includes(amenity.value)
                              ? 'bg-brand-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {amenity.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Precio de la propiedad
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => updateFormData('currency', 'USD')}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          formData.currency === 'USD'
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        USD
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('currency', 'ARS')}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          formData.currency === 'ARS'
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ARS
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateFormData('price', e.target.value)}
                        placeholder="150000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-2xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Fotos de la propiedad
                </h2>

                <PropertyImageUpload
                  propertyId={id}
                  images={formData.images}
                  onImagesChange={updateImages}
                  maxImages={10}
                />
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar cambios</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Eliminar propiedad
            </h3>
            <p className="text-gray-600 mb-6">
              Esta accion no se puede deshacer. La propiedad sera eliminada permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
