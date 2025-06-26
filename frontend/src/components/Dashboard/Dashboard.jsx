import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import DashboardPeriodSelector from './DashboardPeriodSelector/DashboardPeriodSelector';
import AlertsOverTimeChart from './AlertsOverTimeChart/AlertsOverTimeChart';
import RuleLevelsPieChart from './RuleLevelsPieChart/RuleLevelsPieChart';
import TopRulesBarChart from './TopRulesBarChart/TopRulesBarChart';
import { alertService } from '../../services/alertService';

const REFRESH_INTERVAL = 60000; // 1 minuto en milisegundos

const Dashboard = () => {
  const [period, setPeriod] = useState('daily');
  const [dashboardData, setDashboardData] = useState({
    alertsOverTime: [],
    ruleLevels: [],
    topRules: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await alertService.getDashboardStats(period);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      setDashboardData({
        alertsOverTime: [],
        ruleLevels: [],
        topRules: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos inicialmente
    fetchDashboardData();

    // Configurar intervalo de actualización
    const intervalId = setInterval(fetchDashboardData, REFRESH_INTERVAL);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [period]); // Se recrea el intervalo cuando cambia el período

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          Cargando datos del dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Dashboard de Alertas</h2>
        <DashboardPeriodSelector period={period} onPeriodChange={handlePeriodChange} />
      </div>
      
      {error ? (
        <div className={styles.errorState}>
          {error}
        </div>
      ) : (
        <div className={styles.chartsGrid}>
          <div className={styles.mainChart}>
            <AlertsOverTimeChart data={dashboardData.alertsOverTime} />
          </div>
          
          <div className={styles.middleCharts}>
            <div className={styles.chartCard}>
              <div className={styles.ruleLevelLegends}>
                <RuleLevelsPieChart data={dashboardData.ruleLevels} showOnlyLegends={true} />
              </div>
            </div>
            <div className={styles.chartCard}>
              <div className={styles.ruleLevelGraphic}>
                <RuleLevelsPieChart data={dashboardData.ruleLevels} showOnlyGraphic={true} />
              </div>
            </div>
          </div>

          <div className={styles.bottomCharts}>
            <div className={styles.chartCard}>
              <div className={styles.topRulesGraphic}>
                <TopRulesBarChart data={dashboardData.topRules} showOnlyGraphic={true} showTitle={true} />
              </div>
            </div>
            <div className={styles.chartCard}>
              <div className={styles.topRulesLegends}>
                <TopRulesBarChart data={dashboardData.topRules} showOnlyLegends={true} showTitle={false} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 