import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import DashboardPeriodSelector from './DashboardPeriodSelector/DashboardPeriodSelector';
import AlertsOverTimeChart from './AlertsOverTimeChart/AlertsOverTimeChart';
import RuleLevelsPieChart from './RuleLevelsPieChart/RuleLevelsPieChart';
import TopRulesBarChart from './TopRulesBarChart/TopRulesBarChart';
import { alertService } from '../../services/alertService';

const Dashboard = () => {
  const [period, setPeriod] = useState('daily');
  const [dashboardData, setDashboardData] = useState({
    alertsOverTime: [],
    ruleLevels: [],
    topRules: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchDashboardData();
  }, [period]);

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
          
          <div className={styles.secondaryCharts}>
            <div className={styles.chartCard}>
              <RuleLevelsPieChart data={dashboardData.ruleLevels} />
            </div>
            <div className={styles.chartCard}>
              <TopRulesBarChart data={dashboardData.topRules} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 