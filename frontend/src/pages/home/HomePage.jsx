import React, { useState } from 'react';
import styles from './HomePage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import Dashboard from '../../components/Dashboard/Dashboard';
import AlertsTab from '../../components/AlertsTab/AlertsTab';
import ReviewTab from '../../components/ReviewTab/ReviewTab';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('alerts'); 
    
    return (
        <div className={styles.root}>
            <Navbar />
            
            <main className={styles.container}>
                {/* Dashboard section */}
                <section className={styles.dashboardSection}>
                    <Dashboard />
                </section>
        
                {/* Tabs section */}
                <section className={styles.tabsSection}>
                    <div className={styles.tabsHeader}>
                        <button 
                        className={`${styles.tabButton} ${activeTab === 'alerts' ? styles.active : ''}`}
                        onClick={() => setActiveTab('alerts')}
                        >
                        Alertas
                        </button>
                        <button 
                        className={`${styles.tabButton} ${activeTab === 'review' ? styles.active : ''}`}
                        onClick={() => setActiveTab('review')}
                        >
                        En revisión
                        </button>
                    </div>
        
                    <div className={styles.tabContent}>
                        {activeTab === 'alerts' ? <AlertsTab /> : <ReviewTab />}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage; 