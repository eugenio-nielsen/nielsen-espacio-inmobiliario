import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Mail, Phone, User, Home, MapPin,
  CheckCircle, XCircle, Loader2, ChevronDown, Search, Filter
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { VisitAppointment, VisitAppointmentStatus, Property, PropertyImage } from '../../types/database';

type VisitWithProperty = VisitAppointment & {
  property: (Property & { images: PropertyImage[] }) | null;
};

const statusConfig: Record<VisitAppointmentStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
  confirmed: { label: 'Confirmada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: XCircle }
};

const timeSlotLabels: Record<string, string> = {
  morning: 'Mañana (9:00 - 12:00)',
  midday: 'Mediodía (12:00 - 15:00)',
  afternoon: 'Tarde (15:00 - 18:00)'
};

export default function VisitCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [visits, setVisits] = useState<VisitWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithProperty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitAppointmentStatus | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);

    const { data: propsData } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user!.id);

    if (propsData) {
      setProperties(propsData);

      const propertyIds = propsData.map(p => p.id);

      if (propertyIds.length > 0) {
        const { data: visitsData } = await supabase
          .from('visit_appointments')
          .select('*, property:properties(*, images:property_images(*))')
          .in('property_id', propertyIds)
          .order('visit_date', { ascending: true });

        if (visitsData) {
          setVisits(visitsData as VisitWithProperty[]);
        }
      }
    }

    setLoading(false);
  }

  async function updateVisitStatus(visitId: string, newStatus: VisitAppointmentStatus) {
    setUpdatingStatus(visitId);

    const { error } = await supabase
      .from('visit_appointments')
      .update({ status: newStatus })
      .eq('id', visitId);

    if (!error) {
      setVisits(visits.map(visit =>
        visit.id === visitId ? { ...visit, status: newStatus } : visit
      ));
      if (selectedVisit?.id === visitId) {
        setSelectedVisit({ ...selectedVisit, status: newStatus });
      }
    }

    setUpdatingStatus(null);
  }

  const filteredVisits = visits.filter(visit => {
    const matchesSearch =
      visit.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || visit.property_id === propertyFilter;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(visit.visit_date);
    visitDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = visitDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = visitDate < today;
    }

    return matchesSearch && matchesStatus && matchesProperty && matchesDate;
  });

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    confirmed: visits.filter(v => v.status === 'confirmed').length,
    upcoming: visits.filter(v => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visitDate = new Date(v.visit_date);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate >= today;
    }).length
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Calendario de Visitas
            </h1>
            <p className="text-gray-600">
              Gestiona las visitas agendadas para tus propiedades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-brand-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Próximas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Confirmadas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'upcoming' | 'past')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="upcoming">Próximas</option>
                  <option value="past">Pasadas</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as VisitAppointmentStatus | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                </select>

                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Todas las propiedades</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredVisits.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No hay visitas agendadas</p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all'
                      ? 'Intenta ajustar los filtros'
                      : 'Las visitas aparecerán aquí cuando los interesados agenden'}
                  </p>
                </div>
              ) : (
                filteredVisits.map(visit => {
                  const StatusIcon = statusConfig[visit.status].icon;
                  const primaryImage = visit.property?.images?.find(img => img.is_primary)?.url ||
                    visit.property?.images?.[0]?.url;

                  return (
                    <div
                      key={visit.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex items-start gap-6">
                        {primaryImage && (
                          <img
                            src={primaryImage}
                            alt={visit.property?.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {visit.first_name} {visit.last_name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {visit.property?.title}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                {visit.property?.address}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[visit.status].bgColor} ${statusConfig[visit.status].color}`}>
                              {statusConfig[visit.status].label}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(visit.visit_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {visit.time_slots.map(slot => timeSlotLabels[slot]).join(', ')}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {visit.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {visit.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedVisit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVisit(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedVisit.first_name} {selectedVisit.last_name}
                  </h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedVisit.status].bgColor} ${statusConfig[selectedVisit.status].color}`}>
                    {statusConfig[selectedVisit.status].label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Interesado</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{selectedVisit.first_name} {selectedVisit.last_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <a href={`mailto:${selectedVisit.email}`} className="text-brand-500 hover:underline">
                      {selectedVisit.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-3 text-gray-400" />
                    <a href={`tel:${selectedVisit.phone}`} className="text-brand-500 hover:underline">
                      {selectedVisit.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles de la Visita</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{formatDate(selectedVisit.visit_date)}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <Clock className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      {selectedVisit.time_slots.map(slot => (
                        <div key={slot}>{timeSlotLabels[slot]}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedVisit.property && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Propiedad</h3>
                  <div className="flex gap-4">
                    {selectedVisit.property.images?.[0] && (
                      <img
                        src={selectedVisit.property.images[0].url}
                        alt={selectedVisit.property.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {selectedVisit.property.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedVisit.property.address}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Cambiar Estado</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateVisitStatus(selectedVisit.id, 'confirmed')}
                    disabled={updatingStatus === selectedVisit.id || selectedVisit.status === 'confirmed'}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {updatingStatus === selectedVisit.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Confirmar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => updateVisitStatus(selectedVisit.id, 'cancelled')}
                    disabled={updatingStatus === selectedVisit.id || selectedVisit.status === 'cancelled'}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {updatingStatus === selectedVisit.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 mr-2" />
                        Cancelar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
