import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import styles from './AlertsFilters.module.css';
import Button from '../Button/Button';
import Input from '../Input/Input';

// Registrar el idioma español
registerLocale('es', es);

// Componente personalizado para el DatePicker
const CustomDateInput = forwardRef(({ value, onClick, label, error, ...props }, ref) => (
    <Input
        ref={ref}
        value={value}
        onClick={onClick}
        label={label}
        error={error}
        readOnly
        {...props}
    />
));

CustomDateInput.displayName = 'CustomDateInput';

const AlertsFilters = ({ onApplyFilters }) => {
    const initialFormState = useMemo(() => ({
        fromDate: null,
        toDate: null,
        agentId: '',
        ruleLevel: '',
    }), []);

    const [formState, setFormState] = useState(initialFormState);
    const [dateError, setDateError] = useState(null);
    const today = useMemo(() => new Date(), []);

    const validateDates = useCallback((newFromDate, newToDate) => {
        if (newToDate && newFromDate && newFromDate > newToDate) {
            return { message: 'La fecha desde no puede ser posterior a la fecha hasta' };
        }
        if (newFromDate && newToDate && newToDate < newFromDate) {
            return { message: 'La fecha hasta no puede ser anterior a la fecha desde' };
        }
        return null;
    }, []);

    const handleDateChange = useCallback((date, name) => {
        setFormState(prevState => {
            const newFormState = {
                ...prevState,
                [name]: date
            };

            const error = validateDates(
                name === 'fromDate' ? date : prevState.fromDate,
                name === 'toDate' ? date : prevState.toDate
            );
            setDateError(error);

            return newFormState;
        });
    }, [validateDates]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (dateError) {
            return;
        }

        const filters = {
            from_date: formState.fromDate ? formState.fromDate.toISOString() : null,
            to_date: formState.toDate ? formState.toDate.toISOString() : null,
            agent_ids: formState.agentId || null,
            rule_levels: formState.ruleLevel ? parseInt(formState.ruleLevel) : null
        };

        onApplyFilters(filters);
    }, [dateError, formState, onApplyFilters]);

    const handleReset = useCallback(() => {
        setFormState(initialFormState);
        setDateError(null);
        onApplyFilters({});
    }, [initialFormState, onApplyFilters]);

    return (
        <form onSubmit={handleSubmit} className={styles.filtersForm}>
            <div className={styles.filterRow}>
                <DatePicker
                    selected={formState.fromDate}
                    onChange={(date) => handleDateChange(date, 'fromDate')}
                    selectsStart
                    startDate={formState.fromDate}
                    endDate={formState.toDate}
                    maxDate={today}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    customInput={
                        <CustomDateInput
                            label="Fecha desde"
                            error={dateError}
                            placeholder="Selecciona fecha"
                        />
                    }
                    isClearable
                />

                <DatePicker
                    selected={formState.toDate}
                    onChange={(date) => handleDateChange(date, 'toDate')}
                    selectsEnd
                    startDate={formState.fromDate}
                    endDate={formState.toDate}
                    minDate={formState.fromDate}
                    maxDate={today}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    customInput={
                        <CustomDateInput
                            label="Fecha hasta"
                            error={dateError}
                            placeholder="Selecciona fecha"
                        />
                    }
                    isClearable
                />
            </div>

            <div className={styles.filterRow}>
                <Input
                    type="text"
                    name="agentId"
                    value={formState.agentId}
                    onChange={handleInputChange}
                    label="ID de agente"
                    placeholder="Ej: 001"
                />

                <Input
                    as="select"
                    name="ruleLevel"
                    value={formState.ruleLevel}
                    onChange={handleInputChange}
                    label="Nivel de regla"
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
                </Input>
            </div>

            <div className={styles.buttonRow}>
                <Button 
                    type="submit" 
                    disabled={!!dateError}
                    variant="success"
                >
                    Aplicar filtros
                </Button>
                <Button 
                    type="button" 
                    onClick={handleReset}
                    variant="danger"
                >
                    Limpiar filtros
                </Button>
            </div>
        </form>
    );
};

export default AlertsFilters; 