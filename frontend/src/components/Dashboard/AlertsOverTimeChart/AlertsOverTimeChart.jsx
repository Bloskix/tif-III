import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import styles from './AlertsOverTimeChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>
                    <span className={styles.tooltipCount}>{payload[0].value}</span>
                    <span className={styles.tooltipUnit}> alertas</span>
                </p>
            </div>
        );
    }
    return null;
};

const AlertsOverTimeChart = ({ data }) => {
    // Si no hay datos, mostrar mensaje
    if (!data || data.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Alertas a lo largo del tiempo</h3>
                <div className={styles.noData}>
                    No hay datos disponibles para mostrar
                </div>
            </div>
        );
    }

    // Calcular algunos datos estadísticos
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const max = Math.max(...data.map(item => item.count));
    const min = Math.min(...data.map(item => item.count));
    const avg = total / data.length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Alertas a lo largo del tiempo</h3>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total:</span>
                        <span className={styles.statValue}>{total}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Máximo:</span>
                        <span className={styles.statValue}>{max}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Mínimo:</span>
                        <span className={styles.statValue}>{min}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Promedio:</span>
                        <span className={styles.statValue}>{Math.round(avg)}</span>
                    </div>
                </div>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6b7280' }}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="top"
                            height={36}
                            formatter={() => (
                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                    Número de alertas
                                </span>
                            )}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AlertsOverTimeChart; 