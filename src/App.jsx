import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/ui/AuthGuard.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import PesoPage from './pages/peso/PesoPage.jsx';
import ProfilePage from './pages/perfil/ProfilePage.jsx';
import DosisPage from './pages/dosis/DosisPage.jsx';
import AlimentacionPage from './pages/alimentacion/AlimentacionPage.jsx';
import EntrenoPage from './pages/entreno/EntrenoPage.jsx';
import DiarioPage from './pages/diario/DiarioPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/peso"          element={<PesoPage />} />
          <Route path="/dosis"         element={<DosisPage />} />
          <Route path="/alimentacion"  element={<AlimentacionPage />} />
          <Route path="/entreno"       element={<EntrenoPage />} />
          <Route path="/diario"        element={<DiarioPage />} />
          <Route path="/perfil"        element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
