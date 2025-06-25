import axiosInstance from '../utils/axios';

const authService = {
    login: async (credentials) => {
        try {
            const formData = new FormData();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);
            
            console.log('Enviando petición de login:', {
                username: credentials.email,
                url: '/auth/login'
            });
            
            const response = await axiosInstance.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Respuesta del servidor:', response.data);
            
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                // Obtener datos del usuario después del login
                const userData = await authService.getUserData();
                console.log('Datos del usuario obtenidos:', userData);
                localStorage.setItem('userData', JSON.stringify(userData));
                return { ...response.data, userData };
            } else {
                throw new Error('No se recibió el token de acceso');
            }
        } catch (error) {
            console.error('Error en login:', error.response?.data || error.message);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Error en registro:', error.response?.data || error.message);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
            return {
                token,
                ...JSON.parse(userData)
            };
        }
        return null;
    },

    getUserData: async () => {
        try {
            console.log('Obteniendo datos del usuario...');
            console.log('Token actual:', localStorage.getItem('token'));
            
            const response = await axiosInstance.get('/users/me');
            console.log('Respuesta de datos del usuario:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos del usuario:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            throw error;
        }
    },

    isAdmin: () => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { role } = JSON.parse(userData);
            return role === 'admin';
        }
        return false;
    }
};

export default authService; 