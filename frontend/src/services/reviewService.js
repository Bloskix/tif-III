import axios from '../utils/axios';

class ReviewService {
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
}

export const reviewService = new ReviewService(); 