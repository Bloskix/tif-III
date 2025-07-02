import React from 'react';
import styles from './AlertDetailModal.module.css';
import Button from '../Button/Button';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { useAlertActions } from '../../hooks/useAlertActions';
import { normalizeAlert, ALERT_STATES } from '../../utils/alertUtils';

const AlertDetailModal = ({ alert, onClose, onAlertStateChange, isReviewTab }) => {
    const { isLoading, error, markForReview, closeAlert } = useAlertActions(onAlertStateChange, onClose);

    if (!alert) return null;

    const normalizedAlert = normalizeAlert(alert);

    const renderStatusBadge = (status) => {
        const statusText = {
            [ALERT_STATES.OPEN]: 'Abierta',
            [ALERT_STATES.CLOSED]: 'Cerrada'
        }[status] || 'Ignorada';

        return (
            <span className={`${styles.statusBadge} ${styles[status || ALERT_STATES.IGNORED]}`}>
                {statusText}
            </span>
        );
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
                            <div>
                                <span className={styles.label}>Estado:</span>
                                {renderStatusBadge(normalizedAlert.status)}
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

                    <ErrorMessage message={error} />
                </div>

                <div className={styles.modalFooter}>
                    {!normalizedAlert.status && (
                        <Button
                            onClick={() => markForReview(alert)}
                            disabled={isLoading}
                            variant="success"
                        >
                            Marcar para revisión
                        </Button>
                    )}
                    {isReviewTab && normalizedAlert.status === ALERT_STATES.OPEN && (
                        <Button
                            onClick={() => closeAlert(normalizedAlert.id)}
                            disabled={isLoading}
                            variant="danger"
                        >
                            Cerrar Alerta
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertDetailModal; 