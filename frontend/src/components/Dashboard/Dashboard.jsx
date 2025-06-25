import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Dashboard de Alertas</h2>
      <p className={styles.comingSoon}>Próximamente: Gráficos y estadísticas de alertas</p>
    </div>
  );
};

export default Dashboard; 