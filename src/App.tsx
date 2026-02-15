import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PropertiesPage from './pages/property/PropertiesPage';
import PropertyDetailPage from './pages/property/PropertyDetailPage';
import PublishPropertyPage from './pages/property/PublishPropertyPage';
import EditPropertyPage from './pages/property/EditPropertyPage';
import ValueReportPage from './pages/valuation/ValueReportPage';
import ToolsPage from './pages/tools/ToolsPage';
import GuidesPage from './pages/content/GuidesPage';
import ArticlePage from './pages/content/ArticlePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CRMPage from './pages/crm/CRMPage';
import VisitCalendarPage from './pages/visits/VisitCalendarPage';
import { SuperAdminDashboardPage } from './pages/admin/SuperAdminDashboardPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { AllPropertiesManagementPage } from './pages/admin/AllPropertiesManagementPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
          <Route path="/publicar" element={<PublishPropertyPage />} />
          <Route path="/editar-propiedad/:id" element={<EditPropertyPage />} />
          <Route path="/informe-valor" element={<ValueReportPage />} />
          <Route path="/herramientas" element={<ToolsPage />} />
          <Route path="/guias" element={<GuidesPage />} />
          <Route path="/guia/:slug" element={<ArticlePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/visitas" element={<VisitCalendarPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireSuperAdmin>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute requireSuperAdmin>
                <AllPropertiesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute requireSuperAdmin>
                <CRMPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
