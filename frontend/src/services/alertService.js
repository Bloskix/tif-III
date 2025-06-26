import axios from '../utils/axios';

class AlertService {
    /**
     * Obtiene las alertas con paginación y filtros
     * @param {Object} params - Parámetros de búsqueda y paginación
     * @returns {Promise} Respuesta de la API
     */
    async getAlerts(params = {}) {
        try {
            const response = await axios.get('/alerts', { params });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene las estadísticas del dashboard según el período
     * @param {string} period - Período de tiempo ('weekly' o 'monthly')
     * @returns {Promise} Datos transformados para los gráficos
     */
    async getDashboardStats(period) {
        try {
            const response = await axios.get(`/alerts/stats/${period}`);
            
            // Si hay un mensaje de error en la respuesta
            if (response.data.error) {
                throw new Error(response.data.message || 'No hay datos disponibles');
            }

            console.log('Datos crudos del backend (alerts_over_time):', response.data.alerts_over_time);

            // Transformar los datos para los gráficos
            const transformedData = {
                alertsOverTime: response.data.alerts_over_time.map(bucket => {
                    console.log('Procesando bucket:', bucket);
                    return {
                        date: bucket.key_as_string || bucket.key,
                        count: bucket.doc_count
                    };
                }),
                
                // Pasar los datos de rule_levels sin transformar
                ruleLevels: response.data.rule_levels,
                
                topRules: response.data.top_rules.map(bucket => ({
                    name: bucket.key,
                    count: bucket.doc_count
                }))
            };

            console.log('Datos transformados para el frontend:', transformedData.alertsOverTime);
            return transformedData;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Maneja los errores de las llamadas a la API
     * @private
     * @param {Error} error - Error capturado
     * @returns {Error} Error procesado
     */
    _handleError(error) {
        if (error.response) {
            // El servidor respondió con un código de error
            const message = error.response.data.detail || 'Error en la solicitud';
            return new Error(message);
        } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta
            return new Error('No se pudo conectar con el servidor');
        } else {
            // Error en la configuración de la solicitud
            return error;
        }
    }
}

export const alertService = new AlertService(); 