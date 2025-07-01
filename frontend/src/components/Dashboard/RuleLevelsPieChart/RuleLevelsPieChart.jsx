import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import styles from './RuleLevelsPieChart.module.css';

const COLORS = {
    alto: '#ef4444',
    medio: '#f59e0b',
    bajo: '#10b981',
};

const LEVEL_LABELS = {
    bajo: 'Nivel Bajo',
    medio: 'Nivel Medio',
    alto: 'Nivel Alto'
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
                {!showOnlyGraphic && <h3 className={styles.title}>Distribución por Nivel de Riesgo</h3>}
                <div className={styles.noData}>
                    No hay datos disponibles para mostrar
                </div>
            </div>
        );
    }

    const processData = () => {
        const groupedData = data.reduce((acc, item) => {
            const category = getLevelCategory(item.key);
            acc[category] = (acc[category] || 0) + item.doc_count;
            return acc;
        }, {});

        const total = Object.values(groupedData).reduce((sum, value) => sum + value, 0);

        const chartData = Object.entries(groupedData)
            .filter(([_, value]) => value > 0)
            .map(([key, value]) => ({
                name: key,
                value,
                percentage: ((value / total) * 100).toFixed(1)
            }));

        const legendData = data
            .map(item => ({
                level: item.key,
                category: getLevelCategory(item.key),
                value: item.doc_count,
                percentage: ((item.doc_count / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);

        return { chartData, legendData };
    };

    const { chartData, legendData } = processData();

    const renderCustomLegend = () => (
        <div className={styles.customLegend}>
            {Object.entries(LEVEL_LABELS).map(([category, label]) => {
                const categoryItems = legendData.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                    <div key={category} className={styles.legendCategory}>
                        <div className={styles.categoryHeader}>
                            <span 
                                className={styles.categoryDot}
                                style={{ backgroundColor: COLORS[category] }}
                            />
                            <span className={styles.categoryLabel}>{label}</span>
                        </div>
                        <div className={styles.categoryItems}>
                            {categoryItems.map(item => (
                                <div key={item.level} className={styles.legendItem}>
                                    <span className={styles.levelLabel}>Nivel {item.level}:</span>
                                    <span className={styles.levelValue}>
                                        {item.value}
                                        <span className={styles.levelPercentage}>
                                            ({item.percentage}%)
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
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
                                            {LEVEL_LABELS[name]}
                                        </p>
                                        <p className={styles.tooltipValue}>
                                            <span className={styles.tooltipCount}>{value}</span>
                                            <span className={styles.tooltipUnit}> alertas</span>
                                            <span className={styles.tooltipPercentage}> ({percentage}%)</span>
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
            {!showOnlyGraphic && <h3 className={styles.title}>Distribución por Nivel de Riesgo</h3>}
            <div className={styles.content}>
                {!showOnlyLegends && renderGraphic()}
                {!showOnlyGraphic && renderCustomLegend()}
            </div>
        </div>
    );
};

export default RuleLevelsPieChart; 