import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import AuthGuard from './components/ui/AuthGuard.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import PesoPage from './pages/peso/PesoPage.jsx';
import ProfilePage from './pages/perfil/ProfilePage.jsx';
import DosisPage from './pages/dosis/DosisPage.jsx';
import AlimentacionPage from './pages/alimentacion/AlimentacionPage.jsx';
import EntrenoPage from './pages/entreno/EntrenoPage.jsx';
import DiarioPage from './pages/diario/DiarioPage.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  const wrapRef  = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div ref={wrapRef} style={{ minHeight: '100dvh' }}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<DashboardPage />} />
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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
