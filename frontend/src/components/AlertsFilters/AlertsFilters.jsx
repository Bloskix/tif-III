import React, { useState, useEffect } from 'react';
import styles from './AlertsFilters.module.css';

const AlertsFilters = ({ onApplyFilters }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [agentId, setAgentId] = useState('');
    const [ruleLevel, setRuleLevel] = useState('');
    const [dateError, setDateError] = useState('');

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);
        
        // Validar que la fecha desde no sea mayor que la fecha hasta
        if (toDate && newFromDate > toDate) {
            setDateError('La fecha desde no puede ser posterior a la fecha hasta');
        } else {
            setDateError('');
        }
    };

    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);
        
        // Validar que la fecha hasta no sea menor que la fecha desde
        if (fromDate && newToDate < fromDate) {
            setDateError('La fecha hasta no puede ser anterior a la fecha desde');
        } else {
            setDateError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Si hay error de fechas, no permitir el envío
        if (dateError) {
            return;
        }

        const filters = {
            from_date: fromDate ? new Date(fromDate).toISOString() : null,
            to_date: toDate ? new Date(toDate).toISOString() : null,
            agent_ids: agentId ? agentId : null,
            rule_levels: ruleLevel ? parseInt(ruleLevel) : null
        };

        onApplyFilters(filters);
    };

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        setAgentId('');
        setRuleLevel('');
        setDateError('');
        onApplyFilters({});
    };

    return (
        <form onSubmit={handleSubmit} className={styles.filtersForm}>
            <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                    <label htmlFor="fromDate">Fecha desde:</label>
                    <input
                        type="date"
                        id="fromDate"
                        value={fromDate}
                        onChange={handleFromDateChange}
                        max={today}
                        className={`${styles.input} ${dateError && styles.inputError}`}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="toDate">Fecha hasta:</label>
                    <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={handleToDateChange}
                        max={today}
                        min={fromDate || ''}
                        className={`${styles.input} ${dateError && styles.inputError}`}
                    />
                </div>
            </div>
            {dateError && (
                <div className={styles.errorMessage}>
                    {dateError}
                </div>
            )}

            <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                    <label htmlFor="agentId">ID de agente:</label>
                    <input
                        type="text"
                        id="agentId"
                        value={agentId}
                        onChange={(e) => setAgentId(e.target.value)}
                        placeholder="Ej: 001"
                        className={styles.input}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="ruleLevel">Nivel de regla:</label>
                    <select
                        id="ruleLevel"
                        value={ruleLevel}
                        onChange={(e) => setRuleLevel(e.target.value)}
                        className={styles.input}
                    >
                        <option value="">Todos</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                    </select>
                </div>
            </div>

            <div className={styles.buttonRow}>
                <button 
                    type="submit" 
                    className={styles.applyButton}
                    disabled={!!dateError}
                >
                    Aplicar filtros
                </button>
                <button 
                    type="button" 
                    onClick={handleReset}
                    className={styles.resetButton}
                >
                    Limpiar filtros
                </button>
            </div>
        </form>
    );
};

export default AlertsFilters; 