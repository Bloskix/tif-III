import React from 'react';
import styles from './DashboardPeriodSelector.module.css';

const periods = [
    { value: 'daily', label: 'Diario' },
    { value: 'monthly', label: 'Mensual' }
];

const DashboardPeriodSelector = ({ period, onPeriodChange }) => {
    return (
        <div className={styles.container}>
            <label className={styles.label}>Vista:</label>
            <div className={styles.buttonGroup}>
            {periods.map(({ value, label }) => (
                <button
                key={value}
                className={`${styles.button} ${period === value ? styles.active : ''}`}
                onClick={() => onPeriodChange(value)}
                >
                {label}
                </button>
            ))}
            </div>
        </div>
    );
};

export default DashboardPeriodSelector; 