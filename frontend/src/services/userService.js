import axiosInstance from '../utils/axios';

const userService = {
    // Obtener lista de usuarios
    getUsers: async () => {
        try {
            const response = await axiosInstance.get('/users');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al obtener los usuarios'
            };
        }
    },

    // Actualizar rol de usuario
    updateUserRole: async (userId, role) => {
        try {
            const response = await axiosInstance.put(`/users/${userId}/role`, { role });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar el rol'
            };
        }
    },

    // Eliminar usuario
    deleteUser: async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al eliminar el usuario'
            };
        }
    },

    // Actualizar información de usuario
    updateUser: async (userId, userData) => {
        try {
            const response = await axiosInstance.put(`/users/${userId}`, userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar el usuario'
            };
        }
    },

    // Obtener usuario actual
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get('/users/me');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al obtener el usuario actual'
            };
        }
    },

    // Actualizar usuario actual
    updateCurrentUser: async (userData) => {
        try {
            const response = await axiosInstance.put('/users/me', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar el perfil'
            };
        }
    }
};

export default userService; 