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
                return response.data;
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
    },

    getCurrentUser: () => {
        return localStorage.getItem('token');
    },
};

export default authService; 