import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import styles from './RuleLevelsPieChart.module.css';

const COLORS = {
    alto: '#ef4444',    // Rojo para nivel >= 10
    medio: '#f59e0b',   // Amarillo para 5 <= nivel < 10
    bajo: '#10b981',    // Verde para nivel < 5
};

const getLevelCategory = (level) => {
    if (level >= 10) return 'alto';
    if (level >= 5) return 'medio';
    return 'bajo';
};

const RuleLevelsPieChart = ({ data, showOnlyLegends = false, showOnlyGraphic = false }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.container}>
                {!showOnlyGraphic && <h3 className={styles.title}>Distribución por Nivel</h3>}
                <div className={styles.noData}>
                    No hay datos disponibles para mostrar
                </div>
            </div>
        );
    }

    // Agrupar los datos por categoría de nivel
    const groupedData = data.reduce((acc, item) => {
        const category = getLevelCategory(item.key);
        acc[category] = (acc[category] || 0) + item.doc_count;
        return acc;
    }, {});

    const total = Object.values(groupedData).reduce((sum, value) => sum + value, 0);

    // Preparar los datos para el gráfico
    const chartData = Object.entries(groupedData)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
            name: key,
            value,
            percentage: ((value / total) * 100).toFixed(1)
        }));

    // Preparar los datos para las leyendas
    const legendData = data.map(item => ({
        level: item.key,
        value: item.doc_count,
        percentage: ((item.doc_count / total) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const renderLegends = () => (
        <div className={styles.stats}>
            {legendData.map(({ level, value, percentage }) => (
                <div key={level} className={styles.statItem}>
                    <span 
                        className={styles.statDot}
                        style={{ backgroundColor: COLORS[getLevelCategory(level)] }}
                    />
                    <span className={styles.statLabel}>Nivel {level}:</span>
                    <span className={styles.statValue}>
                        {value}
                        <span className={styles.statPercentage}>
                            ({percentage}%)
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );

    const renderGraphic = () => (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                    >
                        {chartData.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[entry.name]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const { name, value, percentage } = payload[0].payload;
                                return (
                                    <div className={styles.tooltip}>
                                        <p className={styles.tooltipLabel}>
                                            {name === 'bajo' ? 'Nivel Bajo' : 
                                             name === 'medio' ? 'Nivel Medio' : 
                                             'Nivel Alto'}
                                        </p>
                                        <p className={styles.tooltipValue}>
                                            <span className={styles.tooltipCount}>{value}</span>
                                            <span className={styles.tooltipUnit}> alertas</span>
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className={styles.container}>
            {!showOnlyGraphic && <h3 className={styles.title}>Distribución por Nivel</h3>}
            <div className={styles.content}>
                {!showOnlyGraphic && renderLegends()}
                {!showOnlyLegends && renderGraphic()}
            </div>
        </div>
    );
};

export default RuleLevelsPieChart; 