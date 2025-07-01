import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import DashboardPeriodSelector from './DashboardPeriodSelector/DashboardPeriodSelector';
import AlertsOverTimeChart from './AlertsOverTimeChart/AlertsOverTimeChart';
import RuleLevelsPieChart from './RuleLevelsPieChart/RuleLevelsPieChart';
import TopRulesBarChart from './TopRulesBarChart/TopRulesBarChart';
import { useDashboardData } from '../../hooks/useDashboardData';

const Dashboard = () => {
  const [period, setPeriod] = useState('weekly');
  const { dashboardData, loading, error } = useDashboardData(period);

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
            <AlertsOverTimeChart data={dashboardData.alertsOverTime} period={period} />
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