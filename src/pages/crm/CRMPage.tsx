import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Mail, Phone, MessageSquare, Calendar,
  ChevronDown, Search, Filter, X, Home,
  CheckCircle, Clock, UserCheck, XCircle, Loader2, CalendarCheck
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Lead, LeadStatus, Property, PropertyImage, VisitAppointment } from '../../types/database';

type LeadWithProperty = Lead & {
  property: (Property & { images: PropertyImage[] }) | null;
};

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  new: { label: 'Nuevo', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock },
  contacted: { label: 'Contactado', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Phone },
  qualified: { label: 'Calificado', color: 'text-teal-600', bgColor: 'bg-teal-100', icon: UserCheck },
  converted: { label: 'Convertido', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  lost: { label: 'Perdido', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: XCircle }
};

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'lost', label: 'Perdido' }
];

export default function CRMPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<LeadWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<VisitAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadWithProperty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
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
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*, property:properties(*, images:property_images(*))')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        if (leadsData) {
          setLeads(leadsData as LeadWithProperty[]);
        }

        const { data: visitsData } = await supabase
          .from('visit_appointments')
          .select('*')
          .in('property_id', propertyIds)
          .order('visit_date', { ascending: false });

        if (visitsData) {
          setVisits(visitsData);
        }
      }
    }

    setLoading(false);
  }

  async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    setUpdatingStatus(leadId);

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    }

    setUpdatingStatus(null);
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || lead.property_id === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                CRM de Leads
              </h1>
              <p className="text-gray-600">Gestiona los contactos de tus propiedades</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Total"
              value={stats.total}
              color="text-gray-900"
              bgColor="bg-white"
            />
            <StatCard
              label="Nuevos"
              value={stats.new}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              label="Contactados"
              value={stats.contacted}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <StatCard
              label="Calificados"
              value={stats.qualified}
              color="text-teal-600"
              bgColor="bg-teal-50"
            />
            <StatCard
              label="Convertidos"
              value={stats.converted}
              color="text-green-600"
              bgColor="bg-green-50"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o telefono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="all">Todas las propiedades</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {leads.length === 0 ? 'Sin leads aun' : 'No hay resultados'}
                </h3>
                <p className="text-gray-600">
                  {leads.length === 0
                    ? 'Cuando alguien consulte por tus propiedades, apareceran aqui.'
                    : 'Intenta con otros filtros de busqueda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">Contacto</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">Propiedad</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">Fecha</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">Estado</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map(lead => {
                      const status = statusConfig[lead.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                                <span className="text-brand-600 font-semibold">
                                  {lead.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{lead.name}</p>
                                <p className="text-sm text-gray-500">{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {lead.property ? (
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                  {lead.property.title}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(lead.created_at)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              <span>{status.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          visits={visits.filter(v =>
            v.property_id === selectedLead.property_id &&
            v.email === selectedLead.email
          )}
          onClose={() => setSelectedLead(null)}
          onStatusChange={updateLeadStatus}
          updatingStatus={updatingStatus}
        />
      )}
    </Layout>
  );
}

function StatCard({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-200`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface LeadDetailModalProps {
  lead: LeadWithProperty;
  visits: VisitAppointment[];
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  updatingStatus: string | null;
}

function LeadDetailModal({ lead, visits, onClose, onStatusChange, updatingStatus }: LeadDetailModalProps) {
  const status = statusConfig[lead.status];
  const StatusIcon = status.icon;
  const primaryImage = lead.property?.images?.find(img => img.is_primary)?.url ||
    lead.property?.images?.[0]?.url;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Detalle del Lead</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-600">
                {lead.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{lead.name}</h4>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                <StatusIcon className="h-3 w-3" />
                <span>{status.label}</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="h-5 w-5 text-gray-400" />
              <a href={`mailto:${lead.email}`} className="hover:text-brand-500">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center space-x-3 text-gray-700">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href={`tel:${lead.phone}`} className="hover:text-brand-500">
                  {lead.phone}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm">{formatDate(lead.created_at)}</span>
            </div>
          </div>

          {lead.message && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Mensaje</span>
              </h5>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-4 text-sm">
                {lead.message}
              </p>
            </div>
          )}

          {lead.property && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Propiedad de interes</span>
              </h5>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                {primaryImage && (
                  <img
                    src={primaryImage}
                    alt={lead.property.title}
                    className="w-20 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{lead.property.title}</p>
                  <p className="text-sm text-gray-500">
                    {lead.property.city}, {lead.property.province}
                  </p>
                </div>
              </div>
            </div>
          )}

          {visits.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <CalendarCheck className="h-4 w-4" />
                <span>Visitas Agendadas</span>
              </h5>
              <div className="space-y-2">
                {visits.map(visit => (
                  <div key={visit.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">
                        {new Date(visit.visit_date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        visit.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : visit.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {visit.status === 'confirmed' ? 'Confirmada' : visit.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-green-700">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {visit.time_slots.map(slot => {
                        const labels: Record<string, string> = {
                          morning: 'Mañana',
                          midday: 'Mediodía',
                          afternoon: 'Tarde'
                        };
                        return labels[slot];
                      }).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Cambiar estado</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map(opt => {
                const optConfig = statusConfig[opt.value];
                const OptIcon = optConfig.icon;
                const isActive = lead.status === opt.value;
                const isUpdating = updatingStatus === lead.id;

                return (
                  <button
                    key={opt.value}
                    onClick={() => onStatusChange(lead.id, opt.value)}
                    disabled={isActive || isUpdating}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? `${optConfig.bgColor} ${optConfig.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <OptIcon className="h-4 w-4" />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex space-x-3">
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="h-5 w-5" />
              <span>Enviar email</span>
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Llamar</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
