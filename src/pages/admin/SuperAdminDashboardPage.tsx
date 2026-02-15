import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, MessageSquare, TrendingUp, Bell, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/layout/Layout';

interface PlatformStats {
  totalUsers: number;
  totalProperties: number;
  activeProperties: number;
  totalLeads: number;
  newLeadsToday: number;
  totalReports: number;
}

interface RecentActivity {
  type: 'user' | 'property' | 'lead';
  title: string;
  description: string;
  timestamp: string;
}

export function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    totalReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
    fetchRecentActivity();
  }, []);

  async function fetchPlatformStats() {
    try {
      const [usersResult, propertiesResult, leadsResult, reportsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id, status', { count: 'exact' }),
        supabase.from('leads').select('id, created_at', { count: 'exact' }),
        supabase.from('value_reports').select('id', { count: 'exact', head: true }),
      ]);

      const activeProperties = propertiesResult.data?.filter(p => p.status === 'active').length || 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newLeadsToday = leadsResult.data?.filter(
        l => new Date(l.created_at) >= today
      ).length || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalProperties: propertiesResult.count || 0,
        activeProperties,
        totalLeads: leadsResult.count || 0,
        newLeadsToday,
        totalReports: reportsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentActivity() {
    try {
      const [newUsers, newProperties, newLeads] = await Promise.all([
        supabase
          .from('profiles')
          .select('email, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('properties')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('leads')
          .select('name, email, lead_type, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const activities: RecentActivity[] = [];

      newUsers.data?.forEach(user => {
        activities.push({
          type: 'user',
          title: 'New User Registration',
          description: `${user.full_name || user.email} joined the platform`,
          timestamp: user.created_at,
        });
      });

      newProperties.data?.forEach(property => {
        activities.push({
          type: 'property',
          title: 'New Property Listed',
          description: property.title,
          timestamp: property.created_at,
        });
      });

      newLeads.data?.forEach(lead => {
        activities.push({
          type: 'lead',
          title: 'New Lead',
          description: `${lead.name} - ${lead.lead_type}`,
          timestamp: lead.created_at,
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform-wide statistics and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link
              to="/admin/users"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              Manage Users →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.activeProperties} active</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Home className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link
              to="/admin/properties"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              Manage Properties →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.newLeadsToday} today</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link
              to="/admin/leads"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              View All Leads →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Value Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-sm text-gray-500 mt-2">View system notifications</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <Link
              to="/admin/notifications"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              View Notifications →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Log</p>
                <p className="text-sm text-gray-500 mt-2">Track admin actions</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <Link
              to="/admin/audit-log"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-block"
            >
              View Audit Log →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'property' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'property' && <Home className="h-4 w-4 text-green-600" />}
                      {activity.type === 'lead' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
