import React from 'react';
import styles from './ReviewPage.module.css';
import ReviewTab from '../../components/ReviewTab/ReviewTab';
import Navbar from '../../components/Navbar/Navbar';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import { useReviewTabs } from '../../hooks/useReviewTabs';

const ReviewPage = () => {
    const {
        activeTab,
        setActiveTab,
        getCurrentTabState,
        shouldShowNotes,
        tabs
    } = useReviewTabs();

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
                            state={getCurrentTabState()} 
                            showNotes={shouldShowNotes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage; 