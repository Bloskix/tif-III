import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
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

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Rutas Privadas */}
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/alerts" element={<HomePage />} />
            <Route path="/review" element={<HomePage />} />
            <Route path="/settings" element={<HomePage />} />
            <Route path="/me" element={<HomePage />} />
            {/* Redirigir cualquier otra ruta a Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
