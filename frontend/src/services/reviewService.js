import axios from '../utils/axios';

class ReviewService {
    /**
     * Obtiene la lista de alertas en revisión con paginación y filtros
     * @param {Object} params - Parámetros de búsqueda y paginación
     * @returns {Promise} Lista de alertas y total
     */
    async getManagedAlerts(params) {
        try {
            const response = await axios.get('/review', { params });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al obtener las alertas en revisión');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    /**
     * Obtiene los detalles de una alerta en revisión
     * @param {number} alertId - ID de la alerta
     * @returns {Promise} Detalles de la alerta
     */
    async getManagedAlertDetails(alertId) {
        try {
            const response = await axios.get(`/review/${alertId}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al obtener los detalles de la alerta');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    /**
     * Marca una alerta como abierta para revisión
     * @param {string} alertId - ID de la alerta
     * @param {Object} alertData - Datos completos de la alerta
     * @returns {Promise} Resultado de la operación
     */
    async markAlertForReview(alertId, alertData) {
        try {
            const response = await axios.post('/review', {
                alert_id: alertId,
                alert_data: alertData
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al marcar la alerta para revisión');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    /**
     * Actualiza el estado de una alerta en revisión
     * @param {number} alertId - ID de la alerta
     * @param {string} state - Nuevo estado ('abierta' o 'cerrada')
     * @returns {Promise} Alerta actualizada
     */
    async updateManagedAlertState(alertId, state) {
        try {
            const response = await axios.put(`/review/${alertId}`, {
                state: state
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al actualizar el estado de la alerta');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    // Métodos para manejar notas de alertas
    async getAlertNotes(alertId) {
        try {
            const response = await axios.get(`/review/${alertId}/notes`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al obtener las notas de la alerta');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    async addAlertNote(alertId, noteData) {
        try {
            const response = await axios.post(`/review/${alertId}/notes`, noteData);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al agregar la nota');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }

    async updateAlertNote(alertId, noteId, noteData) {
        try {
            const response = await axios.put(`/review/${alertId}/notes/${noteId}`, noteData);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Error al actualizar la nota');
            }
            throw new Error('No se pudo conectar con el servidor');
        }
    }
}

export const reviewService = new ReviewService(); 