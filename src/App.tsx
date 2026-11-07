import React from 'react';
import { Router, Routes, Route } from './router';
import { AuthProvider } from './context/AuthContext';
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

          {/* Authenticated Application Console Routes */}
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/text" element={<EncryptTextPage />} />
          <Route path="/dashboard/files" element={<EncryptFilesPage />} />
          <Route path="/dashboard/images" element={<EncryptImagesPage />} />
          <Route path="/dashboard/vault" element={<VaultPage />} />
          <Route path="/dashboard/activity" element={<ActivityPage />} />
          <Route path="/dashboard/keys" element={<KeysPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
