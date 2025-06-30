import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import ReviewPage from './pages/review/ReviewPage';
import SettingsPage from './pages/settings/SettingsPage';
import publicStyles from './layouts/PublicLayout.module.css';
import './App.css';

// Layout para rutas públicas
const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className={publicStyles.container}>
      <Outlet />
    </div>
  );
};

// Layout para rutas privadas
const PrivateLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

// Layout para rutas de admin
const AdminLayout = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Rutas de Admin */}
          <Route element={<AdminLayout />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Rutas Privadas */}
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/alerts" element={<HomePage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/me" element={<HomePage />} />
            {/* Redirigir cualquier otra ruta a Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
