import React, { useState } from 'react';
import styles from './AlertDetailModal.module.css';
import Button from '../Button/Button';
import { reviewService } from '../../services/reviewService';

const AlertDetailModal = ({ alert, onClose, onAlertStatusChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!alert) return null;

    const handleMarkForReview = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await reviewService.markAlertForReview(alert.id);
            onAlertStatusChange && onAlertStatusChange(alert.id, 'open');
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
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Nivel:</span>
                            <span>{alert.rule.level}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{alert.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Estado:</span>
                            <span className={`${styles.statusBadge} ${styles[alert.status || 'ignored']}`}>
                                {alert.status === 'open' ? 'Abierta' : 'Ignorada'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Agente</h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{alert.agent.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Nombre:</span>
                            <span>{alert.agent.name}</span>
                        </div>
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Regla</h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID:</span>
                            <span>{alert.rule.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Descripción:</span>
                            <span>{alert.rule.description}</span>
                        </div>
                    </div>

                    <div className={styles.detailGroup}>
                        <h3>Detalles</h3>
                        <pre className={styles.jsonContent}>
                            {JSON.stringify(alert.full_log, null, 2)}
                        </pre>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {alert.status !== 'open' && (
                        <Button
                            classNamessName={styles.markForReviewButton}
                            onClick={handleMarkForReview}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Marcando...' : 'Marcar para revisión'}
                        </Button>
                    )}
                    <Button 
                        onClick={onClose}
                        variant="secondary"
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AlertDetailModal; 