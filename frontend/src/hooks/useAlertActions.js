import { useState } from 'react';
import { reviewService } from '../services/reviewService';
import { normalizeAlert } from '../utils/alertUtils';

export const useAlertActions = (onAlertStateChange, onClose) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const markForReview = async (alert) => {
        try {
            setIsLoading(true);
            setError(null);
            const normalizedAlert = normalizeAlert(alert);
            
            await reviewService.markAlertForReview(normalizedAlert.id, {
                id: normalizedAlert.id,
                timestamp: normalizedAlert.timestamp,
                agent: normalizedAlert.agent,
                rule: normalizedAlert.rule,
                full_log: normalizedAlert.full_log,
                location: normalizedAlert.location
            });
            
            onAlertStateChange?.(normalizedAlert.id, 'abierta');
            onClose?.();
        } catch (err) {
            setError('No se pudo marcar la alerta para revisión. Por favor, inténtelo de nuevo.');
            console.error('Error al marcar para revisión:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const closeAlert = async (alertId) => {
        try {
            setIsLoading(true);
            setError(null);
            await reviewService.updateAlertState(alertId, 'cerrada');
            onAlertStateChange?.(alertId, 'cerrada');
            onClose?.();
        } catch (err) {
            setError('No se pudo cerrar la alerta. Por favor, inténtelo de nuevo.');
            console.error('Error al cerrar la alerta:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        markForReview,
        closeAlert,
    };
}; 