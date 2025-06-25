import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import styles from './RuleLevelsPieChart.module.css';

const COLORS = {
    'Alto': '#ef4444',
    'Medio': '#f59e0b',
    'Bajo': '#10b981'
};

const RuleLevelsPieChart = ({ data }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Distribución por Nivel</h3>
            <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry) => (
                    <Cell
                        key={entry.level}
                        fill={COLORS[entry.level]}
                        stroke="white"
                        strokeWidth={2}
                    />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    'Alertas'
                    ]}
                    contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '0.75rem',
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                    <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                        {value}
                    </span>
                    )}
                />
                </PieChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RuleLevelsPieChart; 