import axiosInstance from '../utils/axios';

const authService = {
    login: async (credentials) => {
        try {
            const formData = new FormData();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);
            
            const response = await axiosInstance.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                // Obtener datos del usuario después del login
                const userData = await authService.getUserData();
                localStorage.setItem('userData', JSON.stringify(userData));
                return { ...response.data, userData };
            } else {
                throw new Error('No se recibió el token de acceso');
            }
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/register', userData);
            return response.data;
        } catch (error) {
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
            const response = await axiosInstance.get('/users/me');
            return response.data;
        } catch (error) {
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