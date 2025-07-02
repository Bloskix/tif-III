import React from 'react';
import styles from './HomePage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import Dashboard from '../../components/Dashboard/Dashboard';
import AlertsTab from '../../components/AlertsTab/AlertsTab';
import ReviewTab from '../../components/ReviewTab/ReviewTab';
import { useTabs } from '../../hooks/useTabs';

const HOME_TABS = [
    { id: 'alerts', label: 'Alertas' },
    { id: 'review', label: 'En revisión' },
];

const HomePage = () => {
    const { activeTab, setActiveTab, isTab, tabs } = useTabs(HOME_TABS, 'alerts');
    
    return (
        <div className={styles.root}>
            <Navbar />
            
            <main className={styles.container}>
                <section className={styles.dashboardSection}>
                    <Dashboard />
                </section>
        
                <section className={styles.tabsSection}>
                    <div className={styles.tabsHeader}>
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                className={`${styles.tabButton} ${isTab(tab.id) ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
        
                    <div className={styles.tabContent}>
                        {isTab('alerts') ? <AlertsTab /> : <ReviewTab />}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage; 