import axios from '../utils/axios';

class AlertService {
    /**
     * @param {Object} params 
     * @returns {Promise} 
     */
    async getAlerts(params = {}) {
        try {
            const response = await axios.get('/alerts/', { params });

            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * @param {string} period 
     * @returns {Promise} 
     */
    async getDashboardStats(period) {
        try {
            const response = await axios.get(`/alerts/stats/${period}`);
            
            if (response.data.error) {
                throw new Error(response.data.message || 'No hay datos disponibles');
            }

            const transformedData = {
                alertsOverTime: response.data.alerts_over_time.map(bucket => {
                    return {
                        date: bucket.key_as_string || bucket.key,
                        count: bucket.doc_count
                    };
                }),
                
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
     * @param {string} alertId 
     * @returns {Promise} 
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
            if (response.data.alerts && response.data.alerts.length > 0) {
                return response.data.alerts[0];
            }
            throw new Error('No se encontró la alerta');
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * @private
     * @param {Error} error 
     * @returns {Error} 
     */
    _handleError(error) {
        if (error.response) {
            const message = error.response.data.detail || 'Error en la solicitud';
            return new Error(message);
        } else if (error.request) {
            return new Error('No se pudo conectar con el servidor');
        } else {
            return error;
        }
    }
}

export const alertService = new AlertService(); 