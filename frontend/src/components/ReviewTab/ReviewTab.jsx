import React from 'react';
import styles from './ReviewTab.module.css';

const ReviewTab = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Alertas en Revisión</h2>
      <p className={styles.comingSoon}>Próximamente: Gestión de alertas en revisión</p>
      <ul className={styles.featureList}>
        <li>Visualización de alertas abiertas</li>
        <li>Sistema de notas y comentarios</li>
        <li>Cambio de estado de alertas</li>
        <li>Historial de modificaciones</li>
      </ul>
    </div>
  );
};

export default ReviewTab; 