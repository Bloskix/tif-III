import React from 'react';
import styles from './AlertsTab.module.css';

const AlertsTab = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Alertas</h2>
      <p className={styles.comingSoon}>Próximamente: Lista de alertas desde OpenSearch</p>
      <ul className={styles.featureList}>
        <li>Visualización de alertas en tiempo real</li>
        <li>Filtros por fecha, agente y nivel</li>
        <li>Detalles completos de cada alerta</li>
      </ul>
    </div>
  );
};

export default AlertsTab; 