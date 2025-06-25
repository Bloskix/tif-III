import React, { useState } from 'react';
import styles from './AlertsFilters.module.css';
import Input from '../Input/Input';

const AlertsFilters = ({ onApplyFilters }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        agentIds: '',
        ruleLevels: '',
        fromDate: '',
        toDate: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Procesar los valores antes de enviarlos
        const processedFilters = {
        agent_ids: filters.agentIds ? filters.agentIds.split(',').map(id => id.trim()) : undefined,
        rule_levels: filters.ruleLevels ? filters.ruleLevels.split(',').map(level => parseInt(level.trim())).filter(level => !isNaN(level)) : undefined,
        from_date: filters.fromDate || undefined,
        to_date: filters.toDate || undefined
        };

        onApplyFilters(processedFilters);
    };

const handleReset = () => {
    setFilters({
        agentIds: '',
        ruleLevels: '',
        fromDate: '',
        toDate: '',
    });
    onApplyFilters({});
    };

    return (
        <div className={styles.container}>
            <button 
            className={styles.toggleButton}
            onClick={() => setIsExpanded(!isExpanded)}
            >
            {isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
    
            {isExpanded && (
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                <Input
                    type="text"
                    name="agentIds"
                    value={filters.agentIds}
                    onChange={handleInputChange}
                    placeholder="IDs de agentes (separados por coma)"
                    label="IDs de agentes"
                />
                </div>
            
                <div className={styles.inputGroup}>
                <Input
                    type="text"
                    name="ruleLevels"
                    value={filters.ruleLevels}
                    onChange={handleInputChange}
                    placeholder="Niveles de reglas (separados por coma)"
                    label="Niveles de reglas"
                />
                </div>
            
                <div className={styles.dateGroup}>
                <Input
                    type="datetime-local"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleInputChange}
                    label="Desde"
                />
                <Input
                    type="datetime-local"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleInputChange}
                    label="Hasta"
                />
                </div>
            
                <div className={styles.buttonGroup}>
                <button type="submit" className={styles.applyButton}>
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
            )}
        </div>
    );
};

export default AlertsFilters; 