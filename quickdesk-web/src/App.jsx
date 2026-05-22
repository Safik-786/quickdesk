import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './modules/core/components/ProtectedRoute';

import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import SubmitTicketPage from './modules/tickets/pages/SubmitTicketPage';
import MyTicketsPage from './modules/tickets/pages/MyTicketsPage';
import DashboardPage from './modules/tickets/pages/DashboardPage';
import TicketDetailPage from './modules/tickets/pages/TicketDetailPage';
import MetricsPage from './modules/metrics/pages/MetricsPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Employee routes */}
            <Route
              path="/submit"
              element={
                <ProtectedRoute role="employee">
                  <SubmitTicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute role="employee">
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Agent routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="agent">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute role="agent">
                  <TicketDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/metrics"
              element={
                <ProtectedRoute role="agent">
                  <MetricsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/unauthorized" element={<div className="p-8 text-red-600">Access denied.</div>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
