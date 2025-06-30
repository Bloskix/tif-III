import axiosInstance from '../utils/axios';

const notificationService = {
    // Obtener la configuración actual de notificaciones
    getConfig: async () => {
        try {
            const response = await axiosInstance.get('/notifications/notification/config');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al obtener la configuración:', error);
            // Si el error es 404 (no existe configuración), retornamos success true con data null
            if (error.response?.status === 404) {
                return {
                    success: true,
                    data: null
                };
            }
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al obtener la configuración'
            };
        }
    },

    // Crear nueva configuración
    createConfig: async (configData) => {
        try {
            const response = await axiosInstance.post('/notifications/notification/config', configData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al crear la configuración:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al crear la configuración'
            };
        }
    },

    // Actualizar configuración existente
    updateConfig: async (configData) => {
        try {
            const response = await axiosInstance.put('/notifications/notification/config', configData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al actualizar la configuración:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar la configuración'
            };
        }
    },

    // Obtener lista de emails destinatarios
    getEmails: async () => {
        try {
            const response = await axiosInstance.get('/notifications/notification/emails');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al obtener los emails:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al obtener los emails'
            };
        }
    },

    // Agregar nuevo email destinatario
    addEmail: async (emailData) => {
        try {
            const response = await axiosInstance.post('/notifications/notification/emails', emailData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al agregar el email:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al agregar el email'
            };
        }
    },

    // Eliminar email destinatario
    deleteEmail: async (emailId) => {
        try {
            const response = await axiosInstance.delete(`/notifications/notification/emails/${emailId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al eliminar el email:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al eliminar el email'
            };
        }
    },

    // Actualizar email destinatario
    updateEmail: async (emailId, emailData) => {
        try {
            const response = await axiosInstance.put(`/notifications/notification/emails/${emailId}`, emailData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al actualizar el email:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al actualizar el email'
            };
        }
    }
};

export default notificationService; 