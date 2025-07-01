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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>Regla</p>
                <p className={styles.tooltipRule}>{data.name}</p>
                <p className={styles.tooltipValue}>
                    <span className={styles.tooltipCount}>{data.count}</span>
                    <span className={styles.tooltipUnit}> alertas</span>
                </p>
            </div>
        );
    }
    return null;
};

const TopRulesBarChart = ({ data, showOnlyLegends = false, showOnlyGraphic = false, showTitle = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.container}>
                {showTitle && <h3 className={styles.title}>Reglas más Frecuentes</h3>}
                <div className={styles.noData}>
                    No hay datos disponibles para mostrar
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);

    const statsData = data.map((item, index) => ({
        ...item,
        index: index + 1,
        percentage: ((item.count / total) * 100).toFixed(1)
    }));

    const renderStats = () => (
        <div className={styles.stats}>
            <div className={styles.statItem}>
                <span className={styles.statLabel}>Total alertas:</span>
                <span className={styles.statValue}>{total}</span>
            </div>
            <div className={styles.statItem}>
                <span className={styles.statLabel}>Reglas únicas:</span>
                <span className={styles.statValue}>{data.length}</span>
            </div>
        </div>
    );

    const renderGraphic = () => (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={statsData}
                    layout="vertical"
                    margin={{
                        top: 0,
                        right: 30,
                        left: 40,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis
                        type="number"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                        type="category"
                        dataKey="index"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        tickFormatter={(value) => `#${value}`}
                        ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

    const renderLegends = () => (
        <div className={styles.rulesList}>
            {statsData.map((rule) => (
                <div key={rule.name} className={styles.ruleItem}>
                    <span className={styles.ruleRank}>#{rule.index}</span>
                    <span className={styles.ruleName}>{rule.name}</span>
                    <span className={styles.ruleCount}>
                        {rule.count}
                        <span className={styles.rulePercentage}>
                            ({rule.percentage}%)
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            {showTitle && <h3 className={styles.title}>Reglas más frecuentes</h3>}
            <div className={styles.content}>
                {!showOnlyGraphic && !showOnlyLegends && renderStats()}
                {!showOnlyLegends && renderGraphic()}
                {!showOnlyGraphic && renderLegends()}
            </div>
        </div>
    );
};

export default TopRulesBarChart;