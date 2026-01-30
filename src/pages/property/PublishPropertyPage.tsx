import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, MapPin, DollarSign, Ruler, Bed, Bath, Car,
  Image, ChevronRight, ChevronLeft, CheckCircle, Loader2,
  Video, FileText
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PropertyType, OperationType, PropertyCondition } from '../../types/database';

const steps = [
  { id: 1, title: 'Tipo', icon: Home },
  { id: 2, title: 'Ubicación', icon: MapPin },
  { id: 3, title: 'Detalles', icon: Ruler },
  { id: 4, title: 'Precio', icon: DollarSign },
  { id: 5, title: 'Multimedia', icon: Image }
];

const propertyTypes = [
  { value: 'apartment', label: 'Departamento', icon: '🏢' },
  { value: 'house', label: 'Casa/PH', icon: '🏠' }
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
  { value: 'balcony', label: 'Balcón' },
  { value: 'terrace', label: 'Terraza' },
  { value: 'garden', label: 'Jardín' },
  { value: 'elevator', label: 'Ascensor' },
  { value: 'ac', label: 'Aire acondicionado' },
  { value: 'heating', label: 'Calefacción' },
  { value: 'storage', label: 'Baulera' }
];

export default function PublishPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [multimediaTab, setMultimediaTab] = useState<'images' | 'videos' | 'plans'>('images');

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
    imageUrls: [''],
    videoUrls: [''],
    planUrls: [''],
    floor: '',
    layout: '',
    orientation: '',
    expenses: '',
    hasSuperintendent: false
  });

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

  const addImageUrl = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const addVideoUrl = () => {
    setFormData(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ''] }));
  };

  const updateVideoUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const removeVideoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }));
  };

  const addPlanUrl = () => {
    setFormData(prev => ({ ...prev, planUrls: [...prev.planUrls, ''] }));
  };

  const updatePlanUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      planUrls: prev.planUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const removePlanUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      planUrls: prev.planUrls.filter((_, i) => i !== index)
    }));
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
    if (!user) return;

    setLoading(true);

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
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
        status: 'active',
        floor: formData.floor ? parseInt(formData.floor) : null,
        layout: formData.layout || null,
        orientation: formData.orientation || null,
        expenses: formData.expenses ? parseFloat(formData.expenses) : null,
        has_superintendent: formData.hasSuperintendent
      })
      .select()
      .single();

    if (!error && property) {
      const validImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
      if (validImageUrls.length > 0) {
        await supabase.from('property_images').insert(
          validImageUrls.map((url, index) => ({
            property_id: property.id,
            url,
            is_primary: index === 0,
            order_index: index
          }))
        );
      }

      const validVideoUrls = formData.videoUrls.filter(url => url.trim() !== '');
      if (validVideoUrls.length > 0) {
        await supabase.from('property_videos').insert(
          validVideoUrls.map((url, index) => ({
            property_id: property.id,
            url,
            thumbnail_url: null,
            title: null,
            order_index: index
          }))
        );
      }

      const validPlanUrls = formData.planUrls.filter(url => url.trim() !== '');
      if (validPlanUrls.length > 0) {
        await supabase.from('property_plans').insert(
          validPlanUrls.map((url, index) => ({
            property_id: property.id,
            url,
            title: null,
            order_index: index
          }))
        );
      }

      navigate(`/propiedad/${property.id}`);
    }

    setLoading(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pt-28 pb-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Publicar propiedad
            </h1>
            <p className="text-gray-600">
              Completa los datos de tu propiedad para publicarla
            </p>
          </div>

          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
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
                </div>
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

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  ¿Qué tipo de operación y propiedad?
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

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  ¿Dónde está ubicada?
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
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
                      Título del anuncio *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Ej: Hermoso departamento con vista al río"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
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
                        Baños
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Piso
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={formData.floor}
                        onChange={(e) => updateFormData('floor', e.target.value)}
                        placeholder="Ej: 5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expensas $
                      </label>
                      <input
                        type="number"
                        value={formData.expenses}
                        onChange={(e) => updateFormData('expenses', e.target.value)}
                        placeholder="Ej: 15000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disposición
                      </label>
                      <input
                        type="text"
                        value={formData.layout}
                        onChange={(e) => updateFormData('layout', e.target.value)}
                        placeholder="Ej: Al frente, Contrafrente, Lateral"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientación
                      </label>
                      <input
                        type="text"
                        value={formData.orientation}
                        onChange={(e) => updateFormData('orientation', e.target.value)}
                        placeholder="Ej: Norte, Sur, Este, Oeste"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasSuperintendent}
                        onChange={(e) => updateFormData('hasSuperintendent', e.target.checked)}
                        className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        El edificio tiene encargado
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  ¿Cuál es el precio?
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
                  Multimedia
                </h2>

                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMultimediaTab('images')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                      multimediaTab === 'images'
                        ? 'text-brand-500 border-b-2 border-brand-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Image className="h-5 w-5" />
                    Imágenes
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultimediaTab('videos')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                      multimediaTab === 'videos'
                        ? 'text-brand-500 border-b-2 border-brand-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Video className="h-5 w-5" />
                    Videos
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultimediaTab('plans')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                      multimediaTab === 'plans'
                        ? 'text-brand-500 border-b-2 border-brand-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    Planos
                  </button>
                </div>

                {multimediaTab === 'images' && (
                  <div>
                    <p className="text-gray-600 mb-6">
                      Agrega URLs de imágenes de tu propiedad. La primera imagen será la principal del carrusel.
                    </p>

                    <div className="space-y-3">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                          {formData.imageUrls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageUrl(index)}
                              className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="mt-4 text-brand-500 font-semibold hover:text-brand-600"
                    >
                      + Agregar otra imagen
                    </button>
                  </div>
                )}

                {multimediaTab === 'videos' && (
                  <div>
                    <p className="text-gray-600 mb-6">
                      Agrega URLs de videos de tu propiedad (YouTube, Vimeo, o enlaces directos a archivos de video).
                    </p>

                    <div className="space-y-3">
                      {formData.videoUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateVideoUrl(index, e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                          {formData.videoUrls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVideoUrl(index)}
                              className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addVideoUrl}
                      className="mt-4 text-brand-500 font-semibold hover:text-brand-600"
                    >
                      + Agregar otro video
                    </button>
                  </div>
                )}

                {multimediaTab === 'plans' && (
                  <div>
                    <p className="text-gray-600 mb-6">
                      Agrega URLs de planos de tu propiedad (archivos PDF o imágenes de los planos).
                    </p>

                    <div className="space-y-3">
                      {formData.planUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updatePlanUrl(index, e.target.value)}
                            placeholder="https://ejemplo.com/plano.pdf"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                          {formData.planUrls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePlanUrl(index)}
                              className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addPlanUrl}
                      className="mt-4 text-brand-500 font-semibold hover:text-brand-600"
                    >
                      + Agregar otro plano
                    </button>
                  </div>
                )}
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
                  disabled={loading}
                  className="flex items-center space-x-2 bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <span>Publicar propiedad</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
