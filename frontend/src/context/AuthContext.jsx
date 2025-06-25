import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            console.log('Intentando login con credenciales:', {
                email: credentials.email
            });
            
            const data = await authService.login(credentials);
            console.log('Login exitoso:', data);
            
            if (data.access_token) {
                setUser({
                    token: data.access_token,
                    ...data.userData
                });
                return { success: true };
            } else {
                console.error('No se recibió token en la respuesta');
                return {
                    success: false,
                    error: 'Error en la respuesta del servidor'
                };
            }
        } catch (error) {
            console.error('Error en login (context):', error);
            return {
                success: false,
                error: error.response?.data?.detail || error.message || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            return { success: true, data };
        } catch (error) {
            console.error('Error en registro (context):', error);
            return {
                success: false,
                error: error.response?.data?.detail || error.message || 'Error al registrar usuario'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}; 