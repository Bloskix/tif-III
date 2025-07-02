import React from 'react';
import styles from './ReviewPage.module.css';
import ReviewTab from '../../components/ReviewTab/ReviewTab';
import Navbar from '../../components/Navbar/Navbar';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import { useTabs } from '../../hooks/useTabs';

const REVIEW_TABS = [
    { id: 'abiertas', label: 'Alertas en Revisión' },
    { id: 'cerradas', label: 'Alertas Cerradas' },
];

const ReviewPage = () => {
    const { activeTab, setActiveTab, isTab, tabs } = useTabs(REVIEW_TABS, 'abiertas');

    return (
        <div className={styles.root}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.content}>
                    <SidebarMenu 
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        options={tabs}
                    />
                    <div className={styles.mainPanel}>
                        <ReviewTab 
                            state={isTab('abiertas') ? 'abierta' : 'cerrada'} 
                            showNotes={isTab('abiertas')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage; 