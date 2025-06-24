import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Button from './components/Button/Button';
import dashboardStyles from './pages/dashboard/Dashboard.module.css';
import publicStyles from './layouts/PublicLayout.module.css';
import './App.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={dashboardStyles.container}>
      <div className={dashboardStyles.content}>
        <div className={dashboardStyles.header}>
          <h1 className={dashboardStyles.title}>
            Dashboard (Próximamente)
          </h1>
          <Button
            variant="secondary"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

// Layout para rutas públicas
const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
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
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Aquí irán futuras rutas privadas */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>

          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
