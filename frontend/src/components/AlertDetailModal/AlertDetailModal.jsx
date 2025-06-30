import React, { useState } from 'react';
import styles from './AlertDetailModal.module.css';
import Button from '../Button/Button';
import { reviewService } from '../../services/reviewService';

const AlertDetailModal = ({ alert, onClose, onAlertStateChange, isReviewTab }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!alert) return null;

    // Normalizar la estructura de la alerta para manejar tanto alertas normales como gestionadas
    const normalizedAlert = {
        id: alert.id,
        timestamp: alert.timestamp,
        status: alert.state || alert.status,
        agent: {
            id: alert.agent_id || (alert.agent && alert.agent.id),
            name: alert.agent_name || (alert.agent && alert.agent.name),
            ip: alert.agent_ip || (alert.agent && alert.agent.ip)
        },
        rule: {
            id: alert.rule_id || (alert.rule && alert.rule.id),
            level: alert.rule_level || (alert.rule && alert.rule.level),
            description: alert.rule_description || (alert.rule && alert.rule.description),
            groups: (alert.rule && alert.rule.groups) || []
        },
        full_log: alert.alert_data || alert.full_log,
        location: alert.location
    };

    const handleMarkForReview = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await reviewService.markAlertForReview(normalizedAlert.id, {
                id: normalizedAlert.id,
                timestamp: normalizedAlert.timestamp,
                agent: normalizedAlert.agent,
                rule: normalizedAlert.rule,
                full_log: normalizedAlert.full_log,
                location: normalizedAlert.location
            });
            onAlertStateChange && onAlertStateChange(normalizedAlert.id, 'abierta');
            onClose();
        } catch (err) {
            setError('Error al marcar la alerta para revisión');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Detalles de la Alerta</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.detailGroup}>
                        <h3>Información General</h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Fecha:</span>
                            <span>{new Date(normalizedAlert.timestamp).toLocaleString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Nivel:</span>
                            <span>{normalizedAlert.rule.level}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{normalizedAlert.id}</span>
                        </div>
                        {isReviewTab && (
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Estado:</span>
                                <span className={`${styles.statusBadge} ${styles[normalizedAlert.status || 'ignored']}`}>
                                    {normalizedAlert.status === 'abierta' ? 'Abierta' : 'Ignorada'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Agente</h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{normalizedAlert.agent.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Nombre:</span>
                            <span>{normalizedAlert.agent.name}</span>
                        </div>
                        {normalizedAlert.agent.ip && (
                            <div className={styles.detailRow}>
                                <span className={styles.label}>IP:</span>
                                <span>{normalizedAlert.agent.ip}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Regla</h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{normalizedAlert.rule.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Descripción:</span>
                            <span>{normalizedAlert.rule.description}</span>
                        </div>
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Detalles</h3>
                        <pre className={styles.jsonContent}>
                            {JSON.stringify(normalizedAlert.full_log, null, 2)}
                        </pre>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {!normalizedAlert.status && (
                        <Button
                            onClick={handleMarkForReview}
                            disabled={isLoading}
                            className={styles.markForReviewButton}
                        >
                            Marcar para revisión
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertDetailModal; 