import axios from '../utils/axios';

class AlertService {
    /**
     * Obtiene las alertas con paginación y filtros
     * @param {Object} params - Parámetros de búsqueda y paginación
     * @returns {Promise} Respuesta de la API
     */
    async getAlerts(params = {}) {
        try {
            console.log('AlertService - Enviando petición con params:', params);
            console.log('URL completa:', '/alerts/' + '?' + new URLSearchParams(params).toString());
            
            const response = await axios.get('/alerts/', { params });

            console.log('perticion al endpoint /alerts/--------------------------------')
            console.log('AlertService - Respuesta recibida:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('AlertService - Error en getAlerts:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
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

            // Transformar los datos para los gráficos
            const transformedData = {
                alertsOverTime: response.data.alerts_over_time.map(bucket => {
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

            return transformedData;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene los detalles de una alerta específica
     * @param {string} alertId - ID de la alerta
     * @returns {Promise} Detalles de la alerta
     */
    async getAlertDetails(alertId) {
        try {
            const response = await axios.get('/alerts/', {
                params: {
                    alert_id: alertId,
                    page: 1,
                    size: 1
                }
            });
            // Como es una búsqueda por ID, debería devolver solo una alerta
            if (response.data.alerts && response.data.alerts.length > 0) {
                return response.data.alerts[0];
            }
            throw new Error('No se encontró la alerta');
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