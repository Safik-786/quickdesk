import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './modules/core/components/ProtectedRoute';
import DashboardLayout from './modules/core/components/DashboardLayout';

import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import MyTicketsPage from './modules/tickets/pages/MyTicketsPage';
import DashboardPage from './modules/tickets/pages/DashboardPage';
import TicketDetailPage from './modules/tickets/pages/TicketDetailPage';
import MetricsPage from './modules/metrics/pages/MetricsPage';
import RBACManagementPage from './modules/rbac/pages/RBACManagementPage';
import KnowledgeBaseUploadPage from './modules/admin/pages/KnowledgeBaseUploadPage';
import { ROLES } from './constants/rbac';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<div className="p-8 text-red-600">Access denied.</div>} />

            {/* Authenticated Layout */}
            <Route element={<DashboardLayout />}>
              {/* Employee routes */}

              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute role={ROLES.EMPLOYEE}>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />

              {/* Agent routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role={ROLES.AGENT}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute role={[ROLES.AGENT, ROLES.EMPLOYEE]}>
                    <TicketDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/metrics"
                element={
                  <ProtectedRoute role={ROLES.AGENT}>
                    <MetricsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rbac"
                element={
                  <ProtectedRoute role={ROLES.ADMIN}>
                    <RBACManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/knowledge-base"
                element={
                  <ProtectedRoute role={ROLES.ADMIN}>
                    <KnowledgeBaseUploadPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </SocketProvider>
    </AuthProvider>
  );
}
