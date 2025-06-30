import React from 'react';
import styles from './ReviewPage.module.css';
import ReviewTab from '../../components/ReviewTab/ReviewTab';
import Navbar from '../../components/Navbar/Navbar';

const ReviewPage = () => {
    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Alertas en Revisión</h2>
                    <ReviewTab state="abierta" />
                </div>
                
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Alertas Cerradas</h2>
                    <ReviewTab state="cerrada" showNotes={false} />
                </div>
            </div>
        </>
    );
};

export default ReviewPage; 