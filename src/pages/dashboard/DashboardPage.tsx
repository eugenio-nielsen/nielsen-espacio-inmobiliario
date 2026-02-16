import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Heart, FileText, Eye, MessageSquare, Plus,
  ChevronRight, Loader2, TrendingUp, Pencil, Users, Calendar
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Property, PropertyImage, ValueReport, Favorite, Lead } from '../../types/database';

type PropertyWithImages = Property & { images: PropertyImage[] };

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [myProperties, setMyProperties] = useState<PropertyWithImages[]>([]);
  const [favorites, setFavorites] = useState<(Favorite & { property: PropertyWithImages })[]>([]);
  const [reports, setReports] = useState<ValueReport[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'favorites' | 'reports' | 'leads'>('overview');

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

    const [propertiesRes, favoritesRes, reportsRes, leadsRes] = await Promise.all([
      supabase
        .from('properties')
        .select('*, images:property_images(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('favorites')
        .select('*, property:properties(*, images:property_images(*))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('value_reports')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    if (propertiesRes.data) {
      setMyProperties(propertiesRes.data as PropertyWithImages[]);
    }

    if (favoritesRes.data) {
      setFavorites(favoritesRes.data as (Favorite & { property: PropertyWithImages })[]);
    }

    if (reportsRes.data) {
      setReports(reportsRes.data as ValueReport[]);
    }

    if (leadsRes.data) {
      setLeads(leadsRes.data as Lead[]);
    }

    setLoading(false);
  }

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

  const totalViews = myProperties.reduce((acc, p) => acc + p.views_count, 0);
  const totalContacts = myProperties.reduce((acc, p) => acc + p.contacts_count, 0);

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
                Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </h1>
              <p className="text-gray-600">Bienvenido a tu panel de control</p>
            </div>
            <Link
              to="/publicar"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Publicar propiedad</span>
            </Link>
          </div>

          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            <TabButton
              icon={TrendingUp}
              label="Resumen"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              icon={Home}
              label="Mis propiedades"
              count={myProperties.length}
              active={activeTab === 'properties'}
              onClick={() => setActiveTab('properties')}
            />
            <TabButton
              icon={Heart}
              label="Favoritos"
              count={favorites.length}
              active={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
            />
            <TabButton
              icon={FileText}
              label="Informes"
              count={reports.length}
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
            <TabButton
              icon={MessageSquare}
              label="Consultas"
              count={leads.length}
              active={activeTab === 'leads'}
              onClick={() => setActiveTab('leads')}
            />
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Home}
                  label="Propiedades"
                  value={myProperties.length.toString()}
                  color="teal"
                />
                <StatCard
                  icon={Eye}
                  label="Visitas totales"
                  value={totalViews.toString()}
                  color="blue"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Contactos"
                  value={totalContacts.toString()}
                  color="amber"
                />
                <StatCard
                  icon={FileText}
                  label="Informes"
                  value={reports.length.toString()}
                  color="green"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  to="/crm"
                  className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">CRM - Gestión de Leads</h3>
                  <p className="text-white/80">
                    Administra tus contactos y consultas de forma centralizada
                  </p>
                </Link>

                <Link
                  to="/visitas"
                  className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Calendario de Visitas</h3>
                  <p className="text-white/80">
                    Gestiona las visitas agendadas para tus propiedades
                  </p>
                </Link>
              </div>

              {myProperties.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Mis propiedades recientes</h2>
                    <button
                      onClick={() => setActiveTab('properties')}
                      className="text-brand-500 text-sm font-medium hover:text-brand-600"
                    >
                      Ver todas
                    </button>
                  </div>
                  <div className="space-y-4">
                    {myProperties.slice(0, 3).map(property => (
                      <PropertyRow key={property.id} property={property} formatPrice={formatPrice} showEdit />
                    ))}
                  </div>
                </div>
              )}

              {myProperties.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aun no tienes propiedades publicadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Publica tu primera propiedad y comienza a recibir consultas.
                  </p>
                  <Link
                    to="/publicar"
                    className="inline-flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Publicar propiedad</span>
                  </Link>
                </div>
              )}

              {leads.length > 0 && (
                <Link
                  to="/crm"
                  className="block bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-md p-6 text-white hover:from-brand-600 hover:to-brand-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">CRM de Leads</h3>
                        <p className="text-white/80 text-sm">
                          Tienes {leads.filter(l => l.status === 'new').length} consultas nuevas por responder
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6" />
                  </div>
                </Link>
              )}
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mis propiedades</h2>
              {myProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes propiedades publicadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProperties.map(property => (
                    <PropertyRow key={property.id} property={property} formatPrice={formatPrice} showEdit />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mis favoritos</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes propiedades guardadas</p>
                  <Link to="/propiedades" className="text-brand-500 font-medium hover:text-brand-600 mt-2 inline-block">
                    Explorar propiedades
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map(fav => (
                    <PropertyRow key={fav.id} property={fav.property} formatPrice={formatPrice} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mis informes de valor</h2>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No has generado informes</p>
                  <Link to="/informe-valor" className="text-brand-500 font-medium hover:text-brand-600 mt-2 inline-block">
                    Generar informe
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <Link
                      key={report.id}
                      to={`/informe-valor/${report.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-brand-500">{report.address}</p>
                        <p className="text-sm text-gray-600">
                          {report.city}, {report.province} | {report.covered_area} m²
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-brand-500">{formatPrice(report.suggested_price, 'USD')}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.price_indicator === 'opportunity' ? 'bg-green-100 text-green-700' :
                            report.price_indicator === 'overpriced' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {report.price_indicator === 'opportunity' ? 'Oportunidad' :
                             report.price_indicator === 'overpriced' ? 'Sobreprecio' : 'Mercado'}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-brand-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Consultas recibidas</h2>
                <Link
                  to="/crm"
                  className="inline-flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors text-sm"
                >
                  <span>Abrir CRM completo</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes consultas</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Cuando alguien consulte por tus propiedades, apareceran aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                          {lead.phone && <p className="text-sm text-gray-600">{lead.phone}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {lead.status === 'new' ? 'Nuevo' :
                           lead.status === 'contacted' ? 'Contactado' :
                           lead.status === 'qualified' ? 'Calificado' : lead.status}
                        </span>
                      </div>
                      {lead.message && (
                        <p className="text-sm text-gray-700 mt-2 bg-white p-3 rounded line-clamp-2">
                          {lead.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(lead.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  ))}
                  {leads.length > 5 && (
                    <Link
                      to="/crm"
                      className="block text-center text-brand-500 font-medium hover:text-brand-600 py-2"
                    >
                      Ver todos los leads ({leads.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TabButton({ icon: Icon, label, count, active, onClick }: {
  icon: typeof Home;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-brand-500 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-white/20' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Home;
  label: string;
  value: string;
  color: 'teal' | 'blue' | 'amber' | 'green';
}) {
  const colorClasses = {
    teal: 'bg-brand-100 text-brand-500',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function PropertyRow({ property, formatPrice, showEdit = false }: {
  property: PropertyWithImages;
  formatPrice: (price: number, currency: string) => string;
  showEdit?: boolean;
}) {
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  const imageUrl = primaryImage?.url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200';

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    paused: 'bg-gray-100 text-gray-700',
    sold: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-500'
  };

  const statusLabels = {
    active: 'Activa',
    pending: 'Pendiente',
    paused: 'Pausada',
    sold: 'Vendida',
    draft: 'Borrador'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <img
        src={imageUrl}
        alt={property.title}
        className="w-20 h-16 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <Link to={`/propiedad/${property.id}`} className="font-medium text-gray-900 hover:text-brand-500 line-clamp-1">
          {property.title}
        </Link>
        <p className="text-sm text-gray-600 line-clamp-1">
          {property.neighborhood || property.city}, {property.province}
        </p>
        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
          <span className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {property.views_count}
          </span>
          <span className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            {property.contacts_count}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">{formatPrice(property.price, property.currency)}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[property.status]}`}>
          {statusLabels[property.status]}
        </span>
      </div>
      {showEdit ? (
        <Link
          to={`/editar-propiedad/${property.id}`}
          className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          title="Editar propiedad"
        >
          <Pencil className="h-5 w-5" />
        </Link>
      ) : (
        <ChevronRight className="h-5 w-5 text-gray-400" />
      )}
    </div>
  );
}
