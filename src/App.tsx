import React from 'react';
import { Router, Routes, Route } from './router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { EncryptTextPage } from './pages/dashboard/EncryptTextPage';
import { EncryptFilesPage } from './pages/dashboard/EncryptFilesPage';
import { EncryptImagesPage } from './pages/dashboard/EncryptImagesPage';
import { VaultPage } from './pages/dashboard/VaultPage';
import { ActivityPage } from './pages/dashboard/ActivityPage';
import { KeysPage } from './pages/dashboard/KeysPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Console Routes (Guarded by ProtectedRoute) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/text"
            element={
              <ProtectedRoute>
                <EncryptTextPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/files"
            element={
              <ProtectedRoute>
                <EncryptFilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/images"
            element={
              <ProtectedRoute>
                <EncryptImagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vault"
            element={
              <ProtectedRoute>
                <VaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/keys"
            element={
              <ProtectedRoute>
                <KeysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
