import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './TopRulesBarChart.module.css';

const TopRulesBarChart = ({ data }) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Reglas más Frecuentes</h3>
            <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={data}
                layout="vertical"
                margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis
                    type="number"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '0.75rem',
                    }}
                    formatter={(value) => [value, 'Alertas']}
                />
                <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TopRulesBarChart; 